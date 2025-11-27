export default {
    name: 'save',
    title: 'Save',
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
            validation: (Rule: any) => Rule.required(),
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
        },
        prepare(selection: any) {
            const { author, post } = selection
            return {
                title: `${author} saved`,
                subtitle: post,
            }
        },
    },
}
