import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import supertest from 'supertest';
import mongoose from 'mongoose';

import { createJwtToken } from 'src/middlewares/jwt';
import app from '../app';
import connect from 'src/utils/mongodb';
import UserModel from 'src/models/UserModel';

describe('Category api', () => {
  beforeAll(async () => {
    await connect();
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe('GET /category/id', () => {
    describe('given a valid value', () => {
      test('should respond with a 200 status code and return categories', async () => {
        const response = await supertest(app).get('/api/category');
        expect(response.status).toBe(200);
        response.body.categories.map((category: any) => {
          expect(category).toMatchObject({ _id: expect.any(String) });
        });
      });
    });

    describe('given a invalid category id', () => {
      test('should respond with a 404 status code', async () => {
        const response = await supertest(app).get('/api/category/63612c47f24ce3490e41addd');
        expect(response.status).toBe(404);
      });
    });
  });

  describe('GET /category/id', () => {
    describe('given a invalid category object id', () => {
      test('should respond with a 500 status code', async () => {
        const response = await supertest(app).get('/api/category/123');
        expect(response.status).toBe(500);
      });
    });

    describe('given a invalid category id', () => {
      test('should respond with a 404 status code', async () => {
        const response = await supertest(app).get('/api/category/63612c47f24ce3490e41addd');
        expect(response.status).toBe(404);
      });
    });
  });

  describe('POST /category', () => {
    describe('given a name and description', () => {
      test('should respond with a 201 status code', async () => {
        const user = await UserModel.findOne();
        if (!user) return expect(true).toBe(false);

        const jwttoken = createJwtToken({ id: user.id, email: user.email, role: user.role });
        const response = await supertest(app)
          .post('/api/category')
          .set('Authorization', `Bearer ${jwttoken}`)
          .send({
            title: 'Test Post',
            description: 'description from test',
          });
        expect(response.status).toBe(201);
      });
    });

    describe('when a name is missing', () => {
      test('should respond with a 422 status code', async () => {
        const bodyData = [{ name: 'Bibek Thapa' }, {}];

        const user = await UserModel.findOne();
        if (!user) return expect(true).toBe(false);
        const jwttoken = createJwtToken({ id: user.id, email: user.email, role: user.role });

        for (const data of bodyData) {
          const response = await supertest(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${jwttoken}`)
            .send(data);
          expect(response.status).toBe(422);
        }
      });
    });
  });
});
