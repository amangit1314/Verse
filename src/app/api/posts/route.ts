import { NextResponse } from 'next/server';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, transformPost } from '@/lib/appwrite-server';

export async function GET() {
  const databases = createAppwriteServerDatabases();
  const result = await databases.listDocuments(appwriteDatabaseId, appwriteCollections.posts, [
    appwriteQueries.orderDesc('publishedAt'),
  ]);

  const posts = result.documents.map(transformPost);
  return NextResponse.json(posts);
}
