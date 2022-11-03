import 'dotenv/config';
import { describe, expect, it } from '@jest/globals';
import supertest from 'supertest';
import mongoose from 'mongoose';

import { createJwtToken } from 'src/middlewares/jwt';
import app from '../app';
import connect from 'src/utils/mongodb';

describe('Category api', () => {
  beforeAll(async () => {
    await connect();
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
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
        const response = await supertest(app).post('/api/category').send({
          title: 'Test Post',
          description: 'description from test',
        });
        expect(response.status).toBe(201);
      });
    });

    describe('when a name is missing', () => {
      test('should respond with a 422 status code', async () => {
        const bodyData = [{ name: 'Bibek Thapa' }, {}];

        for (const data of bodyData) {
          const response = await supertest(app).post('/api/category').send(data);
          expect(response.status).toBe(422);
        }
      });
    });
  });
});
