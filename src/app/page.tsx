import { sanityClient } from '@/lib/sanity';
import { Post } from '@/types';
import PostCard from '@/components/PostCard';

async function getPosts(): Promise<Post[]> {
    const query = `
    *[_type == "post"] | order(publishedAt desc, _createdAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      author->{
        _id,
        name,
        slug,
        image
      },
      mainImage,
      categories[]->{
        _id,
        title,
        slug
      },
      publishedAt,
      description,
      "likesCount": count(*[_type == "like" && post._ref == ^._id]),
      "commentsCount": count(*[_type == "comment" && post._ref == ^._id && approved == true])
    }
  `;

    return await sanityClient.fetch(query);
}

export default async function Home() {
    const posts = await getPosts();

    return (
        <main className="flex-1">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
                <div className="container-medium">
                    <h1 className="text-6xl font-serif font-bold mb-4">Stay curious.</h1>
                    <p className="text-xl mb-6">
                        Discover stories, thinking, and expertise from writers on any topic.
                    </p>
                    <button className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors">
                        Start reading
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="container-medium py-12">
                <div className="max-w-3xl">
                    {posts.length > 0 ? (
                        posts.map((post) => <PostCard key={post._id} post={post} />)
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                No posts yet. Be the first to write!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
