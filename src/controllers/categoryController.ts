import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import NotFoundError from '../errors/notFound';
import ValidationError from '../errors/validation';
import Category from '../models/CategoryModel';
import { uploadFromBuffer } from '../utils/cloudinary';

async function getCategoryList(req: Request, res: Response, next: NextFunction) {
  try {
    let categories = await Category.find();
    return res.status(200).send({ message: 'categories fetched successfully.', categories });
  } catch (error) {
    next(error);
  }
}

async function getCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    const category_id = req.params.category_id;
    let { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate({ id: category_id });

    if (error) next(new ValidationError(error.details[0].message));

    let category = await Category.findOne({ _id: value.id });
    if (!category) next(new NotFoundError('category not found'));
    return res.status(200).send({ message: 'category fetched successfully.', category });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    let { error, value } = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    }).validate(req.body);

    if (error) return next(new ValidationError(error.details[0].message));

    let result: null | any = null;
    if (req.file) {
      try {
        result = await uploadFromBuffer(req, 'category');
      } catch (error) {
        next(error);
      }
    }

    if (result && (result.secure_url as string)) {
      value.image_link = result.secure_url;
    }

    let category = await Category.create(value);
    return res
      .status(HttpStatus.CREATED)
      .send({ message: 'category created successfully.', category });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category_id = req.params.category_id;
    let { error, value } = Joi.object({
      _id: Joi.string().required(),
      title: Joi.string(),
      description: Joi.string(),
      image_link: Joi.string().allow(null),
    }).validate({ ...req.body, _id: category_id });

    if (error) next(new ValidationError(error.details[0].message));

    let category = await Category.findOneAndUpdate({ _id: value._id }, value, { new: true });
    if (!category) return next(new NotFoundError('category not found'));

    return res.status(200).send({ message: 'category updated successfully.', category });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category_id = req.params.category_id;
    let { error, value } = Joi.object({
      _id: Joi.string().required(),
    }).validate({ _id: category_id });

    if (error) next(new ValidationError(error.details[0].message));

    let category = await Category.findOneAndDelete({ _id: value._id });
    if (!category) return next(new NotFoundError('category not found'));

    return res.status(200).send({ message: 'category deleted successfully.', category });
  } catch (error) {
    next(error);
  }
}

export default {
  getCategoryList,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
