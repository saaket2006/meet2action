from faster_whisper import WhisperModel
import time

start = time.time()

model = WhisperModel("base", device="cuda", compute_type="float16")
segments, info = model.transcribe("C:\\Users\\ASUS\\Downloads\\audio.mp4")

print("Detected language:", info.language)

for segment in segments:
    print(segment.text)

print("Time:", time.time() - start)
