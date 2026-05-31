// import { Account, Client, Databases, Query, ID, Models } from 'appwrite'
import {
  Account,
  Client,
  Databases,
  Query,
  ID,
  Models,
} from "node-appwrite";
import { NextRequest } from 'next/server'
import { APPWRITE_FIELD } from './constants'
import { Author, Comment, Post, UserCollection } from '@/types'
import {
  AuthorDocument,
  CommentDocument,
  PostDocument,
  UserCollectionDocument,
} from '@/types/appwrite'

type AppwriteDocument<T> = T & Models.Document

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || ''
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || ''
const databaseId = process.env.APPWRITE_DATABASE_ID || ''
const apiKey = process.env.APPWRITE_API_KEY || ''

export const appwriteDatabaseId = databaseId

export const appwriteCollections = {
  authors: process.env.APPWRITE_AUTHORS_COLLECTION_ID || '',
  posts: process.env.APPWRITE_POSTS_COLLECTION_ID || '',
  comments: process.env.APPWRITE_COMMENTS_COLLECTION_ID || '',
  likes: process.env.APPWRITE_LIKES_COLLECTION_ID || '',
  saves: process.env.APPWRITE_SAVES_COLLECTION_ID || '',
  userCollections: process.env.APPWRITE_USER_COLLECTIONS_COLLECTION_ID || '',
  collectionItems: process.env.APPWRITE_COLLECTION_ITEMS_COLLECTION_ID || '',
}

export function createAppwriteServerClient() {
  if (!endpoint || !project || !databaseId || !apiKey) {
    throw new Error(
      'Missing Appwrite environment variables: endpoint, project, database id, or api key.',
    )
  }

  const client = new Client()
  client.setEndpoint(endpoint)
  client.setProject(project)
  const serverClient = client as unknown as Client & {
    setKey(value: string): Client
  }
  console.log(client)
  console.log(typeof (client as any).setKey)
  serverClient.setKey(apiKey)
  return client
}

export function createAppwriteServerDatabases() {
  return new Databases(createAppwriteServerClient())
}

export const appwriteQueries = Query

export function createAppwriteSessionClient(request: NextRequest) {
  if (!endpoint || !project) {
    throw new Error(
      'Missing Appwrite environment variables: endpoint or project.',
    )
  }

  const client = new Client()
  client.setEndpoint(endpoint)
  client.setProject(project)

  const cookieHeader = request.headers.get('cookie')
  const fallbackCookies = request.headers.get('x-fallback-cookies')

  if (cookieHeader) {
    client.headers.Cookie = cookieHeader
  }

  if (fallbackCookies) {
    client.headers['X-Fallback-Cookies'] = fallbackCookies
  }

  return client
}

export async function getCurrentUserFromRequest(
  request: NextRequest,
): Promise<Models.User<Models.Preferences> | null> {
  try {
    const account = new Account(createAppwriteSessionClient(request))
    return await account.get()
  } catch (error) {
    return null
  }
}

export async function getAuthorByEmail(
  email: string,
): Promise<AuthorDocument | null> {
  const databases = createAppwriteServerDatabases()
  const result = await databases.listDocuments<AppwriteDocument<AuthorDocument>>(
    appwriteDatabaseId,
    appwriteCollections.authors,
    [
      appwriteQueries.equal(APPWRITE_FIELD.email, email),
      appwriteQueries.limit(1),
    ],
  )

  return result.documents[0] ?? null
}

export async function getAuthorBySlug(
  slug: string,
): Promise<AuthorDocument | null> {
  const databases = createAppwriteServerDatabases()
  const result = await databases.listDocuments<AppwriteDocument<AuthorDocument>>(
    appwriteDatabaseId,
    appwriteCollections.authors,
    [
      appwriteQueries.equal(APPWRITE_FIELD.slug, slug),
      appwriteQueries.limit(1),
    ],
  )

  return result.documents[0] ?? null
}

export async function createAuthor(author: {
  name: string
  email: string
  image?: string
  slug?: string
  bio?: string
}): Promise<AuthorDocument> {
  const databases = createAppwriteServerDatabases()
  return await databases.createDocument<AppwriteDocument<AuthorDocument>>(
    appwriteDatabaseId,
    appwriteCollections.authors,
    ID.unique(),
    {
      name: author.name,
      email: author.email,
      image: author.image || '',
      slug: author.slug || author.email.split('@')[0],
      bio: author.bio || '',
    },
  )
}

export async function getOrCreateAuthorForUser(
  user: Models.User<Models.Preferences>,
): Promise<AuthorDocument> {
  const email = user.email
  const name = user.name || email.split('@')[0]
  const image =
    typeof (user.prefs as { picture?: unknown } | undefined)?.picture === 'string'
      ? (user.prefs as { picture?: string }).picture
      : ''

  let author = await getAuthorByEmail(email)
  if (!author) {
    author = await createAuthor({
      name,
      email,
      image,
      slug: email.split('@')[0],
    })
  }

  return author
}

export function transformPost(doc: PostDocument): Post {
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
  }
}

export function transformComment(doc: CommentDocument): Comment {
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
    replies: [] as Comment[],
  }
}

export function transformAuthor(doc: AuthorDocument): Author {
  return {
    _id: doc.$id,
    name: doc.name,
    slug: { current: doc.slug },
    image: doc.image || '',
    bio: doc.bio || '',
    email: doc.email || '',
  }
}

export function transformUserCollection(
  doc: UserCollectionDocument,
): UserCollection {
  return {
    _id: doc.$id,
    name: doc.name,
    description: doc.description || '',
    authorId: doc.authorId,
    postsCount: doc.postsCount ?? 0,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  }
}

export async function getPostsByIds(postIds: string[]): Promise<Post[]> {
  const databases = createAppwriteServerDatabases()
  const uniqueIds = Array.from(new Set(postIds.filter(Boolean)))
  const posts = await Promise.all(
    uniqueIds.map(async (postId) => {
      try {
        const post = await databases.getDocument<AppwriteDocument<PostDocument>>(
          appwriteDatabaseId,
          appwriteCollections.posts,
          postId,
        )
        return transformPost(post)
      } catch (error) {
        return null
      }
    }),
  )

  return posts.filter((post): post is Post => post !== null)
}
