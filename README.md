# Verse

A Medium-inspired publishing app built with Next.js, Tailwind CSS, TanStack Query, Zustand, and Appwrite.

## Features

- Appwrite Google OAuth authentication
- Appwrite Database-backed posts, authors, comments, likes, and saves
- Medium-like reading feed and article pages
- Nested comments and optimistic like/save interactions
- Light and dark themes across the app

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Configure Appwrite values in `.env.local`.

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Appwrite Collections

Create one database and these collections:

- `authors`
- `posts`
- `comments`
- `likes`
- `saves`

Use the collection IDs in `.env.local`.

## Environment

See `.env.example` for the required Appwrite variables.
