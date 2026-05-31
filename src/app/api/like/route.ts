import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'appwrite';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, getCurrentUserFromRequest, getOrCreateAuthorForUser } from '@/lib/appwrite-server';
import { API_MESSAGES, APPWRITE_FIELD, EMPTY_PARENT_COMMENT_ID, HTTP_STATUS } from '@/lib/constants';
import { CommentDocument, LikeDocument, PostDocument } from '@/types/appwrite';

interface ToggleLikeBody {
    postId?: string;
    commentId?: string;
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);

        if (!user || !user.email) {
            return NextResponse.json({ error: API_MESSAGES.unauthorized }, { status: HTTP_STATUS.unauthorized });
        }

        const { postId, commentId } = (await request.json()) as ToggleLikeBody;
        if (!postId && !commentId) {
            return NextResponse.json({ error: API_MESSAGES.providePostOrCommentId }, { status: HTTP_STATUS.badRequest });
        }

        const databases = createAppwriteServerDatabases();
        const author = await getOrCreateAuthorForUser(user);

        const filters = [appwriteQueries.equal(APPWRITE_FIELD.authorId, author.$id)];
        if (postId) {
            filters.push(appwriteQueries.equal(APPWRITE_FIELD.postId, postId));
        }
        if (commentId) {
            filters.push(appwriteQueries.equal(APPWRITE_FIELD.commentId, commentId));
        }

        const likesResult = await databases.listDocuments<LikeDocument>(appwriteDatabaseId, appwriteCollections.likes, [
            ...filters,
            appwriteQueries.limit(1),
        ]);

        const targetCollection = postId ? appwriteCollections.posts : appwriteCollections.comments;
        const targetId = postId || commentId!;
        const targetDoc = postId
            ? await databases.getDocument<PostDocument>(appwriteDatabaseId, targetCollection, targetId)
            : await databases.getDocument<CommentDocument>(appwriteDatabaseId, targetCollection, targetId);

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
                postId: postId || EMPTY_PARENT_COMMENT_ID,
                commentId: commentId || EMPTY_PARENT_COMMENT_ID,
            }
        );

        await databases.updateDocument(appwriteDatabaseId, targetCollection, targetId, {
            likesCount: (targetDoc.likesCount ?? 0) + 1,
        });

        return NextResponse.json({ liked: true });
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: API_MESSAGES.internalServerError }, { status: HTTP_STATUS.internalServerError });
    }
}
