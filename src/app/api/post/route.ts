import { NextRequest, NextResponse } from 'next/server';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, transformPost } from '@/lib/appwrite-server';
import { API_MESSAGES, APPWRITE_FIELD, HTTP_STATUS } from '@/lib/constants';
import { PostDocument } from '@/types/appwrite';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: API_MESSAGES.missingSlug }, { status: HTTP_STATUS.badRequest });
  }

  const databases = createAppwriteServerDatabases();
  const result = await databases.listDocuments<PostDocument>(appwriteDatabaseId, appwriteCollections.posts, [
    appwriteQueries.equal(APPWRITE_FIELD.slug, slug),
    appwriteQueries.limit(1),
  ]);

  if (!result.documents.length) {
    return NextResponse.json({ error: API_MESSAGES.postNotFound }, { status: HTTP_STATUS.notFound });
  }

  const post = transformPost(result.documents[0]);
  return NextResponse.json(post);
}
