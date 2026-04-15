import { Router } from 'express';
import { createPost, deletePost, getAllPosts, getSinglePost, updatePost } from '#controllers';
import { authenticate, hasRole, validateBody } from '#middleware';

import { postSchema } from '#schemas';

const postRoutes = Router();

postRoutes.route('/').get(getAllPosts).post(authenticate, hasRole('user'), validateBody(postSchema), createPost);

postRoutes
  .route('/:id')
  .get(getSinglePost)
  .put(authenticate, hasRole('self'), validateBody(postSchema), updatePost)
  .delete(authenticate, hasRole('self'), deletePost);

export default postRoutes;
