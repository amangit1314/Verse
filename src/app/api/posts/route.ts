import { NextResponse } from 'next/server';
import { createAppwriteServerDatabases, appwriteCollections, appwriteQueries, appwriteDatabaseId, transformPost } from '@/lib/appwrite-server';
import { APPWRITE_FIELD } from '@/lib/constants';
import { PostDocument } from '@/types/appwrite';

export async function GET() {
  const databases = createAppwriteServerDatabases();
  const result = await databases.listDocuments<PostDocument>(appwriteDatabaseId, appwriteCollections.posts, [
    appwriteQueries.orderDesc(APPWRITE_FIELD.publishedAt),
  ]);

  const posts = result.documents.map(transformPost);
  return NextResponse.json(posts);
}
