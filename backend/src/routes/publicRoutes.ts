import express from 'express';
import { getPublicDashboard } from '../controllers/publicController';

const router = express.Router();

router.get('/dashboard', getPublicDashboard);

export default router;