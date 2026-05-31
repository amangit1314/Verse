import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'appwrite';
import {
    appwriteCollections,
    appwriteDatabaseId,
    appwriteQueries,
    createAppwriteServerDatabases,
    getCurrentUserFromRequest,
    getOrCreateAuthorForUser,
    getPostsByIds,
    transformUserCollection,
} from '@/lib/appwrite-server';
import { API_MESSAGES, APPWRITE_FIELD, HTTP_STATUS } from '@/lib/constants';
import { CollectionItemDocument, UserCollectionDocument } from '@/types/appwrite';

interface AddCollectionItemBody {
    postId?: string;
}

interface RouteContext {
    params: Promise<{
        collectionId: string;
    }>;
}

async function getOwnedCollection(request: NextRequest, collectionId: string) {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !user.email) {
        return { error: NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized }) };
    }

    const databases = createAppwriteServerDatabases();
    const author = await getOrCreateAuthorForUser(user);
    const collection = await databases.getDocument<UserCollectionDocument>(
        appwriteDatabaseId,
        appwriteCollections.userCollections,
        collectionId
    );

    if (collection.authorId !== author.$id) {
        return { error: NextResponse.json({ error: API_MESSAGES.notFound }, { status: HTTP_STATUS.notFound }) };
    }

    return { databases, author, collection };
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { collectionId } = await context.params;
        const owned = await getOwnedCollection(request, collectionId);
        if (owned.error) return owned.error;

        const itemsResult = await owned.databases.listDocuments<CollectionItemDocument>(
            appwriteDatabaseId,
            appwriteCollections.collectionItems,
            [
                appwriteQueries.equal(APPWRITE_FIELD.collectionId, collectionId),
                appwriteQueries.orderDesc('$createdAt'),
            ]
        );

        const posts = await getPostsByIds(itemsResult.documents.map((item) => item.postId));

        return NextResponse.json({
            collection: transformUserCollection(owned.collection),
            posts,
        });
    } catch (error) {
        console.error('Error loading collection:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { collectionId } = await context.params;
        const { postId } = (await request.json()) as AddCollectionItemBody;
        if (!postId) {
            return NextResponse.json({ error: API_MESSAGES.missingPostId }, { status: HTTP_STATUS.badRequest });
        }

        const owned = await getOwnedCollection(request, collectionId);
        if (owned.error) return owned.error;

        const existing = await owned.databases.listDocuments<CollectionItemDocument>(
            appwriteDatabaseId,
            appwriteCollections.collectionItems,
            [
                appwriteQueries.equal(APPWRITE_FIELD.collectionId, collectionId),
                appwriteQueries.equal(APPWRITE_FIELD.postId, postId),
                appwriteQueries.limit(1),
            ]
        );

        if (existing.documents.length > 0) {
            return NextResponse.json({ added: false });
        }

        await owned.databases.createDocument(
            appwriteDatabaseId,
            appwriteCollections.collectionItems,
            ID.unique(),
            {
                collectionId,
                postId,
                authorId: owned.author.$id,
            }
        );

        await owned.databases.updateDocument(
            appwriteDatabaseId,
            appwriteCollections.userCollections,
            collectionId,
            {
                postsCount: (owned.collection.postsCount ?? 0) + 1,
            }
        );

        return NextResponse.json({ added: true });
    } catch (error) {
        console.error('Error adding collection item:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}
