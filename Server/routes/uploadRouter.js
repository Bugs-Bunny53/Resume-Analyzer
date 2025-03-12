import express from "express";
import uploadController from "../controllers/uploadController.js";
import multer from "multer";

const router = express.Router(); 
const upload = multer({ dest: "uploads/" });

// * Router to handle uploads
router.post("/", upload.single("resume"), uploadController.processUpload);

export default router;
