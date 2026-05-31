import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'appwrite';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, transformComment, getCurrentUserFromRequest, getOrCreateAuthorForUser } from '@/lib/appwrite-server';
import { API_MESSAGES, APPWRITE_FIELD, EMPTY_PARENT_COMMENT_ID, HTTP_STATUS } from '@/lib/constants';
import { CommentDocument, PostDocument } from '@/types/appwrite';

interface CreateCommentBody {
    postId?: string;
    body?: string;
    parentComment?: string;
}

export async function GET(request: NextRequest) {
    const postId = request.nextUrl.searchParams.get('postId');
    if (!postId) {
        return NextResponse.json({ error: API_MESSAGES.missingPostId }, { status: HTTP_STATUS.badRequest });
    }

    const databases = createAppwriteServerDatabases();
    const result = await databases.listDocuments<CommentDocument>(appwriteDatabaseId, appwriteCollections.comments, [
        appwriteQueries.equal(APPWRITE_FIELD.postId, postId),
        appwriteQueries.equal(APPWRITE_FIELD.parentCommentId, EMPTY_PARENT_COMMENT_ID),
        appwriteQueries.orderDesc('$createdAt'),
    ]);

    const comments = await Promise.all(
        result.documents.map(async (commentDoc) => {
            const repliesResult = await databases.listDocuments<CommentDocument>(appwriteDatabaseId, appwriteCollections.comments, [
                appwriteQueries.equal(APPWRITE_FIELD.postId, postId),
                appwriteQueries.equal(APPWRITE_FIELD.parentCommentId, commentDoc.$id),
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
    try {
        const user = await getCurrentUserFromRequest(request);
        
        if (!user || !user.email) {
            return NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized });
        }

        const { postId, body, parentComment } = (await request.json()) as CreateCommentBody;
        if (!postId) {
            return NextResponse.json({ error: API_MESSAGES.missingPostId }, { status: HTTP_STATUS.badRequest });
        }

        const databases = createAppwriteServerDatabases();

        const author = await getOrCreateAuthorForUser(user);

        const commentDoc = await databases.createDocument<CommentDocument>(
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
                parentCommentId: parentComment || EMPTY_PARENT_COMMENT_ID,
                approved: true,
                likesCount: 0,
            }
        );

        const postDoc = await databases.getDocument<PostDocument>(appwriteDatabaseId, appwriteCollections.posts, postId);
        await databases.updateDocument(appwriteDatabaseId, appwriteCollections.posts, postId, {
            commentsCount: (postDoc.commentsCount ?? 0) + 1,
        });

        return NextResponse.json({ comment: transformComment(commentDoc) });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}
