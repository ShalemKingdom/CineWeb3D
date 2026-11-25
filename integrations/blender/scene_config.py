"""Validated, data-only scene configuration; no Blender dependency."""
import json
import math
import re
from pathlib import Path

DEFAULT = Path(__file__).with_name('coffee.json')

def load_config(path=DEFAULT):
    defaults = json.loads(DEFAULT.read_text(encoding='utf-8'))
    with Path(path).open(encoding='utf-8') as stream:
        supplied = json.load(stream)
    if not isinstance(supplied, dict) or supplied.keys() - defaults.keys():
        raise ValueError('Expected a JSON object with only documented keys')
    cfg = defaults | supplied
    if not isinstance(cfg['name'], str) or not re.fullmatch(r'[a-z][a-z0-9-]{0,39}', cfg['name']):
        raise ValueError('name must be a safe lowercase slug')
    for key in ('ceramic', 'coffee', 'background'):
        if not isinstance(cfg[key], str) or not re.fullmatch(r'#[0-9a-fA-F]{6}', cfg[key]):
            raise ValueError(f'{key} must be #RRGGBB')
    for key, lo, hi in [('segments', 16, 128), ('fps', 12, 30)]:
        if type(cfg[key]) is not int or not lo <= cfg[key] <= hi:
            raise ValueError(f'{key} outside {lo}..{hi}')
    for key, lo, hi in [('duration', 1, 15), ('camera_radius', 4, 15), ('camera_height', 0.5, 8), ('rotation_degrees', -360, 360)]:
        v = cfg[key]
        if type(v) not in (float, int) or not math.isfinite(v) or not lo <= v <= hi:
            raise ValueError(f'{key} outside {lo}..{hi}')
    res = cfg['resolution']
    if not isinstance(res, list) or len(res) != 2 or any(type(v) is not int or v < 256 or v > 1920 or v % 2 for v in res):
        raise ValueError('resolution must be two even integers in 256..1920')
    return cfg
