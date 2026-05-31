'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import { Post } from '@/types';
import { getPostPath } from '@/lib/routes';

interface PostGridProps {
    posts: Post[];
    emptyText: string;
    renderAction?: (post: Post) => ReactNode;
}

export default function PostGrid({ posts, emptyText, renderAction }: PostGridProps) {
    if (!posts.length) {
        return (
            <div className="border border-stone-300 bg-white p-8 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-[#1b1a17] dark:text-stone-400">
                {emptyText}
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
                <article
                    key={post._id}
                    className="border border-stone-300 bg-white dark:border-stone-800 dark:bg-[#1b1a17]"
                >
                    {post.mainImage && (
                        <Link href={getPostPath(post)}>
                            <Image
                                src={post.mainImage}
                                alt={post.title}
                                width={640}
                                height={360}
                                className="aspect-video w-full object-cover"
                            />
                        </Link>
                    )}
                    <div className="p-5">
                        <Link href={getPostPath(post)}>
                            <h3 className="line-clamp-2 font-serif text-2xl font-semibold leading-tight">
                                {post.title}
                            </h3>
                            {post.description && (
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
                                    {post.description}
                                </p>
                            )}
                        </Link>
                        <div className="mt-5 flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
                            <div className="flex items-center gap-3">
                                <span>{new Date(post.publishedAt || post._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span className="flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {post.likesCount || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    {post.commentsCount || 0}
                                </span>
                            </div>
                            <Bookmark className="h-4 w-4" />
                        </div>
                        {renderAction && <div className="mt-4">{renderAction(post)}</div>}
                    </div>
                </article>
            ))}
        </div>
    );
}
