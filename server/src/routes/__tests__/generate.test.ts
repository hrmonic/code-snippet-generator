import request from 'supertest';
import express from 'express';
import { generateRouter } from '../generate.js';

// Mock codeGenerator
jest.mock('../../lib/codeGenerator.js', () => ({
  codeGenerator: {
    generate: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/generate', generateRouter);

describe('POST /api/generate', () => {
  it('should return 400 for invalid request', async () => {
    const response = await request(app).post('/api/generate').send({
      language: 'invalid',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should return 500 if snippet not found', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({
        language: 'php',
        feature: 'unknown',
        options: {},
      });

    expect(response.status).toBe(500);
  });
});

