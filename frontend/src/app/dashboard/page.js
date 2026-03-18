'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
    // Mock Data for the Dashboard
    const stats = [
        { label: 'Fluency Score', value: '92%', change: '+4%', icon: '🗣️', color: 'bg-green-100 text-green-600', border: 'hover:border-green-300' },
        { label: 'Words Learned', value: '1,240', change: '+12', icon: '📚', color: 'bg-blue-100 text-blue-600', border: 'hover:border-blue-300' },
        { label: 'Speaking Time', value: '4.5h', change: '+30m', icon: '⏱️', color: 'bg-purple-100 text-purple-600', border: 'hover:border-purple-300' },
        { label: 'Grammar Accuracy', value: '88%', change: '+2%', icon: '✍️', color: 'bg-orange-100 text-orange-600', border: 'hover:border-orange-300' },
    ];

    const recentSessions = [
        { id: 1, topic: 'Daily Routine Description', date: 'Today, 10:30 AM', score: '95%', duration: '2m 15s' },
        { id: 2, topic: 'Job Interview Practice', date: 'Yesterday, 4:00 PM', score: '88%', duration: '5m 00s' },
        { id: 3, topic: 'Travel Conversation', date: 'Oct 24, 2:00 PM', score: '91%', duration: '3m 45s' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
                <div className="flex gap-6">
                    {/* Left Column - Main Content */}
                    <div className="flex-shrink-0 w-[700px]">
                        {/* Welcome & CTA */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">My Dashboard</h1>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">Welcome back! You're making great progress.</p>
                                </div>
                                <Link href="/practice" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2">
                                    <span>🎙️</span> Start New Session
                                </Link>
                            </div>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {stats.map((stat, i) => (
                                <div key={i} className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-colors ${stat.border}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</div>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">{stat.change}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Sessions */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Sessions</h2>
                            <div className="space-y-4">
                                {recentSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                🎧
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-white">{session.topic}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{session.date} • {session.duration}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-green-500">{session.score}</div>
                                            <div className="text-xs text-gray-400">Score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-center text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-2">
                                VIEW ALL SESSIONS
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Focus Areas */}
                    <div className="flex-shrink-0 w-[550px]">
                        {/* Grammar Weaknesses */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-orange-500">⚠</span> Focus Areas
                            </h2>
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">Grammar Weaknesses</h3>
                            <ul className="space-y-3 mb-6">
                                {['Past Tense Verbs', 'Prepositions', 'Article Usage (a/an/the)'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold border-2 border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-colors">
                                PRACTICE GRAMMAR
                            </button>
                        </div>

                        {/* Vocabulary Expansion */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-purple-500">📚</span> Vocabulary
                            </h2>
                            <div className="relative pt-2">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-gray-800 dark:text-white">5</span>
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">new words this week</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden mb-2">
                                    <div className="bg-purple-500 h-full w-[65%] rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    <span>Weekly Goal</span>
                                    <span>65%</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t-2 border-gray-100 dark:border-gray-700">
                                <button className="w-full py-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors">
                                    REVIEW VOCABULARY
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
