import express from 'express';
import { addStaff, getStaffByProject, updateStaff, deleteStaff } from '../controllers/staffController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', addStaff);
router.get('/project/:projectId', getStaffByProject);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;