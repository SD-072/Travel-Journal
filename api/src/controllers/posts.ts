import type { RequestHandler } from 'express';
import { isValidObjectId, type Types } from 'mongoose';
import type { z } from 'zod';
import { Post } from '#models';
import type { postSchema } from '#schemas';

type PostInputDTO = z.infer<typeof postSchema>;
type PostDTO = PostInputDTO & {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
  __v: number;
};

type IdParams = { id: string };

type NoParams = Record<string, never>;

export const getAllPosts: RequestHandler<NoParams, PostDTO[]> = async (_req, res) => {
  const posts = await Post.find().lean();
  res.json(posts);
};

export const createPost: RequestHandler<NoParams, PostDTO, PostInputDTO> = async (req, res) => {
  // const newPost = await Post.create(req.body satisfies PostInputDTO);
  // ! the server decides who the authenticated user is; the client should not be allowed to choose the author.
  if (!req.user) throw new Error('Unauthorized', { cause: { status: 401 } });
  const newPost = await Post.create({
    ...req.body,
    author: req.user.id
  });
  res.status(201).json(newPost);
};

export const getSinglePost: RequestHandler<IdParams, PostDTO> = async (req, res) => {
  const {
    params: { id }
  } = req;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: { status: 400 } });
  const post = await Post.findById(id).lean();
  if (!post) throw new Error(`Post with id of ${id} doesn't exist`, { cause: { status: 404 } });
  res.send(post);
};

export const updatePost: RequestHandler<IdParams, PostDTO> = async (req, res) => {
  const {
    params: { id },
    body: {
      title,
      image,
      content
      //  author
    },
    post
    // user
  } = req;
  // if (!user) throw new Error('Unauthorized, please sign in', { cause: { status: 401 } });
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: { status: 400 } });

  // const updatedPost = await Post.findById(id);

  if (!post) throw new Error(`Post with id of ${id} doesn't exist`, { cause: { status: 404 } });

  // if (user.id !== updatedPost.author.toString() && !user.roles.includes('admin'))
  //   throw new Error('Not authorized', { cause: { status: 403 } });

  post.title = title;
  post.image = image;
  post.content = content;
  // post.author = author;

  await post.save();

  res.json(post);
};

export const deletePost: RequestHandler<IdParams, { message: string }> = async (req, res) => {
  const {
    params: { id },
    post
    // user
  } = req;
  // if (!user) throw new Error('Unauthorized, please sign in', { cause: { status: 401 } });
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: { status: 400 } });

  // const deletedPost = await Post.findById(id);
  if (!post) throw new Error(`Post with id of ${id} doesn't exist`, { cause: { status: 404 } });

  // if (user.id !== deletedPost.author.toString() && !user.roles.includes('admin'))
  //   throw new Error('Not authorized', { cause: { status: 403 } });

  await Post.findByIdAndDelete(id);

  res.json({ message: `Post with id of ${id} was deleted` });
};
