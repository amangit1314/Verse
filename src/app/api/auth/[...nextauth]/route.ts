import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createAuthor, getAuthorByEmail } from '@/lib/appwrite-server';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google' && user.email) {
                let author = await getAuthorByEmail(user.email);
                if (!author) {
                    author = await createAuthor({
                        name: user.name || user.email.split('@')[0],
                        email: user.email,
                        image: user.image || '',
                        slug: user.email.split('@')[0],
                    });
                }
            }
            return true;
        },
        async session({ session }) {
            if (session.user?.email) {
                const author = await getAuthorByEmail(session.user.email);
                if (author) {
                    session.user = {
                        ...(session.user as any),
                        _id: author.$id,
                        name: author.name,
                        image: author.image,
                        slug: { current: author.slug },
                        bio: author.bio,
                    } as any;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
