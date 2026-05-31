'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAppwriteFallbackHeaders } from '@/lib/appwrite-auth';
import { API_ROUTES, APP_ROUTES, UI_MESSAGES } from '@/lib/constants';
import { Post, UserCollection } from '@/types';
import PostGrid from '@/components/PostGrid';

export default function CollectionPage() {
    const params = useParams<{ collectionId: string }>();
    const [collection, setCollection] = useState<UserCollection | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const headers = useMemo(() => getAppwriteFallbackHeaders(), []);
    const collectionId = params.collectionId;

    useEffect(() => {
        if (!collectionId) return;

        const loadCollection = async () => {
            setLoading(true);
            const response = await fetch(`${API_ROUTES.meCollections}/${collectionId}`, { headers });
            if (response.status === 401) {
                window.location.href = APP_ROUTES.signIn;
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setCollection(data.collection);
                setPosts(data.posts);
            }
            setLoading(false);
        };

        loadCollection();
    }, [collectionId, headers]);

    return (
        <main className="container-medium flex-1 py-10 md:py-14">
            <Link href={APP_ROUTES.me} className="mb-8 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-black dark:text-stone-400 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to account
            </Link>

            {loading ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">{UI_MESSAGES.loadingCollection}</p>
            ) : collection ? (
                <>
                    <div className="mb-8 border-b border-stone-300 pb-8 dark:border-stone-800">
                        <h1 className="font-serif text-5xl">{collection.name}</h1>
                        {collection.description && (
                            <p className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">{collection.description}</p>
                        )}
                    </div>
                    <PostGrid posts={posts} emptyText={UI_MESSAGES.noPostsInCollection} />
                </>
            ) : (
                <div className="border border-stone-300 bg-white p-8 text-sm text-stone-600 dark:border-stone-800 dark:bg-[#1b1a17] dark:text-stone-300">
                    {UI_MESSAGES.collectionNotFound}
                </div>
            )}
        </main>
    );
}
