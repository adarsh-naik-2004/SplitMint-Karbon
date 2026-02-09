import { Router } from 'express';
import { createGroup, deleteGroup, listGroups, updateGroup } from '../controllers/groupController.js';

const router = Router();
router.get('/', listGroups);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
