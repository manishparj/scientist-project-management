import express from 'express';
import {
  createScientist,
  getAllScientists,
  getScientistById,
  updateScientist,
  deleteScientist,
} from '../controllers/scientistController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .post(createScientist)
  .get(getAllScientists);

router.route('/:id')
  .get(getScientistById)
  .put(updateScientist)
  .delete(deleteScientist);

export default router;