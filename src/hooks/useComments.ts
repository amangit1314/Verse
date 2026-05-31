import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment } from '@/types';
import { getAppwriteFallbackHeaders } from '@/lib/appwrite-auth';
import { API_ROUTES } from '@/lib/constants';

// Fetch comments for a post
export function useComments(postId: string) {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: async (): Promise<Comment[]> => {
            const response = await fetch(`${API_ROUTES.comments}?postId=${encodeURIComponent(postId)}`);
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            return response.json();
        },
        enabled: !!postId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// Create comment mutation
export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            postId,
            body,
            parentComment,
        }: {
            postId: string;
            body: string;
            parentComment?: string;
        }) => {
            const response = await fetch(API_ROUTES.comments, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAppwriteFallbackHeaders() },
                body: JSON.stringify({ postId, body, parentComment }),
            });
            if (!response.ok) throw new Error('Failed to create comment');
            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}

// Like comment mutation
export function useLikeComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId: string) => {
            const response = await fetch(API_ROUTES.like, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAppwriteFallbackHeaders() },
                body: JSON.stringify({ commentId }),
            });
            if (!response.ok) throw new Error('Failed to like comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
        },
    });
}
