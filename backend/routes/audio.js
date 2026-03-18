import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for temporary storage
const upload = multer({
    dest: 'uploads/temp_audio/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create temp directory if it doesn't exist
const tempDir = path.join(process.cwd(), 'uploads/temp_audio');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

router.post('/transcribe', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const filePath = req.file.path;
    const pythonScriptPath = path.join(process.cwd(), 'python', 'transcribe.py');

    console.log(`Starting transcription for: ${filePath}`);

    // Spawn Python process
    const pythonProcess = spawn('python', [pythonScriptPath, filePath]);

    let transcript = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        transcript += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        // Whisper writes download progress to stderr, so we log it but don't treat as fatal immediately
        console.log(`[Whisper Log]: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        // Clean up file
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            return res.status(500).json({
                message: 'Transcription failed',
                error: errorOutput
            });
        }

        const cleanTranscript = transcript.trim();

        if (cleanTranscript.startsWith('Error:')) {
            return res.status(500).json({ message: cleanTranscript });
        }

        console.log('Transcription successful');
        res.status(200).json({ text: cleanTranscript });
    });
});

export default router;
