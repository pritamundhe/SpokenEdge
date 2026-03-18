'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserProfile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Please login to view user profiles');
                    setLoading(false);
                    return;
                }

                const res = await fetch(`http://localhost:5001/api/user/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setError('User not found');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                    <Link href="/users" className="text-primary hover:underline">
                        Back to Community Search
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link href="/users" className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Community
                        </Link>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 border-2 border-border flex-shrink-0">
                                {user.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-4xl">
                                        {(user.name?.charAt(0) || 'U').toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground mb-1">{user.name}</h1>
                                    <p className="text-muted-foreground text-lg">{user.email}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div className="bg-muted/50 p-4 rounded-xl">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Native Language</h3>
                                        <p className="font-semibold">{user.nativeLanguage || 'Not specificied'}</p>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-xl">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Learning</h3>
                                        <p className="font-semibold">{user.preferredLanguage || 'English'}</p>
                                    </div>
                                </div>

                                {user.learningGoals && user.learningGoals.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Learning Goals</h3>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            {user.learningGoals.map((goal, index) => (
                                                <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                                    {goal}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                        Joined on {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
