import { useRef } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context';
import type { SetPosts } from '@/types';
import DeleteModal from './DeleteModal';
import EditModal from './EditModal';

type PostCardProps = {
  _id: string;
  content: string;
  image: string;
  title: string;
  author: string;
  setPosts: SetPosts;
};

const PostCard = ({ _id, content, image, title, author, setPosts }: PostCardProps) => {
  const { user } = useAuth();

  const editModalRef = useRef<HTMLDialogElement | null>(null);
  const deleteModalRef = useRef<HTMLDialogElement | null>(null);

  const showEditModal = () => editModalRef.current?.showModal();
  const showDeleteModal = () => deleteModalRef.current?.showModal();

  return (
    <div className='card bg-base-100 shadow-xl'>
      <figure className='bg-white h-48'>
        <img src={image} alt={title} className='object-cover h-full w-full' />
      </figure>
      <div className='card-body h-56'>
        <h2 className='card-title'>{title}</h2>
        <p className='truncate text-wrap'>{content}</p>
        <Link to={`/post/${_id}`} className='btn btn-primary mt-4'>
          Read More
        </Link>

        {user?._id === author && (
          <div className='card-actions justify-center gap-6'>
            <button onClick={showEditModal} className='btn btn-success'>
              Edit
            </button>
            <EditModal
              editModalRef={editModalRef}
              _id={_id}
              image={image}
              title={title}
              content={content}
              setPosts={setPosts}
            />

            <button onClick={showDeleteModal} className='btn btn-error'>
              Delete
            </button>
            <DeleteModal deleteModalRef={deleteModalRef} _id={_id} setPosts={setPosts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
