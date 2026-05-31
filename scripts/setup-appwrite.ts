// scripts/setup-appwrite.ts
import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function main() {
  const databaseId = process.env.APPWRITE_DATABASE_ID!;
  const postsId = process.env.APPWRITE_POSTS_COLLECTION_ID!;

  await databases.createStringAttribute(
    databaseId,
    postsId,
    "title",
    255,
    true
  );

  await databases.createStringAttribute(
    databaseId,
    postsId,
    "slug",
    255,
    true
  );

  await databases.createDatetimeAttribute(
    databaseId,
    postsId,
    "publishedAt",
    false
  );

  console.log("Done");
}

main();