'use client';

import { useLikePost, useSavePost } from '@/hooks/usePosts';
import { useInteractionStore } from '@/stores/interactionStore';
import { Heart, Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PostInteractionsProps {
    postId: string;
    initialLikes: number;
}

export default function PostInteractions({
    postId,
    initialLikes,
}: PostInteractionsProps) {
    const { user } = useAuth();
    const likePost = useLikePost();
    const savePost = useSavePost();

    const { likedPosts, savedPosts, toggleLikePost, toggleSavePost } = useInteractionStore();

    const isLiked = likedPosts.has(postId);
    const isSaved = savedPosts.has(postId);

    const handleLike = async () => {
        if (!user) return;

        toggleLikePost(postId);
        try {
            await likePost.mutateAsync(postId);
        } catch (error) {
            // Revert on error
            toggleLikePost(postId);
            console.error('Error liking post:', error);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        toggleSavePost(postId);
        try {
            await savePost.mutateAsync(postId);
        } catch (error) {
            // Revert on error
            toggleSavePost(postId);
            console.error('Error saving post:', error);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <button
                onClick={handleLike}
                disabled={!user || likePost.isPending}
                className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-stone-500 dark:text-stone-400'
                    } hover:text-red-500 disabled:opacity-50 transition-colors`}
                aria-label="Like post"
            >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                <span>{initialLikes + (isLiked ? 1 : 0)}</span>
            </button>

            <button
                onClick={handleSave}
                disabled={!user || savePost.isPending}
                className={`${isSaved ? 'text-[#1a8917]' : 'text-stone-500 dark:text-stone-400'
                    } hover:text-[#1a8917] disabled:opacity-50 transition-colors`}
                aria-label="Save post"
            >
                <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
            </button>
        </div>
    );
}
