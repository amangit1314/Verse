import { NextRequest, NextResponse } from 'next/server';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, transformPost } from '@/lib/appwrite-server';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const databases = createAppwriteServerDatabases();
  const result = await databases.listDocuments(appwriteDatabaseId, appwriteCollections.posts, [
    appwriteQueries.equal('slug', slug),
    appwriteQueries.limit(1),
  ]);

  if (!result.documents.length) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const post = transformPost(result.documents[0]);
  return NextResponse.json(post);
}
