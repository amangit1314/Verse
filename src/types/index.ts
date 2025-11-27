export interface Post {
    _id: string;
    _createdAt: string;
    _updatedAt: string;
    title: string;
    slug: {
        current: string;
    };
    author: Author;
    mainImage?: {
        asset: {
            _ref: string;
            url: string;
        };
    };
    categories?: Category[];
    publishedAt: string;
    description?: string;
    body: any[];
    likesCount?: number;
    commentsCount?: number;
}

export interface Author {
    _id: string;
    name: string;
    slug: {
        current: string;
    };
    image?: {
        asset: {
            _ref: string;
            url: string;
        };
    };
    bio?: any[];
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
    parentComment?: {
        _ref: string;
    };
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
