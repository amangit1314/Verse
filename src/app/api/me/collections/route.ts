import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'appwrite';
import {
    appwriteCollections,
    appwriteDatabaseId,
    appwriteQueries,
    createAppwriteServerDatabases,
    getCurrentUserFromRequest,
    getOrCreateAuthorForUser,
    transformUserCollection,
} from '@/lib/appwrite-server';
import { API_MESSAGES, APPWRITE_FIELD, HTTP_STATUS } from '@/lib/constants';
import { UserCollectionDocument } from '@/types/appwrite';

interface CreateCollectionBody {
    name?: string;
    description?: string;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);
        if (!user || !user.email) {
            return NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized });
        }

        const databases = createAppwriteServerDatabases();
        const author = await getOrCreateAuthorForUser(user);
        const result = await databases.listDocuments<UserCollectionDocument>(appwriteDatabaseId, appwriteCollections.userCollections, [
            appwriteQueries.equal(APPWRITE_FIELD.authorId, author.$id),
            appwriteQueries.orderDesc('$createdAt'),
        ]);

        return NextResponse.json(result.documents.map(transformUserCollection));
    } catch (error) {
        console.error('Error loading collections:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);
        if (!user || !user.email) {
            return NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized });
        }

        const { name, description } = (await request.json()) as CreateCollectionBody;
        if (!String(name || '').trim()) {
            return NextResponse.json({ error: API_MESSAGES.collectionNameRequired }, { status: HTTP_STATUS.badRequest });
        }

        const databases = createAppwriteServerDatabases();
        const author = await getOrCreateAuthorForUser(user);
        const collection = await databases.createDocument<UserCollectionDocument>(
            appwriteDatabaseId,
            appwriteCollections.userCollections,
            ID.unique(),
            {
                name: String(name).trim(),
                description: String(description || '').trim(),
                authorId: author.$id,
                postsCount: 0,
            }
        );

        return NextResponse.json({ collection: transformUserCollection(collection) });
    } catch (error) {
        console.error('Error creating collection:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}
