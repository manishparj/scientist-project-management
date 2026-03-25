// backend/src/routes/userRoutes.ts
import { Router } from 'express';
import { protect, superAdminOnly } from '../middleware/auth.js';
import { getScientists, createScientist, updateScientist, deleteScientist } from '../controllers/userController.js';

const router = Router();

router.use(protect);
router.use(superAdminOnly);

router.route('/scientists')
  .get(getScientists)
  .post(createScientist);

router.route('/scientists/:id')
  .put(updateScientist)
  .delete(deleteScientist);

export default router;