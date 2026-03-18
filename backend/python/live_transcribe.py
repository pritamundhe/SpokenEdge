
import sys
import os
import json
import whisper
import numpy as np

def main():
    # Load model once at startup
    print("Loading model...", file=sys.stderr)
    try:
        model = whisper.load_model("tiny") # or base/small
        print("Model loaded.", file=sys.stderr)
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        return

    print("READY") # Signal to Node.js that we are ready
    sys.stdout.flush()

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            data = json.loads(line.strip())
            file_path = data.get("filePath")
            
            if not file_path or not os.path.exists(file_path):
                print(json.dumps({"error": "File not found"}))
                sys.stdout.flush()
                continue

            print(f"Processing file: {file_path}", file=sys.stderr)
            
            # Transcribe
            # fp16=False is often needed for CPU execution to avoid warnings/errors
            # language='en' can help force English if detection is flaky on short clips
            result = model.transcribe(file_path, fp16=False, language='en')
            text = result["text"].strip()
            
            print(f"Transcribed: '{text}'", file=sys.stderr)
            
            print(json.dumps({"text": text}))
            sys.stdout.flush()

        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid JSON input"}))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
