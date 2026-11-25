"""Opt-in local multimedia orchestration. No installs, paid APIs or automatic publishing."""
import argparse
import copy
import http.client
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time
import uuid
from urllib.parse import urlencode

import blender_bridge
import check_media
import smart_video

MIB = 1024 * 1024
ROOT = Path(__file__).resolve().parents[1]
VIDEO = {'.mp4', '.webm', '.mov', '.mkv'}
IMAGE = {'.png', '.jpg', '.jpeg', '.webp'}


def local_file(path, extensions, limit=512*MIB):
    path = Path(path).resolve(strict=True)
    if not path.is_file() or path.suffix.lower() not in extensions or not 0 < path.stat().st_size <= limit:
        raise ValueError('Unsupported local media file or size')
    return path


def safe_name(name, subfolder=False):
    if not isinstance(name, str) or not name or len(name)>512 or '\\' in name or ':' in name or any(ord(c)<32 for c in name):
        raise ValueError('Invalid ComfyUI file reference')
    parts = name.split('/')
    if any(p in ('', '.', '..') for p in parts) or (not subfolder and len(parts)!=1):
        raise ValueError('Invalid ComfyUI file reference')
    return name


def load_graph(path):
    path = Path(path)
    if path.stat().st_size > 2*MIB:
        raise ValueError('Workflow exceeds 2 MiB')
    graph = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(graph, dict) or not 0 < len(graph)<=500:
        raise ValueError('Export a ComfyUI API-format workflow')
    for key, node in graph.items():
        if not re.fullmatch(r'[A-Za-z0-9_.:-]{1,100}', key) or not isinstance(node, dict) or not isinstance(node.get('class_type'),str) or not isinstance(node.get('inputs'),dict):
            raise ValueError('Export a ComfyUI API-format workflow, not a canvas workflow')
    return graph


def bind_graph(graph, prompt=None, prompt_node=None, image_name=None, image_node=None):
    graph = copy.deepcopy(graph)
    if (prompt is None)!=(prompt_node is None) or (image_name is None)!=(image_node is None):
        raise ValueError('Pair each prompt/image with its node ID')
    for value, node_id, field, kind in ((prompt,prompt_node,'text','CLIPTextEncode'),(image_name,image_node,'image','LoadImage')):
        if value is None: continue
        node=graph.get(node_id,{})
        if node.get('class_type')!=kind or not isinstance(node.get('inputs',{}).get(field),str):
            raise ValueError(f'Expected literal {field} on {kind} node {node_id}')
        if not isinstance(value,str) or not value.strip() or len(value)>8000:
            raise ValueError('Invalid input text')
        if field=='image': safe_name(value,True)
        node['inputs'][field]=value
    return graph


class ComfyLocal:
    def __init__(self, port=8188):
        if type(port) is not int or not 1<=port<=65535: raise ValueError('Invalid local port')
        self.port=port

    def request(self, route, payload=None, limit=8*MIB, timeout=15, destination=None):
        # Fixed loopback, no proxies, redirects, credentials or arbitrary hosts.
        conn=http.client.HTTPConnection('127.0.0.1',self.port,timeout=timeout)
        try:
            body=None if payload is None else json.dumps(payload,allow_nan=False).encode()
            conn.request('GET' if body is None else 'POST',route,body=body,headers={'Content-Type':'application/json'} if body is not None else {})
            with conn.getresponse() as response:
                if response.status!=200: raise ValueError(f'ComfyUI HTTP {response.status} on {route.split("?")[0]}')
                if destination is not None:
                    count=0
                    with Path(destination).open("xb") as f:
                        while chunk:=response.read(256*1024):
                            count+=len(chunk)
                            if count>limit: raise ValueError("ComfyUI output exceeds limit")
                            f.write(chunk)
                    if not count: raise ValueError("Empty ComfyUI output")
                    return count
                raw=response.read(limit+1)
                if len(raw)>limit: raise ValueError('ComfyUI response exceeds limit')
                return raw
        finally:
            conn.close()

    def json(self, route, payload=None):
        return json.loads(self.request(route,payload))

    def validate_local_nodes(self, graph):
        for name in sorted({n['class_type'] for n in graph.values()}):
            if not re.fullmatch(r'[A-Za-z0-9_. -]{1,150}',name): raise ValueError('Unsupported node class name')
            from urllib.parse import quote
            meta=self.json('/object_info/'+quote(name,safe='')).get(name)
            if not isinstance(meta,dict) or meta.get('api_node') or meta.get('is_api_node'):
                raise ValueError(f'Unknown or API-backed node: {name}')
        # Metadata cannot prove a custom node is offline; only use reviewed local workflows.

    def generate(self, graph, output_node, kind, directory, timeout=1800, index=0):
        if output_node not in graph: raise ValueError('Output node not present in workflow')
        self.validate_local_nodes(graph)
        job=self.json('/prompt',{'prompt':graph,'client_id':str(uuid.uuid4())})
        job_id=job.get('prompt_id')
        if not isinstance(job_id,str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}',job_id) or job.get('node_errors'):
            raise ValueError('ComfyUI rejected workflow')
        deadline=time.monotonic()+timeout
        while time.monotonic()<deadline:
            entry=self.json('/history/'+job_id).get(job_id)
            if entry is not None:
                status=entry.get('status',{})
                if status.get('status_str')=='error': raise ValueError(f'ComfyUI job failed: {job_id}')
                if status.get('completed') is True:
                    ref=select_output(entry,output_node,kind,index)
                    path=Path(directory)/('source'+Path(ref['filename']).suffix.lower())
                    self.request('/view?'+urlencode(ref),limit=512*MIB if kind=='video' else 32*MIB,timeout=60,destination=path)
                    return path
            time.sleep(min(1,max(0,deadline-time.monotonic())))
        raise TimeoutError(f'ComfyUI job {job_id} still pending; check local UI. No global interrupt sent.')


