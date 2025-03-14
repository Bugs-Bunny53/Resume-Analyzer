import express from 'express';
import multer from 'multer';
import uploadController from '../controllers/uploadController.js';
import openAIAnalysisController from '../controllers/openAIController.js';
import oNetController from '../controllers/oNetController.js';

const router = express.Router();
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

// * Router to handle uploads
router.post(
  '/',
  upload.single('resume'), // User uploads a file
  uploadController.processUpload, // We make a YAML out of it
  oNetController.getJobDetails, // We get relevant job details
  openAIAnalysisController // We ask AI about it <-- This is the return
);

export default router;
