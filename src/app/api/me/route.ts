import { NextRequest, NextResponse } from 'next/server';
import {
    appwriteCollections,
    appwriteDatabaseId,
    appwriteQueries,
    createAppwriteServerDatabases,
    getCurrentUserFromRequest,
    getOrCreateAuthorForUser,
    getPostsByIds,
    transformPost,
    transformUserCollection,
} from '@/lib/appwrite-server';
import { API_MESSAGES, APPWRITE_FIELD, HTTP_STATUS } from '@/lib/constants';
import { LikeDocument, SaveDocument, UserCollectionDocument, PostDocument } from '@/types/appwrite';

interface ProfileUpdateBody {
    name?: string;
    bio?: string;
    image?: string;
    slug?: string;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);
        if (!user || !user.email) {
            return NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized });
        }

        const databases = createAppwriteServerDatabases();
        const author = await getOrCreateAuthorForUser(user);

        const [postsResult, savesResult, likesResult, collectionsResult] = await Promise.all([
            databases.listDocuments<PostDocument>(appwriteDatabaseId, appwriteCollections.posts, [
                appwriteQueries.equal(APPWRITE_FIELD.authorId, author.$id),
                appwriteQueries.orderDesc(APPWRITE_FIELD.publishedAt),
            ]),
            databases.listDocuments<SaveDocument>(appwriteDatabaseId, appwriteCollections.saves, [
                appwriteQueries.equal(APPWRITE_FIELD.authorId, author.$id),
                appwriteQueries.orderDesc('$createdAt'),
            ]),
            databases.listDocuments<LikeDocument>(appwriteDatabaseId, appwriteCollections.likes, [
                appwriteQueries.equal(APPWRITE_FIELD.authorId, author.$id),
                appwriteQueries.orderDesc('$createdAt'),
            ]),
            databases.listDocuments<UserCollectionDocument>(appwriteDatabaseId, appwriteCollections.userCollections, [
                appwriteQueries.equal(APPWRITE_FIELD.authorId, author.$id),
                appwriteQueries.orderDesc('$createdAt'),
            ]),
        ]);

        const savedPosts = await getPostsByIds(savesResult.documents.map((save) => save.postId));
        const likedPosts = await getPostsByIds(
            likesResult.documents
                .map((like) => like.postId)
                .filter((postId): postId is string => Boolean(postId))
        );

        return NextResponse.json({
            user: {
                id: user.$id,
                name: user.name,
                email: user.email,
            },
            author: {
                _id: author.$id,
                name: author.name,
                email: author.email,
                image: author.image || '',
                bio: author.bio || '',
                slug: { current: author.slug },
            },
            posts: postsResult.documents.map(transformPost),
            savedPosts,
            likedPosts,
            collections: collectionsResult.documents.map(transformUserCollection),
        });
    } catch (error) {
        console.error('Error loading profile:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);
        if (!user || !user.email) {
            return NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized });
        }

        const { name, bio, image, slug } = (await request.json()) as ProfileUpdateBody;
        const databases = createAppwriteServerDatabases();
        const author = await getOrCreateAuthorForUser(user);

        const updatedAuthor = await databases.updateDocument(
            appwriteDatabaseId,
            appwriteCollections.authors,
            author.$id,
            {
                name: String(name || author.name).trim(),
                bio: String(bio || '').trim(),
                image: String(image || '').trim(),
                slug: String(slug || author.slug).trim(),
            }
        );

        return NextResponse.json({
            author: {
                _id: updatedAuthor.$id,
                name: updatedAuthor.name,
                email: updatedAuthor.email,
                image: updatedAuthor.image || '',
                bio: updatedAuthor.bio || '',
                slug: { current: updatedAuthor.slug },
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}
