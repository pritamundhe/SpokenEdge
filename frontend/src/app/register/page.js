'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/login');
            } else {
                const data = await res.json();
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            setError('An error occurred. Check console for details.');
        }
    };

    return (
        <main className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full max-w-md p-8 glass-card rounded-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-gradient">Create Account</h2>

                {error && <div className="bg-red-500/20 text-red-500 dark:text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-400 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all hover:bg-white/80 dark:hover:bg-black/30"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-400 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all hover:bg-white/80 dark:hover:bg-black/30"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-400 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all hover:bg-white/80 dark:hover:bg-black/30"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary py-3 rounded-lg font-bold text-white shadow-lg mt-2"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
