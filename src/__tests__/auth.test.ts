import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import supertest from 'supertest';
import mongoose from 'mongoose';

import { createJwtToken } from 'src/middlewares/jwt';
import app from '../app';
import connect from 'src/utils/mongodb';
import UserModel from 'src/models/UserModel';

describe('auth api', () => {
  beforeAll(async () => {
    await connect();
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  describe('POST /auth/signin', () => {
    describe('given a email and password', () => {
      test('should respond with a 200 status code', async () => {
        const response = await supertest(app).post('/api/auth/signin').send({
          email: 'bibekthapa9@gmail.com',
          password: 'Hello@123',
        });
        expect(response.status).toBe(200);
      });
    });

    describe('when a email or password is missing', () => {
      test('should respond with a 422 status code', async () => {
        const bodyData = [{ username: 'username' }, { password: 'password' }, {}];

        for (const data of bodyData) {
          const response = await supertest(app).post('/api/auth/signin').send(data);
          expect(response.status).toBe(422);
        }
      });
    });
  });

  describe('POST /auth/signup', () => {
    describe('given a valid email and password', () => {
      test('should respond with a 200 status code and return token and user', async () => {
        const response = await supertest(app).post('/api/auth/signup').send({
          email: 'unique@gmail.com',
          password: 'Hello@123',
        });
        await UserModel.deleteOne({ email: 'unique@gmail.com' });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          token: expect.any(String),
          user: { _id: expect.any(String) },
        });
      });
    });

    describe('given a invalid email', () => {
      test('should respond with a 422 status code', async () => {
        const response = await supertest(app).post('/api/auth/signup').send({
          email: 'bibekthapa9gmail.com',
          password: 'Hello@123',
        });
        expect(response.status).toBe(422);
      });
    });

    describe('when password is invalid', () => {
      test('should respond with a 422 status code', async () => {
        const invalidPasswords = ['h', 'hj', 'hhhh'];

        for (const password of invalidPasswords) {
          const response = await supertest(app).post('/api/auth/signup').send({
            email: 'bibekthapa9@gmail.com',
            password,
          });
          expect(response.status).toBe(422);
        }
      });
    });

    describe('when a email or password is missing', () => {
      test('should respond with a 422 status code', async () => {
        const bodyData = [{ username: 'username' }, { password: 'password' }, {}];

        for (const data of bodyData) {
          const response = await supertest(app).post('/api/auth/signup').send(data);
          expect(response.status).toBe(422);
        }
      });
    });
  });

  describe('GET /auth/check', () => {
    describe('when no token is passed', () => {
      test('should respond with a 401 status code', async () => {
        const response = await supertest(app).get('/api/auth/check');
        expect(response.status).toBe(401);
      });
    });
    describe('when random token is passed', () => {
      test('should respond with a 401 status code', async () => {
        const response = await supertest(app).get('/api/auth/check?token=1234123');
        expect(response.status).toBe(401);
      });
    });

    describe('when valid token is passed', () => {
      test('should respond with a 200 status code and return user', async () => {
        const user = await UserModel.findOne();
        if (!user) return expect(true).toBe(false);

        const jwttoken = createJwtToken({ id: user.id, email: user.email, role: user.role });
        const response = await supertest(app)
          .get('/api/auth/check')
          .set('Authorization', `Bearer ${jwttoken}`)
          .send({
            title: 'Test Post',
            description: 'description from test',
          });
        expect(response.status).toBe(200);
      });
    });
  });
});
