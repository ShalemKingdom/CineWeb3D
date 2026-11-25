import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import smart_video as sv

@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),'FFmpeg and FFprobe required')
class SmartVideoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory(); cls.root=Path(cls.temp.name)
        cls.source=cls.root/'source.mp4'
        subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','testsrc2=size=960x540:rate=30','-f','lavfi','-i','sine=frequency=440','-t','2','-c:v','libx264','-crf','12','-threads','2','-c:a','aac',str(cls.source)],check=True,timeout=30)
        cls.before=sv.digest(cls.source); cls.output=cls.root/'optimized'; cls.manifest=sv.optimize(cls.source,cls.output)
    @classmethod
    def tearDownClass(cls): cls.temp.cleanup()
    def test_profiles_and_manifest(self):
        self.assertEqual(json.loads((self.output/'manifest.json').read_text()),self.manifest)
        self.assertEqual(set(self.manifest['variants']),{'mobile','desktop'})
        for name,v in self.manifest['variants'].items():
            p=sv.PROFILES[name]; self.assertLessEqual(max(v['width'],v['height']),p['edge']); self.assertEqual(v['fps'],p['fps']); self.assertLessEqual(v['bytes'],p['max_bytes']); self.assertAlmostEqual(v['duration'],2,places=2)
    def test_real_keyframes_and_silent_video(self):
        for v in self.manifest['variants'].values():
            i=sv.media_info(self.output/v['file']); self.assertEqual(i['audio_tracks'],0); self.assertEqual(i['stream']['codec_name'],'h264'); self.assertEqual(i['stream']['pix_fmt'],'yuv420p'); self.assertLessEqual(v['max_keyframe_gap'],.51)
    def test_poster_and_hashes(self):
        p=self.manifest['poster']; self.assertLessEqual(p['bytes'],sv.POSTER_BUDGET); self.assertEqual(sv.digest(self.output/p['file']),p['sha256']); self.assertTrue((self.output/p['file']).read_bytes().startswith(b'\xff\xd8'))
        for v in self.manifest['variants'].values(): self.assertEqual(sv.digest(self.output/v['file']),v['sha256'])
    def test_original_and_no_overwrite(self):
        self.assertEqual(sv.digest(self.source),self.before)
        with self.assertRaises(ValueError): sv.optimize(self.source,self.output)
        self.assertEqual(json.loads((self.output/'manifest.json').read_text()),self.manifest)
    def test_budget_failure_cleans_stage(self):
        output=self.root/'too-big'; before=set(self.root.glob('.cine-video-*'))
        with self.assertRaisesRegex(ValueError,'exceeds'): sv.optimize(self.source,output,('mobile',),.001)
        self.assertFalse(output.exists()); self.assertEqual(set(self.root.glob('.cine-video-*')),before)
    def test_invalid_input(self):
        bad=self.root/'bad.mp4'; bad.write_bytes(b'bad')
        with self.assertRaises(subprocess.CalledProcessError): sv.optimize(bad,self.root/'bad-output')
        self.assertFalse((self.root/'bad-output').exists())
    def test_portrait_single_profile_no_upscale(self):
        source=self.root/'portrait.mp4'; output=self.root/'portrait-output'
        subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','testsrc2=size=240x400:rate=24','-t','1','-c:v','libx264','-threads','2',str(source)],check=True,timeout=30)
        result=sv.optimize(source,output,('mobile',)); self.assertEqual(set(result['variants']),{'mobile'}); self.assertEqual((result['variants']['mobile']['width'],result['variants']['mobile']['height']),(240,400))
    def test_invalid_budget_and_profiles(self):
        for budget in (0,float('nan'),51):
            with self.assertRaises(ValueError): sv.optimize(self.source,self.root/'invalid',max_mib=budget)
        with self.assertRaises(ValueError): sv.optimize(self.source,self.root/'invalid',('unknown',))

if __name__=='__main__': unittest.main()
