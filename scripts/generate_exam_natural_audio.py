#!/usr/bin/env python3
"""Generate natural, multi-speaker listening MP3s from exam-practice/index.html.

Uses the free Kokoro-82M ONNX model, voice switching by speaker, and ffmpeg.
Requires model weights locally; never exposes a speech synthesis API key.
"""
import json
import re
import subprocess
import tempfile
import os
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
    "Speaker 1": "bm_george", "Speaker 2": "bf_emma",
    "Omar": "am_michael", "Saeed": "bm_george",
    "Mariam": "af_bella", "Hala": "bf_emma",
    "Yazan": "am_michael", "Khalid": "bm_george",
    "Alya": "bf_emma", "Huda": "bf_emma",
    "Layla": "af_bella", "Salma": "af_bella",
    "Yousef": "am_michael", "Sara": "bf_emma",
    "Muna": "af_bella", "Rashid": "bm_george", "Ahmed": "am_michael",
    "Narrator": "af_bella",
}
default_voice = "af_bella"
print(f"Kokoro loaded: {len(available)} available voices; model bytes={MODEL.stat().st_size}", flush=True)
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
    # The five short texts in Grades 7–9 are independent speakers.
    # Alternate a young feminine and masculine voice rather than reading all texts in one voice.
    if activity.get("grade") in (7, 8, 9) and activity.get("group") == 1:
        parts = [p.strip() for p in re.split(r"\n\s*\n", script.strip()) if p.strip()]
        if len(parts) == 5:
            return [("Voice "+str(i+1), p) for i,p in enumerate(parts)]
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
    print(f"Rendering {activity['id']} with {len(activity['passage'].split())} words", flush=True)
    for speaker, speech in segments(activity["passage"], activity):
        voice = ["af_bella","am_michael","bf_emma","bm_george","af_bella"][int(speaker.split()[-1])-1] if speaker.startswith("Voice ") and speaker.split()[-1].isdigit() else ROLE_VOICE.get(speaker, default_voice)
        if voice not in available:
            raise ValueError(f"Missing voice: {voice}")
        print(f"  voice={voice} role={speaker} length={len(speech)}", flush=True)
        for block in chunk_sentences(speech):
            pcm, rate = tts.create(block, voice=voice, speed=0.91 if activity["grade"] <= 6 else 0.97,
                                   lang="en-gb" if voice.startswith("b") else "en-us")
            samples_list.append(np.asarray(pcm, dtype=np.float32))
        if rate is not None:
            samples_list.append(np.zeros(int(rate * (0.9 if speaker == "Speaker 2" else 0.28)), dtype=np.float32))
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
    print("Created", destination, "bytes:", destination.stat().st_size, flush=True)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Replace existing MP3s")
    parser.add_argument("--only", nargs="*", default=[], help="Only these activity IDs")
    parser.add_argument("--grade", type=int, help="Only this grade")
    parser.add_argument("--model-name", choices=["A","B","C","D"], help="Only this model")
    args = parser.parse_args()
    audios = [a for a in DATA["activities"] if a.get("skill") == "listening"
              and a.get("passage") and a.get("audio") and
              (not args.only or a["id"] in args.only) and
              (args.grade is None or a["grade"] == args.grade) and
              (not args.model_name or a["model"] == args.model_name)]
    if not audios:
        raise SystemExit("No audio scripts to generate")
    for activity in audios:
        synthesize(activity, args.force)