def select_output(entry,node,kind,index=0):
    if type(index) is not int or index<0: raise ValueError('Invalid output index')
    output=entry.get('outputs',{}).get(node,{})
    ext=VIDEO if kind=='video' else IMAGE
    found=[]
    for key in ('videos','gifs','images'):
        for item in output.get(key,[]):
            if not isinstance(item,dict) or item.get('type')!='output': continue
            name=safe_name(item.get('filename'))
            folder=item.get('subfolder','')
            if folder: safe_name(folder,True)
            if Path(name).suffix.lower() in ext:
                ref={'filename':name,'subfolder':folder,'type':'output'}
                if ref not in found: found.append(ref)
    if index>=len(found): raise ValueError('Requested saved media output not found')
    return found[index]


def wan_command(repo, checkpoints, python, prompt, destination, image=None, frames=49, seed=42, size='1280*704'):
    if not isinstance(prompt,str) or not 0<len(prompt.strip())<=8000: raise ValueError('Provide a prompt (1–8000 characters)')
    if type(frames) is not int or not 5<=frames<=121 or frames%4!=1: raise ValueError('Frames must be 4n+1 between 5 and 121')
    if type(seed) is not int or not 0<=seed<2**32: raise ValueError('Invalid seed')
    if size not in ('1280*704','704*1280'): raise ValueError('Unsupported TI2V-5B size')
    repo=Path(repo).resolve(); checkpoints=Path(checkpoints).resolve()
    if not (repo/'generate.py').is_file() or not checkpoints.is_dir() or not any(checkpoints.iterdir()): raise ValueError('Install trusted Wan repository and TI2V-5B checkpoints first')
    exe=shutil.which(str(python))
    if not exe: raise ValueError('Wan Python environment not found')
    cmd=[exe,str(repo/'generate.py'),'--task','ti2v-5B','--size',size,'--ckpt_dir',str(checkpoints),'--offload_model','True','--convert_model_dtype','--t5_cpu','--frame_num',str(frames),'--base_seed',str(seed),'--prompt',prompt,'--save_file',str(Path(destination).absolute())]
    if image is not None: cmd+=['--image',str(local_file(image,IMAGE,32*MIB))]
    return cmd


def hardware_report():
    report=check_media.check()
    report['routes']={'wan': 'NVIDIA detected; verify CUDA, model and VRAM' if isinstance(report['gpu'],list) and report['gpu'] else 'NVIDIA not detected; direct Wan not recommended',
                      'comfy':'Optional local server; verify model/backend separately',
                      'blender':'Available' if report['tools']['blender'] else 'Install separately',
                      'user_media':'Available with FFmpeg and FFprobe' if all(report['tools'][x] for x in ('ffmpeg','ffprobe')) else 'Install FFmpeg and FFprobe'}
    return report


def frames_to_video(directory, fps, output):
    frames=sorted(Path(directory).glob('frame-*.png'))
    if not frames or not 12<=fps<=30: raise ValueError('Missing Blender frames or invalid FPS')
    matches=[re.fullmatch(r'frame-(\d+)\.png',p.name) for p in frames]
    if any(m is None for m in matches): raise ValueError('Unexpected frame names')
    nums=[int(m[1]) for m in matches]; width=len(matches[0][1])
    if nums!=list(range(nums[0],nums[0]+len(nums))) or any(len(m[1])!=width for m in matches): raise ValueError('Non-contiguous frame sequence')
    smart_video.run('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-n','-protocol_whitelist','file,pipe','-f','image2','-framerate',fps,'-start_number',nums[0],'-i',Path(directory)/f'frame-%0{width}d.png','-frames:v',len(nums),'-an','-c:v','libx264','-pix_fmt','yuv420p','-threads','2',output])
    return Path(output)


def optimize_image(source, output):
    source=local_file(source,IMAGE,32*MIB)
    # JPEG for opaque product artwork; original retained separately. No remote inputs.
    for q in (3,6,10,16,24,31):
        smart_video.run('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-protocol_whitelist','file,pipe','-f','image2','-pattern_type','none','-i',source,'-frames:v','1','-vf',smart_video.scale(1280),'-map_metadata','-1','-q:v',q,'-threads','2','-update','1',output])
        if 0<Path(output).stat().st_size<=smart_video.POSTER_BUDGET: return
    raise ValueError('Image exceeds 200 KiB budget')


