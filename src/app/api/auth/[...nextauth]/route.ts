import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { sanityClient } from '@/lib/sanity';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                // Check if user exists in Sanity
                const existingUser = await sanityClient.fetch(
                    `*[_type == "author" && email == $email][0]`,
                    { email: user.email }
                );

                if (!existingUser) {
                    // Create new author in Sanity
                    await sanityClient.create({
                        _type: 'author',
                        name: user.name,
                        email: user.email,
                        image: {
                            _type: 'image',
                            asset: {
                                _type: 'reference',
                                _ref: await uploadImageToSanity(user.image || ''),
                            },
                        },
                        slug: {
                            _type: 'slug',
                            current: user.email?.split('@')[0] || '',
                        },
                    });
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                const sanityUser = await sanityClient.fetch(
                    `*[_type == "author" && email == $email][0]{
            _id,
            name,
            email,
            image,
            slug,
            bio
          }`,
                    { email: session.user.email }
                );
                session.user = { ...session.user, ...sanityUser };
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
};

async function uploadImageToSanity(imageUrl: string): Promise<string> {
    // For now, return a placeholder
    // In production, you'd fetch the image and upload it to Sanity
    return 'image-placeholder';
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
