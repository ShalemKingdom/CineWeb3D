"""Read-only local media preflight; no network or installation."""
import platform
import shutil
import subprocess
import json

def check():
    result = {"platform": platform.platform(), "architecture": platform.machine(),
              "tools": {n: shutil.which(n) for n in ("ffmpeg", "ffprobe", "blender", "python3", "nvidia-smi")},
              "gpu": None, "wan_ready": "unknown; verify checkpoint requirements and runtime manually"}
    if result["tools"]["nvidia-smi"]:
        try:
            run = subprocess.run([result["tools"]["nvidia-smi"], "--query-gpu=name,memory.total,memory.free", "--format=csv,noheader"], capture_output=True, text=True, timeout=10, check=True)
            result["gpu"] = run.stdout.strip().splitlines()
        except (OSError, subprocess.SubprocessError):
            result["gpu"] = "NVIDIA probe failed"
    return result

if __name__ == "__main__":
    print(json.dumps(check(), indent=2))
