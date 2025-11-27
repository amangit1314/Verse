import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sanityClient } from '@/lib/sanity';
import { Comment } from '@/types';

// Fetch comments for a post
export function useComments(postId: string) {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: async (): Promise<Comment[]> => {
            const query = `
        *[_type == "comment" && post._ref == $postId && approved == true && !defined(parentComment)] | order(createdAt desc) {
          _id,
          body,
          createdAt,
          author->{
            _id,
            name,
            image
          },
          "likesCount": count(*[_type == "like" && comment._ref == ^._id]),
          "replies": *[_type == "comment" && parentComment._ref == ^._id && approved == true] | order(createdAt asc) {
            _id,
            body,
            createdAt,
            author->{
              _id,
              name,
              image
            },
            "likesCount": count(*[_type == "like" && comment._ref == ^._id])
          }
        }
      `;
            return await sanityClient.fetch(query, { postId });
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
            // Invalidate comments for this post
            queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
            // Also invalidate the post to update comment count
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
