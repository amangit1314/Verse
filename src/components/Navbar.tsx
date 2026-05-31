'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { Feather, User, Bookmark, LogOut } from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/lib/appwrite-auth';
import { useAuth } from '@/hooks/useAuth';
import { API_ROUTES, APP_ROUTES } from '@/lib/constants';

export default function Navbar() {
    const { user, loading } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const handleSignIn = () => {
        window.location.href = API_ROUTES.authLogin;
    };

    const handleSignOut = async () => {
        setShowMenu(false);
        await logout();
        window.location.href = APP_ROUTES.home;
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f7f4ed]/95 backdrop-blur dark:border-stone-800 dark:bg-[#11100e]/95">
            <div className="container-medium py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <h1 className="text-3xl font-serif font-bold tracking-tight">Verse</h1>
                    </Link>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        {!loading && user ? (
                            <>
                                <Link
                                    href="/write"
                                        className="flex items-center space-x-2 text-sm text-stone-600 transition-colors hover:text-black dark:text-stone-300 dark:hover:text-white"
                                >
                                    <Feather className="w-5 h-5" />
                                    <span className="hidden md:inline">Write</span>
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-semibold text-white dark:bg-white dark:text-black"
                                    >
                                        {user.name?.[0] || user.email?.[0] || 'U'}
                                    </button>

                                    {showMenu && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-md border border-stone-200 bg-white py-2 shadow-lg dark:border-stone-800 dark:bg-[#1b1a17]">
                                            <Link
                                                href={APP_ROUTES.me}
                                                className="flex items-center space-x-3 px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>Profile</span>
                                            </Link>
                                            <Link
                                                href={APP_ROUTES.saved}
                                                className="flex items-center space-x-3 px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                <Bookmark className="w-4 h-4" />
                                                <span>Saved Posts</span>
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex w-full items-center space-x-3 px-4 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={handleSignIn}
                                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-stone-200"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
