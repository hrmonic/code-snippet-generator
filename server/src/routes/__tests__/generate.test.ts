import request from 'supertest';
import express from 'express';

// Mock codeGenerator BEFORE importing the router
const mockGenerate = jest.fn();
jest.mock('../../lib/codeGenerator.js', () => ({
  codeGenerator: {
    generate: mockGenerate,
  },
}));

// Import after mocking
import { generateRouter } from '../generate.js';

const app = express();
app.use(express.json());
app.use('/api/generate', generateRouter);

describe('POST /api/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid request', async () => {
    const response = await request(app).post('/api/generate').send({
      language: 'invalid',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should return 400 for invalid feature', async () => {
    const response = await request(app)
      .post('/api/generate')
      .send({
        language: 'php',
        feature: 'unknown',
        options: {},
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should return 500 if snippet not found', async () => {
    mockGenerate.mockRejectedValue(new Error('Aucun snippet trouvé'));

    const response = await request(app)
      .post('/api/generate')
      .send({
        language: 'html5',
        feature: 'navbar',
        options: {},
      });

    expect(response.status).toBe(500);
  });

  it('should accept navbar feature and return 200 on success', async () => {
    mockGenerate.mockResolvedValue({
      code: '<nav>...</nav>',
      filename: 'navbar.html',
    });

    const response = await request(app)
      .post('/api/generate')
      .send({
        language: 'html5',
        feature: 'navbar',
        options: {},
      });

    expect(response.status).toBe(200);
    expect(response.body.code).toBeDefined();
  });

  it('should accept router feature and return 200 on success', async () => {
    mockGenerate.mockResolvedValue({
      code: 'import { BrowserRouter } from "react-router-dom";',
      filename: 'App.jsx',
    });

    const response = await request(app)
      .post('/api/generate')
      .send({
        language: 'javascript',
        feature: 'router',
        options: {},
      });

    expect(response.status).toBe(200);
    expect(response.body.code).toBeDefined();
  });

  it('should return generated code on success', async () => {
    mockGenerate.mockResolvedValue({
      code: 'console.log("test");',
      filename: 'test.js',
      tests: [],
    });

    const response = await request(app)
      .post('/api/generate')
      .send({
        language: 'javascript',
        feature: 'api',
        options: {},
      });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe('console.log("test");');
    expect(response.body.filename).toBe('test.js');
  });
});
