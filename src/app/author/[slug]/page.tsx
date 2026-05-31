import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, Heart, MessageCircle, Search } from 'lucide-react';
import PostCard from '@/components/PostCard';
import {
    appwriteCollections,
    appwriteDatabaseId,
    appwriteQueries,
    createAppwriteServerDatabases,
    getAuthorBySlug,
    transformAuthor,
    transformPost,
} from '@/lib/appwrite-server';
import { Post } from '@/types';
import { getPostPath } from '@/lib/routes';
import { APPWRITE_FIELD } from '@/lib/constants';
import { PostDocument } from '@/types/appwrite';

interface AuthorPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        filter?: string;
    }>;
}

async function getAuthorProfile(slug: string) {
    const authorDoc = await getAuthorBySlug(slug);
    if (!authorDoc) {
        return null;
    }

    const databases = createAppwriteServerDatabases();
    const postsResult = await databases.listDocuments<PostDocument>(appwriteDatabaseId, appwriteCollections.posts, [
        appwriteQueries.equal(APPWRITE_FIELD.authorId, authorDoc.$id),
        appwriteQueries.orderDesc(APPWRITE_FIELD.publishedAt),
    ]);

    return {
        author: transformAuthor(authorDoc),
        posts: postsResult.documents.map(transformPost),
    };
}

function filterPosts(posts: Post[], filter: string) {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return posts;

    return posts.filter((post) => {
        const text = [post.title, post.description, post.body, ...(post.categories || []).map((category) => category.title)]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return text.includes(normalized);
    });
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
    const { slug } = await params;
    const { filter = '' } = await searchParams;
    const profile = await getAuthorProfile(slug);

    if (!profile) {
        notFound();
    }

    const posts = filterPosts(profile.posts, filter);
    const totalLikes = profile.posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
    const totalComments = profile.posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
    const featuredPost = profile.posts[0];

    return (
        <main className="flex-1">
            <section className="border-b border-stone-300 bg-white dark:border-stone-800 dark:bg-[#1b1a17]">
                <div className="container-medium py-10 md:py-14">
                    <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
                        <div className="flex gap-5">
                            {profile.author.image ? (
                                <Image
                                    src={profile.author.image}
                                    alt={profile.author.name}
                                    width={96}
                                    height={96}
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-4xl font-semibold text-white dark:bg-white dark:text-black">
                                    {profile.author.name[0]}
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-stone-500 dark:text-stone-400">Author</p>
                                <h1 className="mt-1 font-serif text-5xl leading-tight md:text-6xl">
                                    {profile.author.name}
                                </h1>
                                {profile.author.bio && (
                                    <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-400">
                                        {profile.author.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="border border-stone-300 px-4 py-3 dark:border-stone-700">
                                <BookOpen className="mx-auto h-4 w-4 text-stone-500" />
                                <p className="mt-2 text-2xl font-semibold">{profile.posts.length}</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">Posts</p>
                            </div>
                            <div className="border border-stone-300 px-4 py-3 dark:border-stone-700">
                                <Heart className="mx-auto h-4 w-4 text-stone-500" />
                                <p className="mt-2 text-2xl font-semibold">{totalLikes}</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">Likes</p>
                            </div>
                            <div className="border border-stone-300 px-4 py-3 dark:border-stone-700">
                                <MessageCircle className="mx-auto h-4 w-4 text-stone-500" />
                                <p className="mt-2 text-2xl font-semibold">{totalComments}</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">Replies</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container-medium py-10 md:py-14">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,720px)_1fr]">
                    <div>
                        <div className="mb-6 flex flex-col gap-4 border-b border-stone-300 pb-4 dark:border-stone-800 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="font-serif text-3xl">Stories by {profile.author.name}</h2>
                                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                                    {posts.length} {posts.length === 1 ? 'story' : 'stories'} {filter ? `matching "${filter}"` : ''}
                                </p>
                            </div>
                            <form className="relative md:w-64">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                                <input
                                    name="filter"
                                    defaultValue={filter}
                                    placeholder="Filter stories"
                                    className="w-full rounded-full border border-stone-300 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-stone-900 dark:border-stone-700 dark:bg-[#1b1a17] dark:focus:border-stone-300"
                                />
                            </form>
                        </div>

                        {posts.length > 0 ? (
                            posts.map((post) => <PostCard key={post._id} post={post} />)
                        ) : (
                            <div className="border border-stone-300 bg-white p-8 text-sm text-stone-500 dark:border-stone-800 dark:bg-[#1b1a17] dark:text-stone-400">
                                No posts found for this filter.
                            </div>
                        )}
                    </div>

                    <aside className="hidden lg:block">
                        <div className="sticky top-24 border-l border-stone-300 pl-8 dark:border-stone-800">
                            <h3 className="text-sm font-semibold">Start with this</h3>
                            {featuredPost ? (
                                <Link href={getPostPath(featuredPost)} className="mt-4 block">
                                    <p className="font-serif text-2xl leading-tight">{featuredPost.title}</p>
                                    {featuredPost.description && (
                                        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                                            {featuredPost.description}
                                        </p>
                                    )}
                                </Link>
                            ) : (
                                <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">No stories yet.</p>
                            )}
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
