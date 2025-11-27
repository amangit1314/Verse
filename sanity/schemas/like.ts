export default {
    name: 'like',
    title: 'Like',
    type: 'document',
    fields: [
        {
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{ type: 'author' }],
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'post',
            title: 'Post',
            type: 'reference',
            to: [{ type: 'post' }],
        },
        {
            name: 'comment',
            title: 'Comment',
            type: 'reference',
            to: [{ type: 'comment' }],
        },
        {
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        },
    ],
    preview: {
        select: {
            author: 'author.name',
            post: 'post.title',
            comment: 'comment.body',
        },
        prepare(selection: any) {
            const { author, post, comment } = selection
            const target = post || comment
            return {
                title: `${author} liked`,
                subtitle: target,
            }
        },
    },
}
