'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { Feather, User, Bookmark, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
            <div className="container-medium py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <h1 className="text-3xl font-serif font-bold">Verse</h1>
                    </Link>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        {session ? (
                            <>
                                <Link
                                    href="/write"
                                    className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                                >
                                    <Feather className="w-5 h-5" />
                                    <span className="hidden md:inline">Write</span>
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold"
                                    >
                                        {session.user?.name?.[0] || 'U'}
                                    </button>

                                    {showMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                            <Link
                                                href="/me"
                                                className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>Profile</span>
                                            </Link>
                                            <Link
                                                href="/me/saved"
                                                className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                <Bookmark className="w-4 h-4" />
                                                <span>Saved Posts</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    signOut();
                                                }}
                                                className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 w-full text-left"
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
                                onClick={() => signIn('google')}
                                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
