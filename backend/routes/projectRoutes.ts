// backend/src/routes/projectRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .put(updateProject)
  .delete(deleteProject);

export default router;