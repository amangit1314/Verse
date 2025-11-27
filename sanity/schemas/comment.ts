export default {
    name: 'comment',
    title: 'Comment',
    type: 'document',
    fields: [
        {
            name: 'post',
            title: 'Post',
            type: 'reference',
            to: [{ type: 'post' }],
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{ type: 'author' }],
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'body',
            title: 'Body',
            type: 'text',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'parentComment',
            title: 'Parent Comment',
            type: 'reference',
            to: [{ type: 'comment' }],
            description: 'Reference to parent comment for nested replies',
        },
        {
            name: 'approved',
            title: 'Approved',
            type: 'boolean',
            description: 'Comments won\'t show on the site without approval',
            initialValue: true,
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
            title: 'body',
            author: 'author.name',
            post: 'post.title',
        },
        prepare(selection: any) {
            const { author, post } = selection
            return { ...selection, subtitle: `${author} on ${post}` }
        },
    },
}
