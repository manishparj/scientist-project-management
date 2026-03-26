import express from 'express';
import {
  createScientist,
  getAllScientists,
  getScientistById,
  updateScientist,
  deleteScientist,
} from '../controllers/scientistController';

const router = express.Router();


router.route('/')
  .post(createScientist)
  .get(getAllScientists);

router.route('/:id')
  .get(getScientistById)
  .put(updateScientist)
  .delete(deleteScientist);

export default router;