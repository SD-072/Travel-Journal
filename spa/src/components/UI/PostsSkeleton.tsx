const skeletonIds = ['post-skeleton-1', 'post-skeleton-2', 'post-skeleton-3', 'post-skeleton-4'];

const PostsSkeleton = () => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 '>
      {skeletonIds.map(id => (
        <div key={id} className='card bg-base-100 shadow-xl'>
          <div className='h-48 skeleton'></div>
          <div className='card-body h-56'>
            <div className='card-title h-6 skeleton'></div>
            <p className='truncate text-wrap h-40 skeleton'></p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsSkeleton;
