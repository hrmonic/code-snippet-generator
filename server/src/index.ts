import express from 'express';
import cors from 'cors';
import { generateRouter } from './routes/generate.js';
import { snippetsRouter } from './routes/snippets.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (simple)
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/generate', generateRouter);
app.use('/api/snippets', snippetsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 API docs: http://localhost:${PORT}/health`);
});

