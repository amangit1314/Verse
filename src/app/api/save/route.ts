import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sanityClient } from '@/lib/sanity';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { postId } = await request.json();

        // Get user from Sanity
        const user = await sanityClient.fetch(
            `*[_type == "author" && email == $email][0]`,
            { email: session.user.email }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if already saved
        const existingSave = await sanityClient.fetch(
            `*[_type == "save" && author._ref == $userId && post._ref == $postId][0]`,
            { userId: user._id, postId }
        );

        if (existingSave) {
            // Unsave
            await sanityClient.delete(existingSave._id);
            return NextResponse.json({ saved: false });
        } else {
            // Save
            await sanityClient.create({
                _type: 'save',
                author: { _type: 'reference', _ref: user._id },
                post: { _type: 'reference', _ref: postId },
            });
            return NextResponse.json({ saved: true });
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
