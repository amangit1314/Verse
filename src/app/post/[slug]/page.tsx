import { sanityClient, urlFor } from '@/lib/sanity';
import { Post } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';
import PostInteractions from '@/components/PostInteractions';
import CommentSection from '@/components/CommentSection';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function getPost(slug: string): Promise<Post | null> {
    const query = `
    *[_type == "post" && slug.current == $slug][0]{
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      author->{
        _id,
        name,
        slug,
        image,
        bio
      },
      mainImage,
      categories[]->{
        _id,
        title,
        slug
      },
      publishedAt,
      description,
      body,
      "likesCount": count(*[_type == "like" && post._ref == ^._id]),
      "commentsCount": count(*[_type == "comment" && post._ref == ^._id && approved == true])
    }
  `;

    return await sanityClient.fetch(query, { slug });
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="flex-1">
            <article className="max-w-3xl mx-auto px-6 py-12">
                {/* Title */}
                <h1 className="text-5xl font-serif font-bold mb-4">{post.title}</h1>

                {/* Description */}
                {post.description && (
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        {post.description}
                    </p>
                )}

                {/* Author Info */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                    <Link
                        href={`/author/${post.author.slug.current}`}
                        className="flex items-center space-x-3"
                    >
                        {post.author.image && (
                            <Image
                                src={urlFor(post.author.image).width(48).height(48).url() || ''}
                                alt={post.author.name}
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                        )}
                        <div>
                            <p className="font-medium">{post.author.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(post.publishedAt || post._createdAt).toLocaleDateString(
                                    'en-US',
                                    { month: 'long', day: 'numeric', year: 'numeric' }
                                )}
                            </p>
                        </div>
                    </Link>

                    <PostInteractions postId={post._id} initialLikes={post.likesCount || 0} />
                </div>

                {/* Main Image */}
                {post.mainImage && (
                    <div className="mb-12">
                        <Image
                            src={urlFor(post.mainImage).width(1200).height(600).url() || ''}
                            alt={post.title}
                            width={1200}
                            height={600}
                            className="w-full rounded-lg"
                        />
                    </div>
                )}

                {/* Body */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                    <PortableText value={post.body} />
                </div>

                {/* Comments */}
                <CommentSection postId={post._id} />
            </article>
        </main>
    );
}
