import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ID } from 'appwrite';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, getAuthorByEmail, createAuthor, transformComment } from '@/lib/appwrite-server';

export async function GET(request: NextRequest) {
    const postId = request.nextUrl.searchParams.get('postId');
    if (!postId) {
        return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    const databases = createAppwriteServerDatabases();
    const result = await databases.listDocuments(appwriteDatabaseId, appwriteCollections.comments, [
        appwriteQueries.equal('postId', postId),
        appwriteQueries.equal('parentCommentId', ''),
        appwriteQueries.orderDesc('$createdAt'),
    ]);

    const comments = await Promise.all(
        result.documents.map(async (commentDoc: any) => {
            const repliesResult = await databases.listDocuments(appwriteDatabaseId, appwriteCollections.comments, [
                appwriteQueries.equal('postId', postId),
                appwriteQueries.equal('parentCommentId', commentDoc.$id),
                appwriteQueries.orderAsc('$createdAt'),
            ]);

            const comment = transformComment(commentDoc);
            comment.replies = repliesResult.documents.map(transformComment);
            return comment;
        })
    );

    return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { postId, body, parentComment } = await request.json();
        const databases = createAppwriteServerDatabases();

        let author = await getAuthorByEmail(session.user.email);
        if (!author) {
            author = await createAuthor({
                name: session.user.name || session.user.email.split('@')[0],
                email: session.user.email,
                image: session.user.image || '',
                slug: session.user.email.split('@')[0],
            });
        }

        const commentDoc = await databases.createDocument(
            appwriteDatabaseId,
            appwriteCollections.comments,
            ID.unique(),
            {
                postId,
                authorId: author.$id,
                authorName: author.name,
                authorImage: author.image || '',
                authorSlug: author.slug,
                body,
                parentCommentId: parentComment || '',
                approved: true,
                likesCount: 0,
            }
        );

        const postDoc = await databases.getDocument(appwriteDatabaseId, appwriteCollections.posts, postId);
        await databases.updateDocument(appwriteDatabaseId, appwriteCollections.posts, postId, {
            commentsCount: (postDoc.commentsCount ?? 0) + 1,
        });

        return NextResponse.json({ comment: transformComment(commentDoc) });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
