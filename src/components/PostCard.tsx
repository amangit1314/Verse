import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { getAuthorPath, getPostPath } from '@/lib/routes';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const publishedAt = new Date(post.publishedAt || post._createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    return (
        <article className="border-b border-stone-300 py-8 dark:border-stone-800">
            <div className="flex gap-5 md:gap-8">
                <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center space-x-2 text-sm">
                        {post.author.image && (
                            <Image
                                src={post.author.image}
                                alt={post.author.name}
                                width={28}
                                height={28}
                                className="rounded-full"
                            />
                        )}
                        <Link
                            href={getAuthorPath(post.author)}
                            className="font-medium hover:underline"
                        >
                            {post.author.name}
                        </Link>
                    </div>

                    <Link href={getPostPath(post)}>
                        <h2 className="mb-2 line-clamp-2 font-serif text-2xl font-bold leading-tight md:text-3xl">
                            {post.title}
                        </h2>
                        {post.description && (
                            <p className="mb-5 line-clamp-2 text-base leading-6 text-stone-600 dark:text-stone-400">
                                {post.description}
                            </p>
                        )}
                    </Link>

                    <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
                        <div className="flex items-center space-x-4">
                            <span>{publishedAt}</span>
                            <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4" />
                                <span>{post.likesCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.commentsCount || 0}</span>
                            </div>
                        </div>
                        <button className="transition-colors hover:text-black dark:hover:text-white" aria-label="Save post">
                            <Bookmark className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {post.mainImage && (
                    <Link href={getPostPath(post)} className="shrink-0">
                        <Image
                            src={post.mainImage}
                            alt={post.title}
                            width={180}
                            height={120}
                            className="aspect-[3/2] w-28 object-cover md:w-44"
                        />
                    </Link>
                )}
            </div>
        </article>
    );
}
