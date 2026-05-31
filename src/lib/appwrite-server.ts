import { Client, Databases, Query, ID } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';

export const appwriteDatabaseId = databaseId;

export const appwriteCollections = {
  authors: process.env.APPWRITE_AUTHORS_COLLECTION_ID || '',
  posts: process.env.APPWRITE_POSTS_COLLECTION_ID || '',
  comments: process.env.APPWRITE_COMMENTS_COLLECTION_ID || '',
  likes: process.env.APPWRITE_LIKES_COLLECTION_ID || '',
  saves: process.env.APPWRITE_SAVES_COLLECTION_ID || '',
};

export function createAppwriteServerClient() {
  if (!endpoint || !project || !databaseId || !apiKey) {
    throw new Error('Missing Appwrite environment variables: endpoint, project, database id, or api key.');
  }

  const client = new Client();
  client.setEndpoint(endpoint);
  client.setProject(project);
  (client as any).setKey(apiKey);
  return client;
}

export function createAppwriteServerDatabases() {
  return new Databases(createAppwriteServerClient());
}

export const appwriteQueries = Query;

export async function getAuthorByEmail(email: string) {
  const databases = createAppwriteServerDatabases();
  const result = await databases.listDocuments(appwriteDatabaseId, appwriteCollections.authors, [
    appwriteQueries.equal('email', email),
    appwriteQueries.limit(1),
  ]);

  return result.documents[0] ?? null;
}

export async function createAuthor(author: {
  name: string;
  email: string;
  image?: string;
  slug?: string;
  bio?: string;
}) {
  const databases = createAppwriteServerDatabases();
  return await databases.createDocument(
    appwriteDatabaseId,
    appwriteCollections.authors,
    ID.unique(),
    {
      name: author.name,
      email: author.email,
      image: author.image || '',
      slug: author.slug || author.email.split('@')[0],
      bio: author.bio || '',
    }
  );
}

export function transformPost(doc: any) {
  return {
    _id: doc.$id,
    _createdAt: doc.$createdAt,
    _updatedAt: doc.$updatedAt,
    title: doc.title,
    slug: { current: doc.slug },
    author: {
      _id: doc.authorId,
      name: doc.authorName,
      slug: { current: doc.authorSlug },
      image: doc.authorImage,
      bio: doc.authorBio || '',
      email: doc.authorEmail || '',
    },
    mainImage: doc.mainImage || undefined,
    categories: doc.categories || [],
    publishedAt: doc.publishedAt || doc.$createdAt,
    description: doc.description || '',
    body: doc.body || '',
    likesCount: doc.likesCount ?? 0,
    commentsCount: doc.commentsCount ?? 0,
  };
}

export function transformComment(doc: any) {
  return {
    _id: doc.$id,
    post: { _ref: doc.postId },
    author: {
      _id: doc.authorId,
      name: doc.authorName,
      image: doc.authorImage,
      slug: { current: doc.authorSlug },
    },
    body: doc.body,
    parentCommentId: doc.parentCommentId || null,
    approved: doc.approved ?? true,
    createdAt: doc.$createdAt,
    likesCount: doc.likesCount ?? 0,
    replies: [] as any[],
  };
}
