"""Optional local video pipeline: bounded H.264 variants and poster, staged publication."""
import argparse
import hashlib
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

MIB = 1024 * 1024
PROFILES = {
    'mobile': {'edge': 720, 'fps': 24, 'gop': 12, 'crf': 25, 'max_bytes': 2*MIB},
    'desktop': {'edge': 1280, 'fps': 30, 'gop': 15, 'crf': 23, 'max_bytes': 5*MIB},
}
POSTER_BUDGET = 200*1024
INPUT_LIMIT = 512*MIB
DURATION_LIMIT = 60
# Local, trusted media only. Do not allow network protocols or playlist demuxers.
INPUT_FLAGS = ['-protocol_whitelist', 'file,pipe', '-format_whitelist', 'mov,matroska,webm,avi,mpeg,mpegts']


def run(tool, args, timeout=180):
    executable = shutil.which(tool)
    if not executable:
        raise ValueError(f'Install {tool} and put it on PATH')
    result = subprocess.run([executable, *map(str, args)], check=True, capture_output=True, text=True, timeout=timeout)
    return result.stdout


def probe(path):
    return json.loads(run('ffprobe', ['-v','error', *INPUT_FLAGS, '-show_streams','-show_format','-of','json',path], 30))


def media_info(path):
    data = probe(path)
    videos = [s for s in data['streams'] if s['codec_type']=='video' and not s.get('disposition', {}).get('attached_pic')]
    if not videos:
        raise ValueError('No motion video stream found')
    s = videos[0]
    duration = float(s.get('duration') or data['format'].get('duration') or 0)
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError('Unknown or invalid video duration')
    w, h = int(s['width']), int(s['height'])
    if min(w,h)<2 or max(w,h)>8192 or w*h>34_000_000:
        raise ValueError('Unsupported video dimensions')
    return {'stream': s, 'duration': duration, 'width': w, 'height': h,
            'audio_tracks': sum(x['codec_type']=='audio' for x in data['streams'])}


def source_info(path):
    if not path.is_file() or path.stat().st_size>INPUT_LIMIT:
        raise ValueError('Provide a local video of at most 512 MiB')
    info = media_info(path)
    if info['duration']>DURATION_LIMIT:
        raise ValueError('Clip exceeds 60 seconds; trim explicitly before optimizing')
    if info['stream'].get('sample_aspect_ratio') not in (None,'N/A','0:1','1:1'):
        raise ValueError('Normalize anamorphic (non-square-pixel) video before optimizing')
    if info['stream'].get('color_transfer') in ('smpte2084','arib-std-b67'):
        raise ValueError('Convert HDR to SDR explicitly before optimizing')
    return info


def scale(edge):
    return f"scale=w='min({edge},iw)':h='min({edge},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1"


def encode(source, output, info, profile, crf):
    p = profile
    run('ffmpeg', ['-hide_banner','-loglevel','error','-nostdin','-y', *INPUT_FLAGS,'-i',source,
        '-map',f"0:{info['stream']['index']}",'-map_metadata','-1','-map_chapters','-1','-an','-sn','-dn',
        '-vf',f"{scale(p['edge'])},fps={p['fps']}",'-c:v','libx264','-preset','medium','-crf',crf,
        '-pix_fmt','yuv420p','-g',p['gop'],'-keyint_min',p['gop'],'-sc_threshold','0','-bf','0',
        '-movflags','+faststart','-threads','2',output])


def keyframe_gap(path, duration):
    data=json.loads(run('ffprobe',['-v','error',*INPUT_FLAGS,'-select_streams','v:0','-skip_frame','nokey',
        '-show_frames','-show_entries','frame=best_effort_timestamp_time,key_frame','-of','json',path],30))
    times=sorted(float(f['best_effort_timestamp_time']) for f in data['frames'] if f.get('key_frame')==1 and 'best_effort_timestamp_time' in f)
    if not times or abs(times[0])>0.05:
        raise ValueError('Missing initial keyframe')
    return max(b-a for a,b in zip([0,*times],[*times,duration]))


