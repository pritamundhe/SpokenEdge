
import sys
import os
import whisper

def transcribe_audio(file_path):
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"Error: File not found at {file_path}")
            return

        # Load the model (tiny for speed, base/small for better accuracy)
        # The first run will download the model.
        model = whisper.load_model("tiny") 

        # Transcribe
        result = model.transcribe(file_path)
        
        # Print the text to stdout so Node.js can capture it
        print(result["text"])

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_file_path>")
    else:
        transcribe_audio(sys.argv[1])
