'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BookOpen, Grid3X3, Heart, Library, LucideIcon, Save, User } from 'lucide-react';
import { getAppwriteAccount, getAppwriteFallbackHeaders } from '@/lib/appwrite-auth';
import { API_ROUTES, APP_ROUTES, UI_MESSAGES } from '@/lib/constants';
import { Author, Post, UserCollection } from '@/types';
import PostGrid from './PostGrid';

interface ProfileResponse {
    user: {
        id: string;
        name: string;
        email: string;
    };
    author: Author;
    posts: Post[];
    savedPosts: Post[];
    likedPosts: Post[];
    collections: UserCollection[];
}

interface ProfileDashboardProps {
    view?: 'overview' | 'library';
}

export default function ProfileDashboard({ view = 'overview' }: ProfileDashboardProps) {
    const [data, setData] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [creatingCollection, setCreatingCollection] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', bio: '', image: '', slug: '' });
    const [collectionForm, setCollectionForm] = useState({ name: '', description: '' });

    const headers = useMemo(() => getAppwriteFallbackHeaders(), []);

    const loadProfile = async () => {
        setLoading(true);
        setError('');
        const response = await fetch(API_ROUTES.me, { headers });
        if (response.status === 401) {
            window.location.href = APP_ROUTES.signIn;
            return;
        }
        if (!response.ok) {
            setError(UI_MESSAGES.couldNotLoadProfile);
            setLoading(false);
            return;
        }
        const nextData = await response.json();
        setData(nextData);
        setProfileForm({
            name: nextData.author.name || '',
            bio: nextData.author.bio || '',
            image: nextData.author.image || '',
            slug: nextData.author.slug?.current || '',
        });
        setLoading(false);
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateProfile = async (event: FormEvent) => {
        event.preventDefault();
        setSavingProfile(true);
        try {
            const account = getAppwriteAccount();
            await account.updateName(profileForm.name);
            await account.updatePrefs({ picture: profileForm.image });
            const response = await fetch(API_ROUTES.me, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(profileForm),
            });
            if (response.ok) {
                await loadProfile();
            }
        } finally {
            setSavingProfile(false);
        }
    };

    const createCollection = async (event: FormEvent) => {
        event.preventDefault();
        if (!collectionForm.name.trim()) return;

        setCreatingCollection(true);
        const response = await fetch(API_ROUTES.meCollections, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(collectionForm),
        });
        if (response.ok) {
            setCollectionForm({ name: '', description: '' });
            await loadProfile();
        }
        setCreatingCollection(false);
    };

    const addToCollection = async (collectionId: string, postId: string) => {
        if (!collectionId) return;

        await fetch(`${API_ROUTES.meCollections}/${collectionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ postId }),
        });
        await loadProfile();
    };

    if (loading) {
        return (
            <main className="container-medium flex-1 py-12">
                <div className="text-sm text-stone-500 dark:text-stone-400">{UI_MESSAGES.loadingProfile}</div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="container-medium flex-1 py-12">
                <div className="border border-stone-300 bg-white p-8 text-sm text-stone-600 dark:border-stone-800 dark:bg-[#1b1a17] dark:text-stone-300">
                    {error || UI_MESSAGES.profileUnavailable}
                </div>
            </main>
        );
    }

    const collectionPicker = (post: Post) => (
        <select
            defaultValue=""
            onChange={(event) => addToCollection(event.target.value, post._id)}
            className="w-full rounded-full border border-stone-300 bg-[#f7f4ed] px-4 py-2 text-sm outline-none dark:border-stone-700 dark:bg-[#11100e]"
        >
            <option value="" disabled>
                {UI_MESSAGES.addToCollection}
            </option>
            {data.collections.map((collection) => (
                <option key={collection._id} value={collection._id}>
                    {collection.name}
                </option>
            ))}
        </select>
    );

    const stats: Array<[string, number, LucideIcon]> = [
        ['Posts', data.posts.length, BookOpen],
        ['Saved', data.savedPosts.length, Save],
        ['Liked', data.likedPosts.length, Heart],
        ['Collections', data.collections.length, Grid3X3],
    ];

    return (
        <main className="container-medium flex-1 py-10 md:py-14">
            <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside>
                    <div className="sticky top-24">
                        <div className="flex items-center gap-4 border-b border-stone-300 pb-6 dark:border-stone-800">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl font-semibold text-white dark:bg-white dark:text-black">
                                {data.author.name?.[0] || data.user.email[0]}
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate font-serif text-3xl">{data.author.name}</h1>
                                <p className="truncate text-sm text-stone-500 dark:text-stone-400">{data.user.email}</p>
                            </div>
                        </div>

                        <nav className="mt-6 space-y-2 text-sm">
                            <Link
                                href={APP_ROUTES.me}
                                className={`flex items-center gap-3 rounded-full px-4 py-2 ${view === 'overview' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-stone-200 dark:hover:bg-stone-800'}`}
                            >
                                <User className="h-4 w-4" />
                                Account
                            </Link>
                            <Link
                                href={APP_ROUTES.saved}
                                className={`flex items-center gap-3 rounded-full px-4 py-2 ${view === 'library' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-stone-200 dark:hover:bg-stone-800'}`}
                            >
                                <Library className="h-4 w-4" />
                                Library
                            </Link>
                        </nav>
                    </div>
                </aside>

                {view === 'overview' ? (
                    <div className="space-y-10">
                        <section>
                            <h2 className="font-serif text-4xl">Account</h2>
                            <form onSubmit={updateProfile} className="mt-6 grid gap-4">
                                <label className="grid gap-2 text-sm">
                                    Display name
                                    <input
                                        value={profileForm.name}
                                        onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                                        className="border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-900 dark:border-stone-700 dark:bg-[#1b1a17] dark:focus:border-stone-300"
                                    />
                                </label>
                                <label className="grid gap-2 text-sm">
                                    Slug
                                    <input
                                        value={profileForm.slug}
                                        onChange={(event) => setProfileForm({ ...profileForm, slug: event.target.value })}
                                        className="border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-900 dark:border-stone-700 dark:bg-[#1b1a17] dark:focus:border-stone-300"
                                    />
                                </label>
                                <label className="grid gap-2 text-sm">
                                    Image URL
                                    <input
                                        value={profileForm.image}
                                        onChange={(event) => setProfileForm({ ...profileForm, image: event.target.value })}
                                        className="border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-900 dark:border-stone-700 dark:bg-[#1b1a17] dark:focus:border-stone-300"
                                    />
                                </label>
                                <label className="grid gap-2 text-sm">
                                    Bio
                                    <textarea
                                        value={profileForm.bio}
                                        onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })}
                                        rows={4}
                                        className="resize-none border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-900 dark:border-stone-700 dark:bg-[#1b1a17] dark:focus:border-stone-300"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="w-fit rounded-full bg-[#1a8917] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    {savingProfile ? 'Saving...' : 'Save profile'}
                                </button>
                            </form>
                        </section>

                        <section className="grid gap-4 md:grid-cols-4">
                            {stats.map(([label, count, Icon]) => (
                                <div key={label} className="border border-stone-300 bg-white p-5 dark:border-stone-800 dark:bg-[#1b1a17]">
                                    <Icon className="h-5 w-5 text-stone-500 dark:text-stone-400" />
                                    <p className="mt-4 text-3xl font-semibold">{count}</p>
                                    <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
                                </div>
                            ))}
                        </section>

                        <section>
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <h2 className="font-serif text-3xl">Your collections</h2>
                                <Link href={APP_ROUTES.saved} className="text-sm text-[#1a8917]">
                                    Add posts
                                </Link>
                            </div>
                            <form onSubmit={createCollection} className="mb-6 grid gap-3 border border-stone-300 bg-white p-5 dark:border-stone-800 dark:bg-[#1b1a17] md:grid-cols-[1fr_1fr_auto]">
                                <input
                                    value={collectionForm.name}
                                    onChange={(event) => setCollectionForm({ ...collectionForm, name: event.target.value })}
                                    placeholder="Collection name"
                                    className="border border-stone-300 bg-[#f7f4ed] px-4 py-3 outline-none dark:border-stone-700 dark:bg-[#11100e]"
                                />
                                <input
                                    value={collectionForm.description}
                                    onChange={(event) => setCollectionForm({ ...collectionForm, description: event.target.value })}
                                    placeholder="Description"
                                    className="border border-stone-300 bg-[#f7f4ed] px-4 py-3 outline-none dark:border-stone-700 dark:bg-[#11100e]"
                                />
                                <button
                                    type="submit"
                                    disabled={creatingCollection}
                                    className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                                >
                                    {creatingCollection ? 'Creating...' : 'Create'}
                                </button>
                            </form>

                            <div className="grid gap-4 md:grid-cols-2">
                                {data.collections.map((collection) => (
                                    <Link
                                        key={collection._id}
                                        href={`/me/collections/${collection._id}`}
                                        className="border border-stone-300 bg-white p-5 transition-colors hover:border-stone-900 dark:border-stone-800 dark:bg-[#1b1a17] dark:hover:border-stone-300"
                                    >
                                        <h3 className="font-serif text-2xl">{collection.name}</h3>
                                        {collection.description && (
                                            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                                                {collection.description}
                                            </p>
                                        )}
                                        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
                                            {collection.postsCount || 0} posts
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="mb-5 font-serif text-3xl">Your posts</h2>
                            <PostGrid posts={data.posts} emptyText={UI_MESSAGES.noUserPosts} />
                        </section>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <section>
                            <h2 className="mb-5 font-serif text-4xl">Saved posts</h2>
                            <PostGrid
                                posts={data.savedPosts}
                                emptyText={UI_MESSAGES.noSavedPosts}
                                renderAction={data.collections.length ? collectionPicker : undefined}
                            />
                        </section>
                        <section>
                            <h2 className="mb-5 font-serif text-4xl">Liked posts</h2>
                            <PostGrid
                                posts={data.likedPosts}
                                emptyText={UI_MESSAGES.noLikedPosts}
                                renderAction={data.collections.length ? collectionPicker : undefined}
                            />
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}
