'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UsersPage() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5001/api/user/search?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Search results:', data); // Debug log
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Find Community Members</h1>
                    <p className="text-muted-foreground text-lg">
                        Connect with other learners to practice English together.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-4 rounded-2xl border border-border bg-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                            placeholder="Search by name or email..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="max-w-4xl mx-auto">
                    {users.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {users.map((user) => (
                                <Link href={`/users/${user._id}`} key={user._id} className="block group">
                                    <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow group-hover:border-primary/50">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border border-border group-hover:border-primary transition-colors">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                                                    {(user.name?.charAt(0) || 'U').toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                                                {user.name || user.email.split('@')[0]}
                                            </h3>
                                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                    {user.preferredLanguage || 'English'}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="p-2 text-muted-foreground group-hover:text-primary rounded-full transition-colors">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        searched && !loading && (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No users found</h3>
                                <p className="text-muted-foreground">Try searching with a different name or email.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
