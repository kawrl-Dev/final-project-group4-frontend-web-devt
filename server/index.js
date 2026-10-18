// Entry point of the backend. Run with: npm run server
import 'dotenv/config'; // loads variables from .env into process.env
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const { MONGODB_URI, JWT_SECRET, PORT = 5000 } = process.env;

// Fail early with a clear message instead of a confusing crash later
if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Missing MONGODB_URI or JWT_SECRET. Check your .env file.');
  process.exit(1);
}

const app = express();

app.use(express.json()); // lets us read JSON bodies as req.body

app.use('/api/auth', authRoutes);

// Any unknown /api route gets a JSON 404 (not an HTML page)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must have 4 params). Catches bad JSON and unexpected errors.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

try {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}
