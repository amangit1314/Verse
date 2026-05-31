import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment } from '@/types';

// Fetch comments for a post
export function useComments(postId: string) {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: async (): Promise<Comment[]> => {
            const response = await fetch(`/api/comment?postId=${encodeURIComponent(postId)}`);
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
            const response = await fetch('/api/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch('/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
