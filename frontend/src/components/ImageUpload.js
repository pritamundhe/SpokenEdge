'use client';
import { useState } from 'react';

export default function ImageUpload({ currentImage, onImageChange }) {
    const [preview, setPreview] = useState(currentImage || '');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreview(reader.result);
            // Pass both base64 preview and raw file
            onImageChange(reader.result, file);
        };
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg group">
                {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl text-gray-400">
                        ?
                    </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
        </div>
    );
}
