"""Optional local bridge. No shell, no downloads, no overwrites."""
import argparse
import json
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BRIDGE = ROOT/'integrations'/'blender'
sys.path.insert(0,str(BRIDGE))
from scene_config import load_config, DEFAULT


def validate_glb(path):
    path=Path(path)
    with path.open('rb') as f:
        header=f.read(12)
        if len(header)!=12: raise ValueError('Truncated GLB')
        magic,version,size=struct.unpack('<4sII',header)
        if magic!=b'glTF' or version!=2 or size!=path.stat().st_size: raise ValueError('Invalid GLB header')
        raw=f.read(8)
        if len(raw)!=8: raise ValueError('Missing GLB JSON chunk')
        length,kind=struct.unpack('<II',raw)
        if kind!=0x4E4F534A or length>min(size-20,16*1024*1024) or length%4: raise ValueError('Invalid GLB JSON chunk')
        data=json.loads(f.read(length))
    if data.get('asset',{}).get('version')!='2.0' or not data.get('meshes') or not data.get('animations') or not data.get('cameras'):
        raise ValueError('Expected glTF 2.0 meshes, animations and cameras')
    return {k:len(data.get(k,[])) for k in ('meshes','animations','cameras')}


def command(executable,config,output,render):
    return [str(executable),'--background','--factory-startup','--disable-autoexec','--python-exit-code','1','--python',str(BRIDGE/'build_scene.py'),'--','--config',str(config),'--output',str(output),'--render',render]


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--config',type=Path,default=DEFAULT); p.add_argument('--output',type=Path,default=ROOT/'generated'/'blender'/'coffee'); p.add_argument('--blender',default='blender'); p.add_argument('--render',choices=('none','poster','frames'),default='none'); p.add_argument('--dry-run',action='store_true'); p.add_argument('--timeout',type=int,default=1800)
    a=p.parse_args(argv); cfg=load_config(a.config); output=a.output.resolve(); exe=shutil.which(a.blender)
    if a.timeout<1: p.error('timeout must be positive')
    if a.dry_run:
        print(json.dumps({'blender':exe,'output':str(output),'render':a.render,'config':cfg},indent=2)); return 0
    if not exe: p.error('Blender 4.2+ not found; install separately or pass --blender /path/to/blender')
    if output.exists(): p.error('output already exists; choose a new directory (no overwrite)')
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.blender-',dir=output.parent) as tmp:
        stage=Path(tmp)/'result'; stage.mkdir(); frozen=Path(tmp)/'config.json'; frozen.write_text(json.dumps(cfg),encoding='utf-8')
        subprocess.run(command(exe,frozen,stage,a.render),check=True,timeout=a.timeout)
        summary=validate_glb(stage/'scene.glb')
        if not (stage/'scene.blend').is_file(): raise ValueError('Missing scene.blend')
        if a.render=='poster' and not (stage/'poster.png').is_file(): raise ValueError('Missing poster')
        if a.render=='frames' and len(list((stage/'frames').glob('frame-*.png')))!=1+round(cfg['duration']*cfg['fps']): raise ValueError('Incomplete frames')
        (stage/'manifest.json').write_text(json.dumps({'schema':1,'scene':'scene.glb','source':'scene.blend','config':cfg,'counts':summary,'render':a.render},indent=2),encoding='utf-8')
        if output.exists(): raise FileExistsError(output)
        stage.rename(output)
    print(f'Generated: {output}'); return 0

if __name__=='__main__':
    try: sys.exit(main())
    except (OSError,ValueError,subprocess.SubprocessError) as exc:
        print(f'Blender Bridge: {exc}',file=sys.stderr); sys.exit(1)
