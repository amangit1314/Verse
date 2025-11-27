import { create } from 'zustand';

interface InteractionState {
    likedPosts: Set<string>;
    savedPosts: Set<string>;
    likedComments: Set<string>;
    toggleLikePost: (postId: string) => void;
    toggleSavePost: (postId: string) => void;
    toggleLikeComment: (commentId: string) => void;
    setLikedPosts: (postIds: string[]) => void;
    setSavedPosts: (postIds: string[]) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
    likedPosts: new Set(),
    savedPosts: new Set(),
    likedComments: new Set(),

    toggleLikePost: (postId) =>
        set((state) => {
            const newLiked = new Set(state.likedPosts);
            if (newLiked.has(postId)) {
                newLiked.delete(postId);
            } else {
                newLiked.add(postId);
            }
            return { likedPosts: newLiked };
        }),

    toggleSavePost: (postId) =>
        set((state) => {
            const newSaved = new Set(state.savedPosts);
            if (newSaved.has(postId)) {
                newSaved.delete(postId);
            } else {
                newSaved.add(postId);
            }
            return { savedPosts: newSaved };
        }),

    toggleLikeComment: (commentId) =>
        set((state) => {
            const newLiked = new Set(state.likedComments);
            if (newLiked.has(commentId)) {
                newLiked.delete(commentId);
            } else {
                newLiked.add(commentId);
            }
            return { likedComments: newLiked };
        }),

    setLikedPosts: (postIds) => set({ likedPosts: new Set(postIds) }),
    setSavedPosts: (postIds) => set({ savedPosts: new Set(postIds) }),
}));
