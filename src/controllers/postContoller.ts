import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import streamifier from 'streamifier';

import NotFoundError from '../errors/notFound';
import ValidationError from '../errors/validation';
import Post from '../models/PostModel';
import cloudinary from '../utils/cloudinary';

async function getPostList(req: Request, res: Response, next: NextFunction) {
  try {
    let posts = await Post.find();
    return res.status(200).send({ message: 'posts fetched successfully.', posts });
  } catch (error) {
    next(error);
  }
}

async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const post_id = req.params.post_id;
    let { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate({ id: post_id });

    if (error) next(new ValidationError(error.details[0].message));

    let post = await Post.findOne({ _id: value.id });
    if (!post) next(new NotFoundError('post not found'));
    return res.status(200).send({ message: 'post fetched successfully.', post });
  } catch (error) {
    next(error);
  }
}

function uploadFromBuffer(req: Request) {
  return new Promise((resolve, reject) => {
    const file = req.file as Express.Multer.File;
    if (!file.buffer) {
      reject('Buffer not found');
    }
    let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'post',
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
  });
}

async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    let { error, value } = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      author: Joi.string().required(),
      category: Joi.string().required(),
    }).validate(req.body);

    if (error) throw new ValidationError(error.details[0].message);

    let result: null | any = null;
    if (req.file) {
      try {
        result = await uploadFromBuffer(req);
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
    const post_id = req.params.post_id;
    let { error, value } = Joi.object({
      _id: Joi.string().required(),
      title: Joi.string(),
      description: Joi.string(),
      image_link: Joi.string().allow(null),
      tags: Joi.array<string>(),
    }).validate({ ...req.body, _id: post_id });

    if (error) next(new ValidationError(error.details[0].message));

    let oldPost = await Post.findOne({ where: { id: value.id } });
    if (!oldPost) next(new NotFoundError('post not found'));

    let post = await Post.findOneAndUpdate({ _id: value._id }, value, { new: true });
    return res.status(200).send({ message: 'post updated successfully.', post });
  } catch (error) {
    next(error);
  }
}

async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post_id = req.params.post_id;
    let { error, value } = Joi.object({
      id: Joi.number().required(),
    }).validate({ id: post_id });

    if (error) next(new ValidationError(error.details[0].message));

    let oldPost = await Post.findOne({ id: value.id });
    if (!oldPost) next(new NotFoundError('post not found'));

    let post = await Post.deleteOne({ id: value.id });
    return res.status(200).send({ message: 'post deleted successfully.', post });
  } catch (error) {
    next(error);
  }
}

export default {
  getPostList,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
