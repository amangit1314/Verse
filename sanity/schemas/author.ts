export default {
    name: 'author',
    title: 'Author',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'bio',
            title: 'Bio',
            type: 'array',
            of: [
                {
                    title: 'Block',
                    type: 'block',
                    styles: [{ title: 'Normal', value: 'normal' }],
                    lists: [],
                },
            ],
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
        },
        {
            name: 'followers',
            title: 'Followers',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'author' } }],
        },
        {
            name: 'following',
            title: 'Following',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'author' } }],
        },
    ],
    preview: {
        select: {
            title: 'name',
            media: 'image',
        },
    },
}
