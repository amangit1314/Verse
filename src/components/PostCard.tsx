import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { urlFor } from '@/lib/sanity';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <article className="py-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-6">
                <div className="flex-1">
                    {/* Author Info */}
                    <div className="flex items-center space-x-2 mb-3">
                        {post.author.image && (
                            <Image
                                src={urlFor(post.author.image).width(40).height(40).url() || ''}
                                alt={post.author.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        )}
                        <div>
                            <Link
                                href={`/author/${post.author.slug.current}`}
                                className="font-medium hover:underline"
                            >
                                {post.author.name}
                            </Link>
                        </div>
                    </div>

                    {/* Post Content */}
                    <Link href={`/post/${post.slug.current}`}>
                        <h2 className="text-2xl font-bold font-serif mb-2 hover:underline line-clamp-2">
                            {post.title}
                        </h2>
                        {post.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {post.description}
                            </p>
                        )}
                    </Link>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                            <span>{new Date(post.publishedAt || post._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4" />
                                <span>{post.likesCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.commentsCount || 0}</span>
                            </div>
                        </div>
                        <button className="hover:text-black dark:hover:text-white">
                            <Bookmark className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Post Image */}
                {post.mainImage && (
                    <Link href={`/post/${post.slug.current}`} className="flex-shrink-0">
                        <Image
                            src={urlFor(post.mainImage).width(200).height(134).url() || ''}
                            alt={post.title}
                            width={200}
                            height={134}
                            className="rounded-lg object-cover"
                        />
                    </Link>
                )}
            </div>
        </article>
    );
}
