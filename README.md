# Verse - Medium Clone

A fully-featured Medium clone built with Next.js 15, Sanity CMS, and NextAuth.

## Features

- 📝 **Rich Content Creation** - Write and publish articles with rich text formatting
- 👤 **User Authentication** - Sign in with Google via NextAuth
- 💬 **Nested Comments** - Engage with threaded comment discussions
- ❤️ **Likes & Saves** - Like posts and comments, bookmark articles for later
- 👥 **Social Features** - Follow authors, view profiles
- 🌓 **Dark Mode** - Beautiful light and dark themes
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **CMS**: Sanity
- **Auth**: NextAuth.js
- **Language**: TypeScript
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Sanity account and project
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd Verse
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Fill in your Sanity project ID, NextAuth secret, and Google OAuth credentials.

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Sanity Studio Setup

1. Install Sanity CLI globally
```bash
npm install -g @sanity/cli
```

2. Initialize Sanity studio (if not already done)
```bash
sanity init
```

3. Import the schemas from `sanity/schemas/` into your Sanity studio

4. Deploy your studio
```bash
sanity deploy
```

## Project Structure

```
Verse/
├── src/                   # Source code
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes
│   │   │   ├── auth/   # NextAuth configuration
│   │   │   ├── comment/ # Comment API
│   │   │   ├── like/   # Like API
│   │   │   └── save/   # Save API
│   │   ├── post/[slug]/ # Post detail page
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Home page
│   │   └── globals.css # Global styles
│   ├── components/      # React components
│   │   ├── Navbar.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostInteractions.tsx
│   │   ├── CommentSection.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Providers.tsx
│   ├── lib/            # Utility functions
│   │   └── sanity.ts  # Sanity client config
│   └── types/          # TypeScript types
│       └── index.ts
├── sanity/             # Sanity schemas
│   └── schemas/
│       ├── author.ts
│       ├── post.ts
│       ├── comment.ts
│       ├── like.ts
│       ├── save.ts
│       └── category.ts
├── public/             # Static assets
├── .env.example        # Environment variables template
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js 15.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Inspired by [Medium](https://medium.com)
- Built with [Next.js](https://nextjs.org)
- Powered by [Sanity](https://www.sanity.io)