def validate_variant(path, original, p):
    info=media_info(path); s=info['stream']
    if s['codec_name']!='h264' or s['pix_fmt']!='yuv420p' or info['audio_tracks']:
        raise ValueError('Unexpected video codec, pixel format or audio')
    if max(info['width'],info['height'])>p['edge'] or info['width']%2 or info['height']%2:
        raise ValueError('Output dimensions exceed profile')
    num,den=map(int,s['avg_frame_rate'].split('/'))
    if not den or abs(num/den-p['fps'])>0.1:
        raise ValueError('Unexpected frame rate')
    if abs(info['duration']-original['duration'])>max(.12,2/p['fps']):
        raise ValueError('Unexpected duration change')
    gap=keyframe_gap(path,info['duration'])
    if gap>p['gop']/p['fps']+2/p['fps']:
        raise ValueError('Keyframe interval exceeds profile')
    return {'file':path.name,'bytes':path.stat().st_size,'width':info['width'],'height':info['height'],
            'fps':p['fps'],'duration':round(info['duration'],4),'max_keyframe_gap':round(gap,4),
            'mime':'video/mp4','sha256':digest(path)}


def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(MIB),b''):
            h.update(chunk)
    return h.hexdigest()


def create_poster(source, output, info):
    for q in (3,6,10,16,24,31):
        run('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y',*INPUT_FLAGS,'-i',source,
            '-map',f"0:{info['stream']['index']}",'-ss',min(.2,info['duration']/4),'-frames:v','1',
            '-vf',scale(720),'-q:v',q,'-threads','2','-update','1',output])
        if output.is_file() and 0<output.stat().st_size<=POSTER_BUDGET:
            return {'file':output.name,'bytes':output.stat().st_size,'mime':'image/jpeg','sha256':digest(output)}
    raise ValueError('Poster exceeds budget')


def optimize(source, output, profiles=('mobile','desktop'), max_mib=None):
    source=Path(source).resolve(); output=Path(output).absolute()
    if output.exists() or output.is_symlink():
        raise ValueError('Output directory already exists; choose a new destination')
    if not profiles or any(n not in PROFILES for n in profiles) or len(set(profiles))!=len(profiles):
        raise ValueError('Select distinct known profiles')
    if max_mib is not None and (not math.isfinite(max_mib) or not .001<=max_mib<=50):
        raise ValueError('Budget must be between .001 and 50 MiB per video')
    info=source_info(source); original_hash=digest(source)
    output.parent.mkdir(parents=True,exist_ok=True)
    # Reserve final directory exclusively only after validation; publish manifest last.
    with tempfile.TemporaryDirectory(prefix='.cine-video-',dir=output.parent) as tmp:
        stage=Path(tmp); variants={}
        for name in profiles:
            p=PROFILES[name]; budget=int(max_mib*MIB) if max_mib is not None else p['max_bytes']
            target=stage/f'{name}.mp4'
            for crf in range(p['crf'],39,3):
                encode(source,target,info,p,crf)
                if 0<target.stat().st_size<=budget:
                    break
            else:
                raise ValueError(f'{name} exceeds {budget} bytes at allowed quality; shorten or increase budget')
            variants[name]=validate_variant(target,info,p)|{'crf':crf,'budget_bytes':budget}
        poster=create_poster(source,stage/'poster.jpg',info)
        if digest(source)!=original_hash:
            raise ValueError('Source changed during processing')
        manifest={'version':1,'purpose':'scroll','source':{'bytes':source.stat().st_size,'sha256':original_hash,'duration':info['duration']},
                  'variants':variants,'poster':poster,'audio_removed':True}
        (stage/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
        output.mkdir() # atomic exclusive reservation, never overwrite existing destination
        try:
            for item in sorted(stage.iterdir(),key=lambda p:p.name=='manifest.json'):
                item.rename(output/item.name)
        except BaseException:
            shutil.rmtree(output)
            raise
    return manifest


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path); parser.add_argument('output_dir',type=Path)
    parser.add_argument('--profile',choices=['both',*PROFILES],default='both')
    parser.add_argument('--max-mib',type=float,help='Override size cap for each variant')
    args=parser.parse_args()
    try:
        result=optimize(args.source,args.output_dir,tuple(PROFILES) if args.profile=='both' else (args.profile,),args.max_mib)
    except (ValueError,OSError,subprocess.SubprocessError) as error:
        parser.exit(1,f'Video optimization failed: {error}\n{getattr(error,"stderr", "") or ""}\n')
    print(json.dumps(result,indent=2))


if __name__=='__main__':
    main()
