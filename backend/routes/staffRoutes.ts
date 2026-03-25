// backend/src/routes/staffRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getStaffByProject, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';

const router = Router();

router.use(protect);

router.route('/project/:projectId')
  .get(getStaffByProject)
  .post(createStaff);

router.route('/:id')
  .put(updateStaff)
  .delete(deleteStaff);

export default router;