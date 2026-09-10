import { Router } from 'express';
import upload from '../middlewares/upload.middleware.js';
import { uploadUserDocument } from '../controllers/users.controller.js';

const router = Router();

router.post('/:uid/documents', upload.single('document'), uploadUserDocument);

export default router;