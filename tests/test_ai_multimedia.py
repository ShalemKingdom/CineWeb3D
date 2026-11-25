import contextlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import ai_multimedia as ai

GRAPH={'1':{'class_type':'CLIPTextEncode','inputs':{'text':'old'}},'2':{'class_type':'LoadImage','inputs':{'image':'old.png'}},'3':{'class_type':'SaveVideo','inputs':{}}}

def entry(name='clip.mp4', kind='output'):
    return {'status':{'completed':True,'status_str':'success'},'outputs':{'3':{'gifs':[{'filename':name,'subfolder':'job','type':kind}]}}}

class MultimediaTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup); self.root=Path(self.temp.name)
    def test_plan_no_network_or_disk(self):
        with patch.object(ai.ComfyLocal,'request',side_effect=AssertionError), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(ai.main(['comfy','--workflow','missing.json','--output-node','3','--output',str(self.root/'out')]),0)
        self.assertFalse((self.root/'out').exists())
    def test_export_format(self):
        p=self.root/'workflow.json'; p.write_text(json.dumps(GRAPH)); self.assertEqual(ai.load_graph(p),GRAPH)
        p.write_text('{"nodes":[]}'); self.assertRaises(ValueError,ai.load_graph,p)
    def test_bind_copies(self):
        g=ai.bind_graph(GRAPH,'coffee','1','input/photo.png','2'); self.assertEqual(g['1']['inputs']['text'],'coffee'); self.assertEqual(g['2']['inputs']['image'],'input/photo.png'); self.assertEqual(GRAPH['1']['inputs']['text'],'old')
    def test_bind_requires_valid_node(self):
        for kwargs in ({'prompt':'a'},{'prompt':'a','prompt_node':'2'},{'image_name':'../secret.png','image_node':'2'}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError): ai.bind_graph(GRAPH,**kwargs)
    def test_saved_output_only(self):
        self.assertEqual(ai.select_output(entry(),'3','video')['filename'],'clip.mp4')
        for bad in (entry('../clip.mp4'),entry('clip.mp4','temp'),entry('photo.png')):
            with self.assertRaises(ValueError): ai.select_output(bad,'3','video')
        self.assertEqual(ai.select_output(entry('image.png'),'3','image')['filename'],'image.png')
    def test_output_index(self):
        with self.assertRaises(ValueError): ai.select_output(entry(),'3','video',1)
    def test_local_only_and_partner_nodes(self):
        c=ai.ComfyLocal(); self.assertRaises(ValueError,ai.ComfyLocal,0)
        with patch.object(c,'json',return_value={'CLIPTextEncode':{'api_node':True}}):
            self.assertRaises(ValueError,c.validate_local_nodes,{'1':GRAPH['1']})
    def test_comfy_job_download(self):
        c=ai.ComfyLocal()
        def respond(route,payload=None):
            if route.startswith('/object_info/'): return {route.split('/')[-1]:{'api_node':False}}
            if route=='/prompt': self.assertEqual(payload['prompt'],GRAPH); return {'prompt_id':'job-1','node_errors':{}}
            if route=='/history/job-1': return {'job-1':entry()}
            raise AssertionError(route)
        def download(route,**kw):
            kw['destination'].write_bytes(b'fake-video'); return 10
        with patch.object(c,'json',side_effect=respond), patch.object(c,'request',side_effect=download) as req:
            p=c.generate(GRAPH,'3','video',self.root,timeout=2)
        self.assertEqual(p.read_bytes(),b'fake-video'); self.assertIn('filename=clip.mp4',req.call_args.args[0])
    def test_comfy_job_failure(self):
        c=ai.ComfyLocal()
        with patch.object(c,'validate_local_nodes'), patch.object(c,'json',side_effect=[{'prompt_id':'job-1'},{'job-1':{'status':{'status_str':'error'}}}]):
            self.assertRaisesRegex(ValueError,'job failed',c.generate,GRAPH,'3','video',self.root,2)
    def test_wan_command_text_and_image(self):
        (self.root/'generate.py').touch(); ck=self.root/'weights'; ck.mkdir(); (ck/'dummy').touch(); img=self.root/'image.png'; img.write_bytes(b'x')
        cmd=ai.wan_command(self.root,ck,sys.executable,'coffee; literal',self.root/'output.mp4',img)
        self.assertIn('ti2v-5B',cmd); self.assertEqual(cmd[cmd.index('--prompt')+1],'coffee; literal'); self.assertEqual(cmd[cmd.index('--image')+1],str(img)); self.assertNotIn('--use_prompt_extend',cmd)
        self.assertRaises(ValueError,ai.wan_command,self.root,ck,sys.executable,'coffee',self.root/'o.mp4',None,50)
    def test_trust_gate(self):
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(ai.main(['blender','--execute','--output',str(self.root/'out')]),1)
        self.assertFalse((self.root/'out').exists())
    def test_no_overwrite(self):
        target=self.root/'out'; target.mkdir(); (target/'keep').write_text('safe')
        with patch.object(ai.shutil,'which',return_value='/bin/fake'),contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(ai.main(['user','--execute','--input','missing.mp4','--output',str(target)]),1)
        self.assertEqual((target/'keep').read_text(),'safe')
    def test_failure_cleans_stage(self):
        source=self.root/'clip.mp4'; source.write_bytes(b'original'); out=self.root/'out'
        with patch.object(ai.shutil,'which',return_value='/bin/fake'),patch.object(ai.smart_video,'optimize',side_effect=ValueError('invalid')),contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(ai.main(['user','--execute','--input',str(source),'--output',str(out)]),1)
        self.assertFalse(out.exists()); self.assertEqual(list(self.root.glob('.ai-media-*')),[]); self.assertEqual(source.read_bytes(),b'original')
    @unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),'FFmpeg required')
    def test_real_video_pipeline(self):
        source=self.root/'clip.mp4'; out=self.root/'out'
        subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','testsrc2=size=160x90:rate=24','-t','1','-c:v','libx264','-threads','2',str(source)],check=True)
        h=ai.smart_video.digest(source)
        with contextlib.redirect_stdout(io.StringIO()): self.assertEqual(ai.main(['user','--execute','--input',str(source),'--output',str(out)]),0)
        self.assertEqual(json.loads((out/'job.json').read_text())['source_sha256'],h); self.assertEqual(ai.smart_video.digest(source),h); self.assertTrue((out/'web/mobile.mp4').is_file()); self.assertTrue((out/'web/desktop.mp4').is_file())
    @unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),'FFmpeg required')
    def test_real_image_pipeline(self):
        source=self.root/'art.png'; out=self.root/'out'
        subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','testsrc2=size=160x90:rate=1','-frames:v','1','-threads','2','-update','1',str(source)],check=True)
        with contextlib.redirect_stdout(io.StringIO()): self.assertEqual(ai.main(['user','--kind','image','--execute','--input',str(source),'--output',str(out)]),0)
        self.assertLessEqual((out/'web/image.jpg').stat().st_size,200*1024); self.assertTrue(source.exists())
    @unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),'FFmpeg required')
    def test_real_frames_to_video(self):
        frames=self.root/'frames'; frames.mkdir()
        subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','testsrc2=size=160x90:rate=24','-frames:v','12','-threads','2',str(frames/'frame-%04d.png')],check=True)
        out=ai.frames_to_video(frames,24,self.root/'sequence.mp4'); self.assertAlmostEqual(ai.smart_video.source_info(out)['duration'],.5,places=2)
        (frames/'frame-0002.png').unlink(); self.assertRaises(ValueError,ai.frames_to_video,frames,24,self.root/'bad.mp4')

if __name__=='__main__': unittest.main()
