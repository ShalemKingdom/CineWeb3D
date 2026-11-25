"""Optimize a local clip for scroll playback without overwriting files."""
import argparse
import shutil
import subprocess
from pathlib import Path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        parser.error("Install FFmpeg with libx264 first")
    if not args.source.is_file() or args.output.exists() or args.output.suffix.lower() != ".mp4":
        parser.error("Provide an existing source and a new .mp4 output path")
    subprocess.run([ffmpeg, "-n", "-i", str(args.source.resolve()), "-an", "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p", "-force_key_frames", "expr:gte(t,n_forced*1)", "-movflags", "+faststart", str(args.output.resolve())], check=True)
