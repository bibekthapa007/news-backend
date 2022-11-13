import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import HttpStatus from 'http-status-codes';

import NotFoundError from '../errors/notFound';
import ValidationError from '../errors/validation';
import Post from '../models/PostModel';
import { uploadFromBuffer } from '../utils/cloudinary';
import Logger from 'src/utils/Logger';
import UserModel from 'src/models/UserModel';
import CategoryModel from 'src/models/CategoryModel';

async function getPostList(req: Request, res: Response, next: NextFunction) {
  try {
    let perPage = parseInt(req.query.perPage as string) || 10;
    let page = parseInt(req.query.page as string) || 1;
    let skip = (page - 1) * perPage;
    let filter = {} as any;
    let category = req.query.category;
    if (category) filter.categories = { _id: category };

    let posts = await Post.find(filter).limit(perPage).skip(skip).sort({ createdAt: -1 });

    return res.status(200).send({ message: 'posts fetched successfully.', posts });
  } catch (error) {
    next(error);
  }
}

async function getPostListByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    let perPage = parseInt(req.query.perPage as string) || 10;
    let page = parseInt(req.query.page as string) || 1;
    let skip = (page - 1) * perPage;
    let categoryId = req.params.categoryId;

    let category = await CategoryModel.find({ _id: categoryId });

    let posts = await Post.find({ categories: { _id: categoryId } })
      .limit(perPage)
      .skip(skip)
      .sort({ createdAt: -1 });

    return res.status(200).send({ message: 'posts fetched successfully.', posts, category });
  } catch (error) {
    next(error);
  }
}

async function getRelaventPostList(req: Request, res: Response, next: NextFunction) {
  try {
    let perPage = parseInt(req.query.perPage as string) || 10;
    let page = parseInt(req.query.page as string) || 1;
    let skip = (page - 1) * perPage;
    let filter = {};

    if (req.jwtPayload) {
      let user = await UserModel.findById(req.jwtPayload.id);

      let releventCategories = user?.releventCategories;
      if (!releventCategories || releventCategories.length === 0) {
        return next(new Error('user has not selected any relevent categories.'));
      }

      if (releventCategories) {
        Logger.info(releventCategories);
        filter = { categories: { $in: [...releventCategories] } };
      }
    }

    let posts = await Post.find(filter).limit(perPage).skip(skip).sort({ createdAt: -1 });

    return res.status(200).send({ message: 'posts fetched successfully.', posts });
  } catch (error) {
    next(error);
  }
}

async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = req.params.postId;
    let { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate({ id: postId });

    if (error) return next(new ValidationError(error.details[0].message));

    let post = await Post.findOne({ _id: value.id });
    if (!post) next(new NotFoundError('post not found'));
    return res.status(200).send({ message: 'post fetched successfully.', post });
  } catch (error) {
    next(error);
  }
}

async function getPostBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;
    let { error, value } = Joi.object({
      slug: Joi.string().required(),
    }).validate({ slug });

    if (error) return next(new ValidationError(error.details[0].message));

    let post = await Post.findOne({ slug: slug });

    let filter = {};

    if (post?.categories) filter = { categories: { $in: [...post?.categories] } };

    let relevantPosts = await Post.find(filter).limit(10).sort({ createdAt: -1 });

    if (!post) next(new NotFoundError('post not found'));
    return res.status(200).send({ message: 'post fetched successfully.', post });
  } catch (error) {
    next(error);
  }
}

async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    let { error, value } = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      author: Joi.string().required(),
      categories: Joi.array().items(Joi.string().required()),
    }).validate(req.body);

    if (error) return next(new ValidationError(error.details[0].message));

    let result: null | any = null;
    if (req.file) {
      try {
        result = await uploadFromBuffer(req, 'post');
      } catch (error) {
        next(error);
      }
    }

    if (result && (result.secure_url as string)) {
      value.image_link = result.secure_url;
    }

    let post = await Post.create(value);
    return res.status(HttpStatus.CREATED).send({ message: 'post created successfully.', post });
  } catch (error) {
    next(error);
  }
}

async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = req.params.postId;
    let { error, value } = Joi.object({
      _id: Joi.string().required(),
      title: Joi.string(),
      description: Joi.string(),
      image_link: Joi.string().allow(null),
      tags: Joi.array<string>(),
    }).validate({ ...req.body, _id: postId });

    if (error) return next(new ValidationError(error.details[0].message));

    let post = await Post.findOneAndUpdate({ _id: value._id }, value, { new: true });
    if (!post) next(new NotFoundError('post not found'));

    return res.status(200).send({ message: 'post updated successfully.', post });
  } catch (error) {
    next(error);
  }
}

async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = req.params.postId;
    let { error, value } = Joi.object({
      id: Joi.number().required(),
    }).validate({ id: postId });

    if (error) return next(new ValidationError(error.details[0].message));

    let post = await Post.findOneAndDelete({ id: value.id });
    if (!post) return next(new NotFoundError('post not found'));

    return res.status(200).send({ message: 'post deleted successfully.', post });
  } catch (error) {
    next(error);
  }
}

export default {
  getPostList,
  getPostById,
  getPostBySlug,
  getPostListByCategory,
  getRelaventPostList,
  createPost,
  updatePost,
  deletePost,
};
