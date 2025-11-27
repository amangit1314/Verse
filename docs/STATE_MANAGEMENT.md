# State Management & Caching Architecture

## Overview

The project uses a hybrid approach for state management:
- **Zustand** for client-side global state
- **TanStack Query** for server state caching and data fetching

---

## Zustand Stores

### 1. Auth Store (`src/stores/authStore.ts`)
Manages authentication state with persistence.

```typescript
const { user, setUser, clearUser } = useAuthStore();
```

**Features:**
- Persisted to localStorage
- Stores current user data
- Syncs with NextAuth session

### 2. UI Store (`src/stores/uiStore.ts`)
Manages UI-related state.

```typescript
const { sidebarOpen, toggleSidebar } = useUIStore();
```

**State:**
- Theme preference
- Sidebar open/close
- Modal states

### 3. Interaction Store (`src/stores/interactionStore.ts`)
Tracks user interactions optimistically.

```typescript
const { likedPosts, savedPosts, toggleLikePost } = useInteractionStore();
```

**Features:**
- Optimistic UI updates
- Tracks liked posts/comments
- Tracks saved posts
- Instant feedback before API response

---

## TanStack Query Hooks

### Posts (`src/hooks/usePosts.ts`)

#### `usePosts()`
Fetches all posts with caching.

```typescript
const { data: posts, isLoading, error } = usePosts();
```

**Cache:** 5 minutes

#### `usePost(slug)`
Fetches single post by slug.

```typescript
const { data: post } = usePost('my-post-slug');
```

#### `useLikePost()`
Mutation for liking/unliking posts.

```typescript
const likePost = useLikePost();
await likePost.mutateAsync(postId);
```

**Auto-invalidates:** Posts queries

#### `useSavePost()`
Mutation for saving/unsaving posts.

```typescript
const savePost = useSavePost();
await savePost.mutateAsync(postId);
```

### Comments (`src/hooks/useComments.ts`)

#### `useComments(postId)`
Fetches comments for a post with nested replies.

```typescript
const { data: comments } = useComments(postId);
```

**Cache:** 2 minutes

#### `useCreateComment()`
Mutation for creating comments/replies.

```typescript
const createComment = useCreateComment();
await createComment.mutateAsync({ postId, body, parentComment });
```

**Auto-invalidates:** Comments and posts queries

---

## Benefits

### 🚀 Performance
- **Automatic caching** - No redundant API calls
- **Background refetching** - Keep data fresh
- **Optimistic updates** - Instant UI feedback

### 🎯 Developer Experience
- **Type-safe** - Full TypeScript support
- **Declarative** - Simple hook-based API
- **Devtools** - React Query Devtools for debugging

### 💾 Data Consistency
- **Automatic invalidation** - Related queries update automatically
- **Stale-while-revalidate** - Show cached data while fetching fresh
- **Error handling** - Built-in retry logic

---

## Usage Examples

### Fetching Posts
```typescript
'use client';

import { usePosts } from '@/hooks/usePosts';

export default function PostFeed() {
  const { data: posts, isLoading } = usePosts();
  
  if (isLoading) return <div>Loading...</div>;
  
  return posts?.map(post => <PostCard key={post._id} post={post} />);
}
```

### Liking a Post
```typescript
import { useLikePost } from '@/hooks/usePosts';
import { useInteractionStore } from '@/stores/interactionStore';

const likePost = useLikePost();
const { toggleLikePost } = useInteractionStore();

const handleLike = async () => {
  // Optimistic update
  toggleLikePost(postId);
  
  try {
    await likePost.mutateAsync(postId);
  } catch (error) {
    // Revert on error
    toggleLikePost(postId);
  }
};
```

### Creating a Comment
```typescript
import { useCreateComment } from '@/hooks/useComments';

const createComment = useCreateComment();

const handleSubmit = async () => {
  await createComment.mutateAsync({
    postId,
    body: commentText,
    parentComment: replyToId, // Optional for replies
  });
};
```

---

## Configuration

### Query Client Settings
Located in `src/components/Providers.tsx`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

**Customize per query:**
```typescript
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 1000 * 60 * 10, // 10 minutes for this query
})
```

---

## Best Practices

1. **Use Zustand for:**
   - UI state (modals, sidebars)
   - Client-only state
   - Optimistic updates

2. **Use TanStack Query for:**
   - Server data fetching
   - Caching API responses
   - Mutations with invalidation

3. **Optimistic Updates:**
   - Update Zustand store immediately
   - Call mutation
   - Revert Zustand on error

4. **Cache Invalidation:**
   - Mutations auto-invalidate related queries
   - Manual: `queryClient.invalidateQueries({ queryKey: ['posts'] })`
