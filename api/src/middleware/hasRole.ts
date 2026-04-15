import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { Post } from '#models';

const hasRole = (...allowedRoles: string[]): RequestHandler => {
  return async (req, _res, next) => {
    if (!req.user) throw new Error('Unauthorized', { cause: { status: 401 } });

    const { id } = req.params;
    const { roles: userRoles, id: userId } = req.user;

    if (userRoles.includes('admin')) return next();

    if (allowedRoles.includes('self')) {
      if (!id || !isValidObjectId(id)) throw new Error('Invalid id', { cause: { status: 400 } });

      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found', { cause: { status: 404 } });

      req.post = post;

      if (post.author.toString() === userId) return next();
    }

    const allowedNormalRoles = allowedRoles.filter(role => role !== 'self');
    const hasAllowedRole = allowedNormalRoles.some(role => userRoles.includes(role));

    if (!hasAllowedRole) throw new Error('Forbidden', { cause: { status: 403 } });

    next();
  };
};

export default hasRole;
