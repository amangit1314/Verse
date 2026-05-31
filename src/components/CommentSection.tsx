'use client';

import { useComments, useCreateComment } from '@/hooks/useComments';
import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Comment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { UI_MESSAGES } from '@/lib/constants';

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { user } = useAuth();
    const { data: comments = [], isLoading } = useComments(postId);
    const createComment = useCreateComment();

    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

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
                        src={comment.author.image}
                        alt={comment.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                )}
                <div className="flex-1">
                    <div className="rounded-md bg-white p-4 dark:bg-[#1b1a17]">
                        <p className="font-medium mb-1">{comment.author.name}</p>
                        <p className="text-stone-700 dark:text-stone-300">{comment.body}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-stone-500 dark:text-stone-400">
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
                                className="w-full resize-none rounded-md border border-stone-300 bg-white p-3 outline-none focus:border-stone-900 dark:border-stone-700 dark:bg-[#1b1a17] dark:focus:border-stone-300"
                                rows={3}
                            />
                            <div className="flex space-x-2 mt-2">
                                <button
                                    type="submit"
                                    disabled={createComment.isPending}
                                    className="rounded-full bg-[#1a8917] px-4 py-2 text-white hover:bg-[#156d13] disabled:opacity-50"
                                >
                                    {createComment.isPending ? 'Posting...' : 'Reply'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReplyTo(null);
                                        setNewComment('');
                                    }}
                                    className="px-4 py-2 text-stone-600 hover:text-black dark:text-stone-400 dark:hover:text-white"
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
        return <div className="py-8 text-center text-stone-500 dark:text-stone-400">Loading comments...</div>;
    }

    return (
        <div className="mt-12 border-t border-stone-300 pt-12 dark:border-stone-800">
            <h2 className="mb-8 text-2xl font-semibold">
                Comments ({comments.length})
            </h2>

            {user ? (
                <form onSubmit={(e) => handleSubmit(e)} className="mb-12">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full resize-none rounded-md border border-stone-300 bg-white p-4 outline-none focus:border-stone-900 dark:border-stone-700 dark:bg-[#1b1a17] dark:focus:border-stone-300"
                        rows={4}
                    />
                    <button
                        type="submit"
                        disabled={createComment.isPending || !newComment.trim()}
                        className="mt-3 rounded-full bg-[#1a8917] px-6 py-2 text-white hover:bg-[#156d13] disabled:opacity-50"
                    >
                        {createComment.isPending ? 'Posting...' : 'Respond'}
                    </button>
                </form>
            ) : (
                <p className="mb-12 text-stone-500 dark:text-stone-400">
                    {UI_MESSAGES.signInToComment}
                </p>
            )}

            <div>
                {comments.map((comment) => (
                    <CommentItem key={comment._id} comment={comment} />
                ))}
            </div>
        </div>
    );
}
