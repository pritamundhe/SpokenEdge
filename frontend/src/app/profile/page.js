'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', profileImage: '' });
    const [message, setMessage] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        // Fetch user profile
        fetch('http://localhost:5001/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/auth/login');
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

        // Fetch analytics
        fetch('http://localhost:5001/api/analytics/progress', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setAnalytics(data))
            .catch(err => console.error('Analytics error:', err));
    }, [router]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('Updating...');
        const token = localStorage.getItem('token');

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            if (formData.file) {
                submitData.append('profileImage', formData.file);
            }

            const res = await fetch('http://localhost:5001/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
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

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading...</p>
            </div>
        </div>
    );

    if (!user) return null;

    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const stats = analytics || { totalSessions: 0, currentStreak: 0, level: 1, experiencePoints: 0, achievements: [] };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
                <div className="flex gap-6">
                    {/* Left Side - Profile Info */}
                    {/* Left Side - Profile Info */}
                    <div className="flex-shrink-0 w-[700px]">
                        {/* Profile Info Section with Photo on Right */}
                        <div className="flex gap-6 mb-6 mt-8">
                            {/* Left: Name and Info */}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{user.name}</h1>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">{user.email}</p>

                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span>Joined {joinDate}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    <span>2 Following / 1 Follower</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-sm overflow-hidden border border-gray-300 dark:border-gray-600">
                                        <img src="https://flagcdn.com/w40/kr.png" alt="Korean" className="w-full h-full object-cover" />
                                    </span>
                                    <span className="w-6 h-6 rounded-sm overflow-hidden border border-gray-300 dark:border-gray-600">
                                        <img src="https://flagcdn.com/w40/cn.png" alt="Chinese" className="w-full h-full object-cover" />
                                    </span>
                                    <span className="w-6 h-6 rounded-sm overflow-hidden border border-gray-300 dark:border-gray-600">
                                        <img src="https://flagcdn.com/w40/us.png" alt="English" className="w-full h-full object-cover" />
                                    </span>
                                </div>
                            </div>

                            {/* Right: Profile Photo */}
                            <div className="flex-shrink-0">
                                <div className="relative group">
                                    <div className="w-42 h-42 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-5xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg cursor-pointer">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (user.name?.charAt(0) || 'U').toUpperCase()
                                        )}
                                    </div>
                                    {/* Verification Badge */}
                                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    {/* Edit Icon Overlay */}
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Edit Profile Photo"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-center text-sm mb-4 ${message.includes('success') ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                {message}
                            </div>
                        )}

                        {editing && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Edit Profile</h2>
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        <ImageUpload
                                            currentImage={formData.profileImage}
                                            onImageChange={(base64, file) => setFormData({ ...formData, profileImage: base64, file: file })}
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditing(false)}
                                                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl py-2.5 font-bold transition-colors"
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2.5 font-bold transition-colors shadow-lg shadow-blue-500/30"
                                            >
                                                SAVE
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Statistics Section */}
                        <div className="mt-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Statistics</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-xl">
                                            🔥
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.currentStreak}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Day streak</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-xl">
                                            💎
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.experiencePoints || 526}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Total XP</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-xs">🥉</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-bold text-gray-800 dark:text-white">Bronze</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Current league</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded inline-block">
                                        WEEK 1
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">
                                            🏆
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">0</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Top 3 finishes</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Friend Activity */}
                    <div className="flex-shrink-0 w-[550px]">
                        {/* Friend Quest */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    J
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">John Smith</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">2 days</p>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Don't make me show my claws!</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Only 8 lessons to go</p>
                                        <div className="mt-2 text-2xl">🐱</div>
                                    </div>
                                    <button className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm font-bold transition-colors">
                                        🔗 VIEW FRIENDS QUEST
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    J
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">John Smith</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">2 days</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">Earned a total of 100 XP!</p>
                                        <div className="text-3xl">💎</div>
                                    </div>
                                    <button className="mt-2 px-4 py-1.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors">
                                        🎉 CELEBRATE
                                    </button>
                                </div>
                            </div>
                            <button className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2">
                                View all →
                            </button>
                        </div>

                        {/* Following/Followers Tabs */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                            <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
                                <button className="flex-1 py-3 text-sm font-bold text-blue-500 border-b-2 border-blue-500">
                                    FOLLOWING
                                </button>
                                <button className="flex-1 py-3 text-sm font-bold text-gray-400 dark:text-gray-500">
                                    FOLLOWERS
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        J
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">John Smith</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">214 XP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
