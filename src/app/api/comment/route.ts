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
        const { postId, body, parentComment } = await request.json();

        // Get user from Sanity
        const user = await sanityClient.fetch(
            `*[_type == "author" && email == $email][0]`,
            { email: session.user.email }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create comment
        const comment = await sanityClient.create({
            _type: 'comment',
            post: { _type: 'reference', _ref: postId },
            author: { _type: 'reference', _ref: user._id },
            body,
            ...(parentComment && {
                parentComment: { _type: 'reference', _ref: parentComment },
            }),
            approved: true, // Auto-approve for now
        });

        return NextResponse.json({ comment });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
