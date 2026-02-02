'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:5001/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    throw new Error('Not logged in');
                })
                .then((data) => setUser(data.user))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <nav className="glass-nav fixed w-full z-50 top-0 left-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold font-sans tracking-tight">
                            <span className="text-white">Spoken</span>
                            <span className="text-blue-500">Edge</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Home
                            </Link>
                            {!mounted ? null : !user ? (
                                <>
                                    <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link href="/register" className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                        Get Started
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
