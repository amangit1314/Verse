import { Author, Post } from '@/types';

export function getAuthorPath(author: Author) {
    return `/author/${author.slug.current}`;
}

export function getPostPath(post: Post) {
    const authorName = post.author.name.trim();
    const query = authorName ? `?author=${encodeURIComponent(authorName)}` : '';

    return `/post/${post.slug.current}${query}`;
}
