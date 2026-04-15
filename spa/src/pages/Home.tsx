import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PostCard, PostsSkeleton } from '@/components';
import { getPosts } from '@/data';
import type { DbPost } from '@/types';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<DbPost[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (error: unknown) {
        const message = (error as { message: string }).message;
        toast.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PostsSkeleton />;
  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 '>
      {posts.map(post => (
        <PostCard
          key={post._id}
          _id={post._id}
          content={post.content}
          image={post.image}
          title={post.title}
          author={post.author}
          setPosts={setPosts}
        />
      ))}
    </div>
  );
};

export default Home;
