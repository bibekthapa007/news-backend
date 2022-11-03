import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import supertest from 'supertest';
import mongoose from 'mongoose';

import { createJwtToken } from 'src/middlewares/jwt';
import app from '../app';
import connect from 'src/utils/mongodb';
import PostModel from 'src/models/PostModel';
import UserModel from 'src/models/UserModel';
import CategoryModel from 'src/models/CategoryModel';

describe('Product api', () => {
  beforeAll(async () => {
    await connect();
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  const postPayload = {
    title: 'test title',
    description: 'test description',
  };

  describe('GET /post/id', () => {
    describe('given a invalid product id', () => {
      test('should respond with a 404 status code', async () => {
        const response = await supertest(app).get('/api/category/63612c47f24ce3490e41addd');
        expect(response.status).toBe(404);
      });
    });

    describe('given a valid product id', () => {
      test('should respond with a 200 status code and return product', async () => {
        const post = await PostModel.findOne();
        if (!post) return expect(true).toBe(false);

        const response = await supertest(app).get(`/api/post/${post._id}`);
        expect(response.status).toBe(200);
        expect(response.body.post).toMatchObject({ _id: expect.any(String) });
      });
    });
  });

  describe('POST /post', () => {
    describe('given the user is not registered', () => {
      test('should respond with a 401 status code', async () => {
        const response = await supertest(app).post('/api/post');
        expect(response.status).toBe(401);
      });
    });

    describe('given the user is registered and data is provided', () => {
      test('should respond with a 201 status code and create post', async () => {
        const user = await UserModel.findOne();
        const category = await CategoryModel.findOne();
        if (!user) return expect(true).toBe(false);
        if (!category) return expect(true).toBe(false);

        const jwttoken = createJwtToken({ id: user.id, email: user.email, role: user.role });
        const response = await supertest(app)
          .post('/api/post')
          .set('Authorization', `Bearer ${jwttoken}`)
          .send({ ...postPayload, author: user._id, category: category._id });

        expect(response.status).toBe(201);
        expect(response.body.post).toMatchObject({
          _id: expect.any(String),
          title: postPayload.title,
          description: postPayload.description,
        });
      });
    });

    describe('when a title or description is missing', () => {
      test('should respond with a 422 status code', async () => {
        const bodyData = [{ title: 'Post 1' }, { description: 'Description 1' }, {}];

        const user = await UserModel.findOne();
        const category = await CategoryModel.findOne();
        if (!user) return expect(true).toBe(false);
        if (!category) return expect(true).toBe(false);

        const jwttoken = createJwtToken({ id: user.id, email: user.email, role: user.role });

        for (const data of bodyData) {
          const response = await supertest(app)
            .post('/api/post')
            .set('Authorization', `Bearer ${jwttoken}`)
            .send({ ...data, author: user._id, category: category._id });
          expect(response.status).toBe(422);
        }
      });
    });
  });
});
