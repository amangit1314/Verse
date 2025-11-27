import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sanityClient } from '@/lib/sanity';
import { Post } from '@/types';

// Fetch all posts
export function usePosts() {
    return useQuery({
        queryKey: ['posts'],
        queryFn: async (): Promise<Post[]> => {
            const query = `
        *[_type == "post"] | order(publishedAt desc, _createdAt desc) {
          _id,
          _createdAt,
          _updatedAt,
          title,
          slug,
          author->{
            _id,
            name,
            slug,
            image
          },
          mainImage,
          categories[]->{
            _id,
            title,
            slug
          },
          publishedAt,
          description,
          "likesCount": count(*[_type == "like" && post._ref == ^._id]),
          "commentsCount": count(*[_type == "comment" && post._ref == ^._id && approved == true])
        }
      `;
            return await sanityClient.fetch(query);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Fetch single post by slug
export function usePost(slug: string) {
    return useQuery({
        queryKey: ['post', slug],
        queryFn: async (): Promise<Post | null> => {
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
            const response = await fetch('/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId }),
            });
            if (!response.ok) throw new Error('Failed to like post');
            return response.json();
        },
        onSuccess: (_, postId) => {
            // Invalidate and refetch posts
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
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
