import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'appwrite';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, getCurrentUserFromRequest, getOrCreateAuthorForUser } from '@/lib/appwrite-server';
import { API_MESSAGES, APPWRITE_FIELD, HTTP_STATUS } from '@/lib/constants';
import { SaveDocument } from '@/types/appwrite';

interface ToggleSaveBody {
    postId?: string;
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);

        if (!user || !user.email) {
            return NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized });
        }

        const { postId } = (await request.json()) as ToggleSaveBody;
        if (!postId) {
            return NextResponse.json({ error: API_MESSAGES.missingPostId }, { status: HTTP_STATUS.badRequest });
        }

        const databases = createAppwriteServerDatabases();
        const author = await getOrCreateAuthorForUser(user);

        const existingSave = await databases.listDocuments<SaveDocument>(appwriteDatabaseId, appwriteCollections.saves, [
            appwriteQueries.equal(APPWRITE_FIELD.authorId, author.$id),
            appwriteQueries.equal(APPWRITE_FIELD.postId, postId),
            appwriteQueries.limit(1),
        ]);

        if (existingSave.documents.length > 0) {
            await databases.deleteDocument(appwriteDatabaseId, appwriteCollections.saves, existingSave.documents[0].$id);
            return NextResponse.json({ saved: false });
        }

        await databases.createDocument(
            appwriteDatabaseId,
            appwriteCollections.saves,
            ID.unique(),
            {
                authorId: author.$id,
                postId,
            }
        );

        return NextResponse.json({ saved: true });
    } catch (error) {
        console.error('Error toggling save:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}
