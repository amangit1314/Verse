import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ID } from 'appwrite';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, getAuthorByEmail } from '@/lib/appwrite-server';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { postId } = await request.json();
        if (!postId) {
            return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
        }

        const databases = createAppwriteServerDatabases();
        const author = await getAuthorByEmail(session.user.email);
        if (!author) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const existingSave = await databases.listDocuments(appwriteDatabaseId, appwriteCollections.saves, [
            appwriteQueries.equal('authorId', author.$id),
            appwriteQueries.equal('postId', postId),
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
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
