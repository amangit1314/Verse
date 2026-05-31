import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post } from '@/types';
import { getAppwriteFallbackHeaders } from '@/lib/appwrite-auth';
import { API_ROUTES } from '@/lib/constants';

// Fetch all posts
export function usePosts() {
    return useQuery({
        queryKey: ['posts'],
        queryFn: async (): Promise<Post[]> => {
            const response = await fetch(API_ROUTES.posts);
            if (!response.ok) throw new Error('Failed to load posts');
            return response.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Fetch single post by slug
export function usePost(slug: string) {
    return useQuery({
        queryKey: ['post', slug],
        queryFn: async (): Promise<Post | null> => {
            const response = await fetch(`${API_ROUTES.post}?slug=${encodeURIComponent(slug)}`);
            if (!response.ok) throw new Error('Failed to load post');
            return response.json();
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
    });
}

// Like/Unlike post mutation
export function useLikePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: string) => {
            const response = await fetch(API_ROUTES.like, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAppwriteFallbackHeaders() },
                body: JSON.stringify({ postId }),
            });
            if (!response.ok) throw new Error('Failed to like post');
            return response.json();
        },
        onSuccess: (_, postId) => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
        },
    });
}

// Save/Unsave post mutation
export function useSavePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: string) => {
            const response = await fetch(API_ROUTES.save, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAppwriteFallbackHeaders() },
                body: JSON.stringify({ postId }),
            });
            if (!response.ok) throw new Error('Failed to save post');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
        },
    });
}
