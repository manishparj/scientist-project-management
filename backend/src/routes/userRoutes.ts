// backend/src/routes/userRoutes.ts
import { Router } from 'express';
import { getScientists, createScientist, updateScientist, deleteScientist } from '../controllers/userController';

const router = Router();

router.route('/scientists')
  .get(getScientists)
  .post(createScientist);

router.route('/scientists/:id')
  .put(updateScientist)
  .delete(deleteScientist);

export default router;