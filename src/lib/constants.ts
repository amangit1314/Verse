export const API_ROUTES = {
    authLogin: '/api/auth/login',
    comments: '/api/comment',
    like: '/api/like',
    me: '/api/me',
    meCollections: '/api/me/collections',
    post: '/api/post',
    posts: '/api/posts',
    save: '/api/save',
} as const;

export const APP_ROUTES = {
    home: '/',
    signIn: '/auth/signin',
    me: '/me',
    saved: '/me/saved',
} as const;

export const HTTP_STATUS = {
    badRequest: 400,
    unauthorized: 401,
    notFound: 404,
    internalServerError: 500,
} as const;

export const API_MESSAGES = {
    collectionNameRequired: 'Collection name is required',
    internalServerError: 'Internal server error',
    loginFailed: 'Login failed',
    missingPostId: 'Missing postId',
    missingSlug: 'Missing slug',
    notFound: 'Not found',
    postNotFound: 'Post not found',
    providePostOrCommentId: 'Must provide postId or commentId',
    unauthorized: 'Unauthorized',
} as const;

export const UI_MESSAGES = {
    addToCollection: 'Add to collection',
    collectionNotFound: 'Collection not found.',
    couldNotLoadProfile: 'Could not load your profile.',
    loadingCollection: 'Loading collection...',
    loadingProfile: 'Loading your profile...',
    noLikedPosts: 'No liked posts yet.',
    noPostsInCollection: 'No posts in this collection yet.',
    noSavedPosts: 'No saved posts yet.',
    noUserPosts: 'No posts by you yet.',
    profileUnavailable: 'Profile unavailable.',
    signInToComment: 'Sign in to leave a comment.',
} as const;

export const APPWRITE_FIELD = {
    authorId: 'authorId',
    collectionId: 'collectionId',
    commentId: 'commentId',
    email: 'email',
    parentCommentId: 'parentCommentId',
    postId: 'postId',
    publishedAt: 'publishedAt',
    slug: 'slug',
} as const;

export const EMPTY_PARENT_COMMENT_ID = '';
