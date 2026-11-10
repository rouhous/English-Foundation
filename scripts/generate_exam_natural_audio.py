#!/usr/bin/env python3
"""Generate natural, multi-speaker listening MP3s from exam-practice/index.html.

Uses the free Kokoro-82M ONNX model, voice switching by speaker, and ffmpeg.
Requires model weights locally; never exposes a speech synthesis API key.
"""
import json
import re
import subprocess
import tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / "exam-practice"
TEXT = (EXAM / "index.html").read_text(encoding="utf-8")
match = re.search(r'<script id="activityData" type="application/json">([\s\S]*?)</script>', TEXT)
if not match:
    raise RuntimeError("Cannot locate activity bank")
DATA = json.loads(match.group(1))
MODEL = Path("models/kokoro-v1.0.fp16.onnx")
VOICES = Path("models/voices-v1.0.bin")
tts = Kokoro(str(MODEL), str(VOICES))
available = set(tts.get_voices())

ROLE_VOICE = {
    "Interviewer": "bm_george", "Presenter": "bm_george",
    "Aisha": "bf_emma", "Kareem": "am_michael",
    "Dr Salma Rashid": "af_bella", "Dr Salma": "af_bella",
    "Fatma": "bf_emma", "Yousuf": "am_michael",
    "Maha": "bf_emma", "Ali": "am_michael",
    "Noor": "bf_emma", "Hamad": "am_michael",
    "Dr Laila Al Balushi": "af_bella", "Dr Laila": "af_bella",
    "Noura": "bf_emma", "Salim": "bm_george",
}
default_voice = "af_bella"
if default_voice not in available:
    raise RuntimeError("Expected Kokoro voices not present")

def chunk_sentences(text, max_chars=260):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    buf = ""
    for s in sentences:
        if len(buf) + len(s) + 1 > max_chars and buf:
            yield buf
            buf = ""
        if len(s) > max_chars:
            if buf: yield buf; buf = ""
            for start in range(0, len(s), max_chars):
                yield s[start:start + max_chars]
        else:
            buf = (buf + " " + s).strip()
    if buf:
        yield buf

def segments(script, activity):
    if activity["id"] == "g12-elective-a-listening-2":
        return [("Dr Salma", script)]
    if activity["id"] == "g12-elective-b-listening-2":
        return [("Dr Laila", script)]
    lines = [x.strip() for x in script.splitlines() if x.strip()]
    if len(lines) > 1 and all(":" in line[:28] for line in lines):
        result = []
        for line in lines:
            role, speech = line.split(":", 1)
            result.append((role.strip(), speech.strip()))
        return result
    return [("Narrator", script)]

def synthesize(activity, force=False):
    destination = EXAM / activity["audio"]
    if destination.exists() and not force:
        print("Skipping existing", destination)
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    samples_list = []
    rate = None
    for speaker, speech in segments(activity["passage"], activity):
        voice = ROLE_VOICE.get(speaker, default_voice)
        if voice not in available:
            raise ValueError(f"Missing voice: {voice}")
        for block in chunk_sentences(speech):
            pcm, rate = tts.create(block, voice=voice, speed=1.0,
                                   lang="en-gb" if voice.startswith("b") else "en-us")
            samples_list.append(np.asarray(pcm, dtype=np.float32))
        if rate is not None:
            samples_list.append(np.zeros(int(rate * 0.24), dtype=np.float32))
    if rate is None:
        raise ValueError(f"Empty passage: {activity['id']}")
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "speech.wav"
        sf.write(wav, np.concatenate(samples_list), rate)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", str(wav), "-ac", "1", "-b:a", "80k",
                        str(destination)], check=True)
    if destination.stat().st_size < 10000:
        raise ValueError(f"Audio too short/empty: {destination}")
    print("Created", destination, "bytes:", destination.stat().st_size)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Replace existing MP3s")
    parser.add_argument("--only", nargs="*", default=[], help="Only these activity IDs")
    args = parser.parse_args()
    audios = [a for a in DATA["activities"] if a.get("skill") == "listening"
              and a.get("passage") and a.get("audio") and
              (not args.only or a["id"] in args.only)]
    if not audios:
        raise SystemExit("No audio scripts to generate")
    for activity in audios:
        synthesize(activity, args.force)
