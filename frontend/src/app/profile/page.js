'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', profileImage: '' });
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch('http://localhost:5001/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login');
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data && data.user) {
                    setUser(data.user);
                    setFormData({
                        name: data.user.name || '',
                        profileImage: data.user.profileImage || ''
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('Updating...');
        const token = localStorage.getItem('token');

        // Use FormData for file upload if needed or JSON if base64? 
        // Backend expects multipart/form-data for file upload via multer.
        // Wait, previous backend logic (multer implementation) expects:
        // router.put('/profile', verifyToken, upload.single('profileImage'), updateProfile);
        // This implies FormData!
        // But my frontend ImageUpload returns base64 string currently.
        // If I want to support file upload properly with multer, I need to change ImageUpload to return File object
        // OR changing backend to accept base64 JSON.
        // The Plan said "Backend: Implement Profile Route with Cloudinary", and I implemented basic multer upload in `userController.js`:
        // if (req.file) { cloudinary.uploader.upload(req.file.path) ... }
        // This means backend expects File.
        // BUT my frontend `ImageUpload` component logic converts to base64 `reader.readAsDataURL`.
        // AND `Profile` page submits JSON: `body: JSON.stringify(formData)`.
        // I need to align them. 
        // EASIEST WAY: Use Base64 on backend as well? Or change frontend to `FormData`.
        // Given `userController.js` uses `req.file`, it expects `multipart/form-data`.
        // So I must change Frontend to use `FormData`.

        try {
            const data = new FormData();
            data.append('name', formData.name);
            // formData.profileImage currently holds base64 string from ImageUpload?
            // If ImageUpload returns base64, I can't easily append as file unless I convert back.
            // Let's check ImageUpload component again. It uses `reader.readAsDataURL`.
            // I should update ImageUpload to pass the FILE object up too.
            // For now, to minimize changes, I'll modify `handleUpdate` to assume `formData.profileImage` might be a File if it was changed?
            // Wait, `ImageUpload.js` `onImageChange` is called with `reader.result`.
            // I'll update `ImageUpload.js` to pass both. :D
            // But I can't update `ImageUpload.js` in this `replace_file_content`.
            // Actually I should stick to one strategy.
            // Let's stick to JSON base64 on backend? No, I already wrote `userController.js` to use `req.file`.
            // So I MUST use FormData on frontend.

            // I will update the `replace_file_content` for `Profile` to use `FormData` logic, 
            // AND I will queue a task to update `ImageUpload` to pass the raw file.

            // Wait, I can't update ImageUpload in this turn.
            // Let's assume I'll fix ImageUpload next.
            // Here is the Profile update logic assuming `formData.file` exists (I will add it).

            const submitData = new FormData();
            submitData.append('name', formData.name);
            if (formData.file) {
                submitData.append('profileImage', formData.file);
            }

            const res = await fetch('http://localhost:5001/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type header must NOT be set when sending FormData, browser sets it with boundary
                },
                body: submitData,
            });
            const responseData = await res.json();
            if (res.ok) {
                setUser(responseData.user);
                setEditing(false);
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(responseData.message || 'Update failed');
            }
        } catch (err) {
            setMessage('An error occurred');
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <main className="min-h-screen text-gray-900 dark:text-white relative">
            <Navbar />

            <div className="pt-32 pb-20 px-4">
                <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8">
                    <h1 className="text-3xl font-bold mb-8 text-center text-gradient">Your Profile</h1>

                    {message && (
                        <div className={`p-4 rounded-lg mb-6 text-center ${message.includes('success') ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-6">
                        {editing ? (
                            <ImageUpload
                                currentImage={formData.profileImage}
                                onImageChange={(base64, file) => setFormData({ ...formData, profileImage: base64, file: file })}
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-purple-500 shadow-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-400">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    (user.name?.charAt(0) || 'U').toUpperCase()
                                )}
                            </div>
                        )}

                        {!editing ? (
                            <div className="text-center space-y-2 w-full">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="mt-6 btn-primary px-6 py-2 rounded-full text-sm font-bold"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="w-full space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg py-3 font-bold transition-colors text-gray-900 dark:text-white">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 btn-primary rounded-lg py-3 font-bold text-white">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
