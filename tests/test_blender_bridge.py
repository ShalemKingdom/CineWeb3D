import json
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import blender_bridge as bridge


def fixture(path, data=None):
    raw=json.dumps(data if data is not None else {'asset':{'version':'2.0'},'meshes':[{}],'animations':[{}],'cameras':[{}]}).encode();raw+=b' '*(-len(raw)%4)
    path.write_bytes(struct.pack('<4sIIII',b'glTF',2,20+len(raw),len(raw),0x4E4F534A)+raw)

class BridgeTests(unittest.TestCase):
    def test_defaults(self):
        self.assertEqual(bridge.load_config()['fps'],24)
    def test_invalid_configs(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'config.json'
            for data in [{'name':'../x'},{'fps':True},{'segments':500},{'resolution':[255,540]},{'ceramic':'bad'},{'duration':float('nan')},{'script':'bad'}]:
                with self.subTest(data=data):
                    p.write_text(json.dumps(data));self.assertRaises(ValueError,bridge.load_config,p)
    def test_glb_header(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'scene.glb';fixture(p);self.assertEqual(bridge.validate_glb(p),{'meshes':1,'animations':1,'cameras':1});p.write_bytes(b'broken');self.assertRaises(ValueError,bridge.validate_glb,p)
    def test_missing_animation(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'scene.glb';fixture(p,{'asset':{'version':'2.0'},'meshes':[{}]});self.assertRaises(ValueError,bridge.validate_glb,p)
    def test_command(self):
        cmd=bridge.command('/path with space/blender','config.json','output','poster');self.assertEqual(cmd[0],'/path with space/blender');self.assertIn('--disable-autoexec',cmd);self.assertIn('--python-exit-code',cmd);self.assertEqual(cmd[-2:],['--render','poster'])
    def test_dry_run_no_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'out'
            with patch.object(bridge.shutil,'which',return_value=None),patch.object(bridge.subprocess,'run') as run:
                self.assertEqual(bridge.main(['--dry-run','--output',str(p)]),0);run.assert_not_called();self.assertFalse(p.exists())
    def test_success_mocked(self):
        def mock_run(cmd,**kwargs):
            stage=Path(cmd[cmd.index('--output')+1]);fixture(stage/'scene.glb');(stage/'scene.blend').write_bytes(b'mock')
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)/'out'
            with patch.object(bridge.shutil,'which',return_value='/mock/blender'),patch.object(bridge.subprocess,'run',side_effect=mock_run):
                self.assertEqual(bridge.main(['--output',str(out)]),0);self.assertTrue((out/'manifest.json').exists());self.assertRaises(SystemExit,bridge.main,['--output',str(out)])
    def test_failed_export_no_partial_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)/'out'
            with patch.object(bridge.shutil,'which',return_value='/mock/blender'),patch.object(bridge.subprocess,'run',return_value=None):
                self.assertRaises(OSError,bridge.main,['--output',str(out)]);self.assertFalse(out.exists());self.assertEqual(list(Path(tmp).iterdir()),[])
