import { Models } from 'appwrite';

export type AppwriteDocument<T> = Models.Document & T;

export interface AuthorFields {
    name: string;
    email: string;
    image?: string;
    slug: string;
    bio?: string;
}

export interface PostFields {
    title: string;
    slug: string;
    authorId: string;
    authorName: string;
    authorSlug: string;
    authorImage?: string;
    authorBio?: string;
    authorEmail?: string;
    mainImage?: string;
    categories?: Array<{ _id: string; title: string; slug: { current: string }; description?: string }>;
    publishedAt?: string;
    description?: string;
    body: string;
    likesCount?: number;
    commentsCount?: number;
}

export interface CommentFields {
    postId: string;
    authorId: string;
    authorName: string;
    authorImage?: string;
    authorSlug: string;
    body: string;
    parentCommentId?: string;
    approved?: boolean;
    likesCount?: number;
}

export interface LikeFields {
    authorId: string;
    postId?: string;
    commentId?: string;
}

export interface SaveFields {
    authorId: string;
    postId: string;
}

export interface UserCollectionFields {
    name: string;
    description?: string;
    authorId: string;
    postsCount?: number;
}

export interface CollectionItemFields {
    collectionId: string;
    postId: string;
    authorId: string;
}

export type AuthorDocument = AppwriteDocument<AuthorFields>;
export type PostDocument = AppwriteDocument<PostFields>;
export type CommentDocument = AppwriteDocument<CommentFields>;
export type LikeDocument = AppwriteDocument<LikeFields>;
export type SaveDocument = AppwriteDocument<SaveFields>;
export type UserCollectionDocument = AppwriteDocument<UserCollectionFields>;
export type CollectionItemDocument = AppwriteDocument<CollectionItemFields>;
