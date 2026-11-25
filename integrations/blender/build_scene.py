"""Run inside Blender only. Builds a procedural original product scene."""
import argparse
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector
sys.path.insert(0, str(Path(__file__).resolve().parent))
from scene_config import load_config


def linear_color(value):
    rgb = [int(value[i:i+2], 16)/255 for i in (1,3,5)]
    return (*[v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb], 1)


def material(name, color, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = linear_color(color)
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = mat.diffuse_color
    bsdf.inputs['Roughness'].default_value = roughness
    return mat


def cup_mesh(segments):
    # Closed cross-section: underside, outer wall, rim, inner wall and floor.
    profile = [(0,-.85),(.66,-.85),(.78,-.70),(.98,.80),(.91,.80),(.72,-.65),(0,-.65)]
    verts, rings, faces = [], [], []
    for radius,z in profile:
        if radius == 0:
            rings.append([len(verts)]); verts.append((0,0,z))
        else:
            rings.append(list(range(len(verts),len(verts)+segments)))
            verts.extend((radius*math.cos(2*math.pi*i/segments),radius*math.sin(2*math.pi*i/segments),z) for i in range(segments))
    for a,b in zip(rings,rings[1:]):
        for i in range(segments):
            j=(i+1)%segments
            if len(a)==1: faces.append((a[0],b[j],b[i]))
            elif len(b)==1: faces.append((a[i],a[j],b[0]))
            else: faces.append((a[i],a[j],b[j],b[i]))
    mesh=bpy.data.meshes.new('CupGeometry'); mesh.from_pydata(verts,[],faces); mesh.update()
    ob=bpy.data.objects.new('CeramicCup',mesh); bpy.context.collection.objects.link(ob)
    for p in mesh.polygons: p.use_smooth=True
    return ob


def aim(ob, target):
    ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()


def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--config',required=True); parser.add_argument('--output',required=True); parser.add_argument('--render',choices=('none','poster','frames'),default='none')
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]); cfg=load_config(args.config); out=Path(args.output); out.mkdir(parents=True,exist_ok=True)
    if bpy.app.version < (4, 2, 0): raise RuntimeError('Blender 4.2+ required')
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene; scene.frame_start=1; scene.frame_end=1+round(cfg['duration']*cfg['fps']); scene.render.fps=cfg['fps']
    scene.render.resolution_x,scene.render.resolution_y=cfg['resolution']; scene.render.resolution_percentage=100
    scene.render.engine='CYCLES'; scene.cycles.device='CPU'; scene.cycles.samples=32; scene.cycles.use_denoising=True
    scene.world=bpy.data.worlds.new('Warm studio'); scene.world.use_nodes=True
    bg=scene.world.node_tree.nodes.get('Background'); bg.inputs[0].default_value=linear_color(cfg['background']); bg.inputs[1].default_value=.4
    ceramic=material('Ceramic',cfg['ceramic'],.34); liquid=material('Coffee',cfg['coffee'],.23)
    root=bpy.data.objects.new('Product',None); bpy.context.collection.objects.link(root)
    cup=cup_mesh(cfg['segments']); cup.data.materials.append(ceramic); cup.parent=root
    bpy.ops.mesh.primitive_torus_add(major_segments=cfg['segments'],minor_segments=12,major_radius=.46,minor_radius=.105,location=(.94,0,0),rotation=(math.pi/2,0,0))
    handle=bpy.context.object; handle.name='Handle'; handle.parent=root; handle.data.materials.append(ceramic)
    for p in handle.data.polygons: p.use_smooth=True
    bpy.ops.mesh.primitive_cylinder_add(vertices=cfg['segments'],radius=.865,depth=.035,location=(0,0,.69)); coffee=bpy.context.object; coffee.name='Coffee'; coffee.parent=root; coffee.data.materials.append(liquid)
    # Keyframes for product and camera, with render-independent export.
    for t in (0,.25,.5,.75,1):
        frame=1+round(t*(scene.frame_end-1)); root.rotation_euler.z=math.radians(cfg['rotation_degrees'])*t; root.location.z=.12*math.sin(2*math.pi*t)
        root.keyframe_insert('rotation_euler',frame=frame); root.keyframe_insert('location',frame=frame)
        handle.location.x=.94+.45*math.sin(math.pi*t)**2; handle.keyframe_insert('location',frame=frame)
    bpy.ops.object.camera_add(); cam=bpy.context.object; cam.name='CinematicCamera'; scene.camera=cam; cam.data.lens=48
    for t in (0,.25,.5,.75,1):
        frame=1+round(t*(scene.frame_end-1)); angle=-math.pi/3+.35*math.sin(2*math.pi*t); r=cfg['camera_radius']-.5*math.sin(math.pi*t)
        cam.location=(r*math.cos(angle),r*math.sin(angle),cfg['camera_height']); aim(cam,(0,0,0)); cam.keyframe_insert('location',frame=frame); cam.keyframe_insert('rotation_euler',frame=frame)
    for name, loc, power, color, size in [('Key',(3,-4,5),900,(1,.79,.58),4),('Fill',(-4,-1,2),500,(.72,.83,1),3),('Rim',(1,4,4),1100,(1,.55,.30),3)]:
        bpy.ops.object.light_add(type='AREA',location=loc); light=bpy.context.object; light.name=name; light.data.energy=power; light.data.color=color; light.data.shape='DISK'; light.data.size=size; aim(light,(0,0,0))
    scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(out/'scene.blend'))
    # Single scene animation keeps product and camera synchronized. Area lights are not glTF lights.
    bpy.ops.export_scene.gltf(filepath=str(out/'scene.glb'),export_format='GLB',export_animations=True,export_animation_mode='SCENE',export_cameras=True,export_lights=False,export_frame_range=True)
    scene.render.image_settings.file_format='PNG'
    if args.render=='poster':
        scene.frame_set(1); scene.render.filepath=str(out/'poster.png'); bpy.ops.render.render(write_still=True)
    elif args.render=='frames':
        (out/'frames').mkdir(); scene.render.filepath=str(out/'frames'/'frame-'); bpy.ops.render.render(animation=True)

if __name__=='__main__': main()
