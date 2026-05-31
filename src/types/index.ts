export interface Post {
    _id: string;
    _createdAt: string;
    _updatedAt: string;
    title: string;
    slug: {
        current: string;
    };
    author: Author;
    mainImage?: string;
    categories?: Category[];
    publishedAt: string;
    description?: string;
    body: string;
    likesCount?: number;
    commentsCount?: number;
}

export interface Author {
    _id: string;
    name: string;
    slug: {
        current: string;
    };
    image?: string;
    bio?: string;
    email?: string;
    followers?: Author[];
    following?: Author[];
}

export interface Category {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    description?: string;
}

export interface Comment {
    _id: string;
    post: {
        _ref: string;
    };
    author: Author;
    body: string;
    parentCommentId?: string | null;
    approved: boolean;
    createdAt: string;
    likesCount?: number;
    replies?: Comment[];
}

export interface Like {
    _id: string;
    author: {
        _ref: string;
    };
    post?: {
        _ref: string;
    };
    comment?: {
        _ref: string;
    };
    createdAt: string;
}

export interface Save {
    _id: string;
    author: {
        _ref: string;
    };
    post: {
        _ref: string;
    };
    createdAt: string;
}
