import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
// Use multer for multipart form data (image upload)
const upload = multer({ dest: 'uploads/' });

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('profileImage'), updateProfile);

export default router;
