'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
    // Mock Data for the Dashboard
    const stats = [
        { label: 'Fluency Score', value: '92%', change: '+4%', color: 'text-green-500' },
        { label: 'Words Learned', value: '1,240', change: '+12', color: 'text-blue-500' },
        { label: 'Speaking Time', value: '4.5h', change: '+30m', color: 'text-purple-500' },
        { label: 'Grammar Accuracy', value: '88%', change: '+2%', color: 'text-orange-500' },
    ];

    const recentSessions = [
        { id: 1, topic: 'Daily Routine Description', date: 'Today, 10:30 AM', score: '95%', duration: '2m 15s' },
        { id: 2, topic: 'Job Interview Practice', date: 'Yesterday, 4:00 PM', score: '88%', duration: '5m 00s' },
        { id: 3, topic: 'Travel Conversation', date: 'Oct 24, 2:00 PM', score: '91%', duration: '3m 45s' },
    ];

    return (
        <main className="min-h-screen relative text-black dark:text-white">
            <Navbar />

            <div className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Welcome back! You're making great progress.</p>
                    </div>
                    <Link href="/practice" className="btn-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                        <span>🎙️</span> Start New Session
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-card p-6 rounded-2xl border border-white/60 dark:border-white/10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">{stat.label}</span>
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">{stat.change}</span>
                            </div>
                            <div className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
                        {recentSessions.map((session) => (
                            <div key={session.id} className="glass-card p-6 rounded-2xl flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-pointer group border border-white/60 dark:border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        🎧
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{session.topic}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{session.date} • {session.duration}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-500">{session.score}</div>
                                    <div className="text-xs text-gray-500">Score</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Weakness/Focus Areas */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">Focus Areas</h2>
                        <div className="glass-card p-6 rounded-2xl border border-white/60 dark:border-white/10">
                            <h3 className="font-bold mb-4 text-orange-500">Grammar Weaknesses</h3>
                            <ul className="space-y-3">
                                {['Past Tense Verbs', 'Prepositions', 'Article Usage (a/an/the)'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm font-medium">
                                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full mt-6 py-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-bold hover:bg-orange-500/20 transition-colors">
                                Practice Grammar
                            </button>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-white/60 dark:border-white/10">
                            <h3 className="font-bold mb-4 text-purple-500">Vocabulary Expansion</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                You used <span className="font-bold text-black dark:text-white">5 new words</span> this week! Keep it up.
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full w-[65%]"></div>
                            </div>
                            <div className="flex justify-between text-xs mt-2 text-gray-500">
                                <span>Weekly Goal</span>
                                <span>65%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
