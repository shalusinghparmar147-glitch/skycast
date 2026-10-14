import { Router } from 'express';
import { getForecast, searchCities } from '../services/weatherService.js';
import { HttpError } from '../middleware/errors.js';

const router = Router();

function readQuery(req) {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 2 || q.length > 100) {
    throw new HttpError(400, 'Please enter a location (2 to 100 characters).');
  }
  return q;
}

router.get('/weather', async (req, res) => {
  const data = await getForecast(readQuery(req));
  res.json(data);
});

router.get('/search', async (req, res) => {
  const cities = await searchCities(readQuery(req));
  res.json(cities);
});

export default router;
