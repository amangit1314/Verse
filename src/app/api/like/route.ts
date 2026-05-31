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
        const { postId, commentId } = await request.json();
        if (!postId && !commentId) {
            return NextResponse.json({ error: 'Must provide postId or commentId' }, { status: 400 });
        }

        const databases = createAppwriteServerDatabases();
        const author = await getAuthorByEmail(session.user.email);
        if (!author) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const filters = [appwriteQueries.equal('authorId', author.$id)];
        if (postId) {
            filters.push(appwriteQueries.equal('postId', postId));
        }
        if (commentId) {
            filters.push(appwriteQueries.equal('commentId', commentId));
        }

        const likesResult = await databases.listDocuments(appwriteDatabaseId, appwriteCollections.likes, [
            ...filters,
            appwriteQueries.limit(1),
        ]);

        const targetCollection = postId ? appwriteCollections.posts : appwriteCollections.comments;
        const targetId = postId || commentId!;
        const targetDoc = await databases.getDocument(appwriteDatabaseId, targetCollection, targetId);

        if (likesResult.documents.length > 0) {
            await databases.deleteDocument(appwriteDatabaseId, appwriteCollections.likes, likesResult.documents[0].$id);
            await databases.updateDocument(appwriteDatabaseId, targetCollection, targetId, {
                likesCount: Math.max((targetDoc.likesCount ?? 1) - 1, 0),
            });
            return NextResponse.json({ liked: false });
        }

        await databases.createDocument(
            appwriteDatabaseId,
            appwriteCollections.likes,
            ID.unique(),
            {
                authorId: author.$id,
                postId: postId || '',
                commentId: commentId || '',
            }
        );

        await databases.updateDocument(appwriteDatabaseId, targetCollection, targetId, {
            likesCount: (targetDoc.likesCount ?? 0) + 1,
        });

        return NextResponse.json({ liked: true });
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
