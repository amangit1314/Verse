'use client';

import { useComments, useCreateComment } from '@/hooks/useComments';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
import { Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Comment } from '@/types';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { data: session } = useSession();
    const { data: comments = [], isLoading } = useComments(postId);
    const createComment = useCreateComment();

    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault();
        if (!session || !newComment.trim()) return;

        try {
            await createComment.mutateAsync({
                postId,
                body: newComment,
                parentComment: parentId,
            });
            setNewComment('');
            setReplyTo(null);
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
        <div className={`${isReply ? 'ml-12' : ''} mb-6`}>
            <div className="flex space-x-3">
                {comment.author.image && (
                    <Image
                        src={urlFor(comment.author.image).width(40).height(40).url() || ''}
                        alt={comment.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                )}
                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
                        <p className="font-medium mb-1">{comment.author.name}</p>
                        <p className="text-gray-700 dark:text-gray-300">{comment.body}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <button className="flex items-center space-x-1 hover:text-red-500">
                            <Heart className="w-4 h-4" />
                            <span>{comment.likesCount || 0}</span>
                        </button>
                        {!isReply && (
                            <button
                                onClick={() => setReplyTo(comment._id)}
                                className="flex items-center space-x-1 hover:text-blue-500"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Reply</span>
                            </button>
                        )}
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Reply Form */}
                    {replyTo === comment._id && (
                        <form onSubmit={(e) => handleSubmit(e, comment._id)} className="mt-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 resize-none"
                                rows={3}
                            />
                            <div className="flex space-x-2 mt-2">
                                <button
                                    type="submit"
                                    disabled={createComment.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
                                >
                                    {createComment.isPending ? 'Posting...' : 'Reply'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReplyTo(null);
                                        setNewComment('');
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4">
                            {comment.replies.map((reply) => (
                                <CommentItem key={reply._id} comment={reply} isReply />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="text-center py-8">Loading comments...</div>;
    }

    return (
        <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-8">
                Comments ({comments.length})
            </h2>

            {/* New Comment Form */}
            {session ? (
                <form onSubmit={(e) => handleSubmit(e)} className="mb-12">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 resize-none"
                        rows={4}
                    />
                    <button
                        type="submit"
                        disabled={createComment.isPending || !newComment.trim()}
                        className="mt-3 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
                    >
                        {createComment.isPending ? 'Posting...' : 'Respond'}
                    </button>
                </form>
            ) : (
                <p className="mb-12 text-gray-500 dark:text-gray-400">
                    Sign in to leave a comment.
                </p>
            )}

            {/* Comments List */}
            <div>
                {comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} />
                ))}
            </div>
        </div>
    );
}
