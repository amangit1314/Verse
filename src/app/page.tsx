import PostCard from '@/components/PostCard';
import { Post } from '@/types';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, transformPost } from '@/lib/appwrite-server';
import Link from 'next/link';
import { APPWRITE_FIELD } from '@/lib/constants';
import { PostDocument } from '@/types/appwrite';

async function getPosts(): Promise<Post[]> {
    try {
        const databases = createAppwriteServerDatabases();
        const result = await databases.listDocuments<PostDocument>(appwriteDatabaseId, appwriteCollections.posts, [
            appwriteQueries.orderDesc(APPWRITE_FIELD.publishedAt),
        ]);

        return result.documents.map(transformPost);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
    }
}

export default async function Home() {
    const posts = await getPosts();

    return (
        <main className="flex-1">
            <section className="border-b border-stone-900 bg-[#f7d852] text-[#242424] dark:border-stone-700 dark:bg-[#d7c36a]">
                <div className="container-medium grid min-h-105 items-end gap-8 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
                    <div className="max-w-3xl">
                        <h1 className="font-serif text-7xl font-normal leading-[0.92] text-balance md:text-8xl">
                            Stay curious.
                        </h1>
                        <p className="mt-6 max-w-xl text-xl leading-8 md:text-2xl">
                            Discover sharp essays, practical ideas, and personal stories from independent writers.
                        </p>
                        <Link
                            href="#feed"
                            className="mt-8 inline-flex rounded-full bg-[#242424] px-8 py-3 text-base font-medium text-white transition-colors hover:bg-black"
                        >
                            Start reading
                        </Link>
                    </div>
                    <div className="hidden justify-end md:flex">
                        <div className="grid w-full max-w-sm grid-cols-5 gap-3 text-5xl font-serif leading-none opacity-90">
                            {Array.from({ length: 45 }).map((_, index) => (
                                <span key={index}>{index % 3 === 0 ? 'V' : index % 3 === 1 ? 'e' : 'r'}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="feed" className="container-medium py-10 md:py-14">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,720px)_1fr]">
                    <div>
                        <div className="mb-6 flex items-center gap-4 border-b border-stone-300 pb-3 text-sm dark:border-stone-800">
                            <span className="font-medium text-[#242424] dark:text-[#f5f1e8]">For you</span>
                            <span className="text-stone-500 dark:text-stone-400">Following</span>
                            <span className="text-stone-500 dark:text-stone-400">Featured</span>
                        </div>
                        {posts.length > 0 ? (
                            posts.map((post) => <PostCard key={post._id} post={post} />)
                        ) : (
                            <div className="py-16 text-center">
                                <p className="text-stone-500 dark:text-stone-400">
                                    No posts yet. Create your first article in Appwrite to start the feed.
                                </p>
                            </div>
                        )}
                    </div>

                    <aside className="hidden lg:block">
                        <div className="sticky top-24 border-l border-stone-300 pl-8 dark:border-stone-800">
                            <h2 className="text-sm font-semibold">Discover more of what matters</h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Writing', 'Design', 'Startup', 'Life', 'Technology', 'Culture', 'Product'].map((topic) => (
                                    <span
                                        key={topic}
                                        className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-[#1b1a17] dark:text-stone-300"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-8 border-t border-stone-300 pt-6 text-sm leading-6 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                                Verse keeps the familiar calm reading experience, then adds a warmer palette, sharper spacing, and Appwrite-powered content.
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
