'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const [theme, setTheme] = useState('dark');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = systemPrefersDark ? 'dark' : 'light';
            setTheme(initialTheme);
            document.documentElement.classList.toggle('dark', initialTheme === 'dark');
        }

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

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <nav className="fixed w-full z-50 top-0 left-0 border-b border-transparent dark:border-border bg-background/80 backdrop-blur-md transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="text-2xl font-bold font-sans tracking-tighter flex items-center">
                                <span className="text-foreground">Spoken</span>
                                <span className="text-primary">Edge</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5 animate-pulse"></div>
                            </div>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4 items-center">
                            <Link href="/" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Home
                            </Link>
                            {!mounted ? null : !user ? (
                                <>
                                    <Link href="/auth/login" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link href="/auth/register" className="bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-black/20">
                                        Get Started
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/practice" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Practice
                                    </Link>
                                    <Link href="/dashboard" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Dashboard
                                    </Link>
                                    <Link href="/users" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Community
                                    </Link>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="relative group focus:outline-none"
                                        >
                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-all shadow-md hover:shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm">{(user.name?.charAt(0) || 'U').toUpperCase()}</span>
                                                )}
                                            </div>
                                            {/* Verification Badge */}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                                                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showDropdown && (
                                            <div className="absolute right-0 mt-2 w-48 bg-card text-card-foreground rounded-xl shadow-lg border-2 border-border py-2 z-50">
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setShowDropdown(false)}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    View Profile
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-destructive/10 text-destructive transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-foreground/80 hover:text-foreground transition-colors focus:outline-none"
                                aria-label="Toggle Dark Mode"
                            >
                                {mounted && (theme === 'dark' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                    </svg>
                                ))}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
