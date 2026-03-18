import express from 'express';
import { getProfile, updateProfile, searchUsers, getUserById } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
// Use multer for multipart form data (image upload)
const upload = multer({ dest: 'uploads/' });

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('profileImage'), updateProfile);
router.get('/search', verifyToken, searchUsers);
router.get('/:id', verifyToken, getUserById);

export default router;
