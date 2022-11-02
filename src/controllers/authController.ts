import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import HttpStatus from 'http-status-codes';
import { OAuth2Client } from 'google-auth-library';

import NotFoundError from '../errors/notFound';
import TokenError from '../errors/token';
import ValidationError from '../errors/validation';
import { createJwtToken } from '../middlewares/jwt';
import User from '../models/UserModel';

const router = Router();

function signup(req: Request, res: Response, next: NextFunction) {
  let { error, value } = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(req.body);

  if (error) throw new ValidationError(error.details[0].message);

  const name = value.email.substring(0, value.email.indexOf('@'));
  User.findOne({ email: value.email })
    .then(user => {
      if (user) {
        return res.status(HttpStatus.CONFLICT).send({
          message: 'email address is already registered! Please login to continue.',
          error: true,
        });
      }
      User.create({ ...value, name, verified: true })
        .then(user => {
          const token = createJwtToken({
            id: user.id,
            email: user.email,
            role: user.role,
          });

          return res.status(200).send({ message: 'Login Successfully', user, token });
        })
        .catch(next);
    })
    .catch(next);
}

function signin(req: Request, res: Response, next: NextFunction) {
  let { error, value } = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(req.body);

  if (error) throw new ValidationError(error.details[0].message);

  User.findOne({ email: value.email })
    .then(async user => {
      if (!user) {
        return next(new NotFoundError('You have entered an invalid email or password'));
      } else if (!(await user.isValidPassword(value.password))) {
        return next(new TokenError('You have entered an invalid email or password'));
      }

      const token = createJwtToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return res.status(200).send({ message: 'Login Successfully', user, token });
    })
    .catch(next);
}

function check(req: Request, res: Response, next: NextFunction) {
  if (!req.jwtPayload) throw new TokenError('User unauthorized.');

  User.findOne({ id: req.jwtPayload.id })
    .then(user => {
      if (!user) return res.status(404).send({ message: 'User not found.' });
      return res.status(200).send({ user, message: 'User is authorized.' });
    })
    .catch(next);
}

export default { signup, signin, check };
