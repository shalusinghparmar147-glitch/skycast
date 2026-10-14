import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import weatherRoutes from './routes/weather.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());
app.set('trust proxy', 1);

app.use(cors({ origin: allowedOrigins }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in a few minutes.' },
  })
);

app.use('/api', weatherRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SkyCast API running on http://localhost:${PORT}`);
});
