import { Post } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostInteractions from '@/components/PostInteractions';
import CommentSection from '@/components/CommentSection';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, transformPost } from '@/lib/appwrite-server';
import { getAuthorPath } from '@/lib/routes';
import { APPWRITE_FIELD } from '@/lib/constants';
import { PostDocument } from '@/types/appwrite';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        author?: string;
    }>;
}

async function getPost(slug: string): Promise<Post | null> {
    const databases = createAppwriteServerDatabases();
    const result = await databases.listDocuments<PostDocument>(appwriteDatabaseId, appwriteCollections.posts, [
        appwriteQueries.equal(APPWRITE_FIELD.slug, slug),
        appwriteQueries.limit(1),
    ]);

    if (!result.documents.length) {
        return null;
    }

    return transformPost(result.documents[0]);
}

export default async function PostPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    await searchParams;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="flex-1">
            <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
                <h1 className="font-serif text-5xl font-normal leading-tight text-balance md:text-6xl">
                    {post.title}
                </h1>

                {post.description && (
                    <p className="mt-5 text-xl leading-8 text-stone-600 dark:text-stone-400">
                        {post.description}
                    </p>
                )}

                <div className="my-8 flex items-center justify-between border-y border-stone-300 py-5 dark:border-stone-800">
                    <Link
                        href={getAuthorPath(post.author)}
                        className="flex items-center space-x-3"
                    >
                        {post.author.image && (
                            <Image
                                src={post.author.image}
                                alt={post.author.name}
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                        )}
                        <div>
                            <p className="font-medium">{post.author.name}</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                {new Date(post.publishedAt || post._createdAt).toLocaleDateString(
                                    'en-US',
                                    { month: 'long', day: 'numeric', year: 'numeric' }
                                )}
                            </p>
                        </div>
                    </Link>

                    <PostInteractions postId={post._id} initialLikes={post.likesCount || 0} />
                </div>

                {post.mainImage && (
                    <div className="mb-12">
                        <Image
                            src={post.mainImage}
                            alt={post.title}
                            width={1200}
                            height={600}
                            className="w-full object-cover"
                        />
                    </div>
                )}

                <div className="article-body mb-12 max-w-none text-[#242424] dark:text-[#f5f1e8]">
                    {post.body.split('\n').map((paragraph, index) => (
                        paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                    ))}
                </div>

                <CommentSection postId={post._id} />
            </article>
        </main>
    );
}