def execute(a):
    if not a.execute:
        return {'mode':'plan','backend':a.backend,'kind':getattr(a,'kind','video'),'output':str(a.output),
                'stages':['prepare local source','optimize using FFmpeg','write receipt','manual review before publishing'],
                'note':'No generation, downloads, network requests or publication. Use --execute after reviewing trusted inputs.'}
    if a.backend in ('wan','comfy','blender') and not a.trust_local:
        raise ValueError('Review local code, workflow, model licenses and costs; pass --trust-local explicitly')
    if not all(shutil.which(x) for x in ('ffmpeg','ffprobe')): raise ValueError('FFmpeg and FFprobe required for media preparation')
    out=Path(a.output).absolute()
    if out.exists() or out.is_symlink(): raise ValueError('Output exists; use a new directory')
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.ai-media-',dir=out.parent) as tmp:
        work=Path(tmp); result=work/'result'; result.mkdir()
        kind=getattr(a,'kind','video')
        if a.backend=='user':
            source=local_file(a.input,VIDEO if kind=='video' else IMAGE,512*MIB if kind=='video' else 32*MIB)
        elif a.backend=='wan':
            source=result/'source.mp4'
            cmd=wan_command(a.repo,a.checkpoints,a.python,a.prompt,source,a.image,a.frames,a.seed,a.size)
            env=os.environ.copy(); env.update(HF_HUB_OFFLINE='1',TRANSFORMERS_OFFLINE='1',HF_HUB_DISABLE_TELEMETRY='1')
            # Offline flags are not a sandbox; run trusted code only.
            subprocess.run(cmd,cwd=Path(a.repo).resolve(),env=env,check=True,timeout=a.timeout)
            local_file(source,VIDEO)
        elif a.backend=='comfy':
            graph=bind_graph(load_graph(a.workflow),a.prompt,a.prompt_node,a.image_name,a.image_node)
            source=ComfyLocal(a.port).generate(graph,a.output_node,kind,result,a.timeout,a.index)
        else:
            scene=work/'blender'
            blender_bridge.main(['--config',str(a.config),'--output',str(scene),'--render','frames','--blender',a.blender,'--timeout',str(a.timeout)])
            cfg=json.loads((scene/'manifest.json').read_text())['config']
            source=frames_to_video(scene/'frames',cfg['fps'],result/'source.mp4')
            shutil.copyfile(scene/'scene.glb',result/'scene.glb')
        if kind=='video':
            smart_video.optimize(source,result/'web')
            media='web/manifest.json'
        else:
            (result/'web').mkdir()
            optimize_image(source,result/'web'/'image.jpg'); media='web/image.jpg'
        receipt={'schema':1,'backend':a.backend,'kind':kind,'web':media,'source_sha256':smart_video.digest(source),'publication':'manual review required'}
        (result/'job.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
        out.mkdir() # exclusive reservation, never overwrite
        try:
            for item in result.iterdir(): item.rename(out/item.name)
        except BaseException:
            shutil.rmtree(out); raise
    return receipt


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__); sub=p.add_subparsers(dest='backend',required=True)
    sub.add_parser('check',help='Local hardware preflight')
    for backend in ('user','wan','comfy','blender'):
        q=sub.add_parser(backend); q.add_argument('--output',type=Path,required=True); q.add_argument('--execute',action='store_true'); q.add_argument('--trust-local',action='store_true'); q.add_argument('--timeout',type=int,default=1800)
        if backend in ('user','comfy'): q.add_argument('--kind',choices=('video','image'),default='video')
        if backend=='user': q.add_argument('--input',type=Path,required=True)
        if backend=='wan':
            q.add_argument('--repo',type=Path,required=True); q.add_argument('--checkpoints',type=Path,required=True); q.add_argument('--python',default=sys.executable); q.add_argument('--prompt',required=True); q.add_argument('--image',type=Path); q.add_argument('--frames',type=int,default=49); q.add_argument('--seed',type=int,default=42); q.add_argument('--size',choices=('1280*704','704*1280'),default='1280*704')
        if backend=='comfy':
            q.add_argument('--workflow',type=Path,required=True); q.add_argument('--port',type=int,default=8188); q.add_argument('--output-node',required=True); q.add_argument('--index',type=int,default=0); q.add_argument('--prompt'); q.add_argument('--prompt-node'); q.add_argument('--image-name'); q.add_argument('--image-node')
        if backend=='blender': q.add_argument('--config',type=Path,default=blender_bridge.DEFAULT); q.add_argument('--blender',default='blender')
    a=p.parse_args(argv)
    if a.backend=='check': print(json.dumps(hardware_report(),indent=2)); return 0
    if not 1<=a.timeout<=86400: p.error('timeout must be 1–86400 seconds')
    try:
        print(json.dumps(execute(a),indent=2)); return 0
    except (OSError,ValueError,KeyError,TypeError,subprocess.SubprocessError,http.client.HTTPException) as exc:
        print(f'AI Multimedia: {exc}',file=sys.stderr); return 1


if __name__=='__main__': sys.exit(main())
