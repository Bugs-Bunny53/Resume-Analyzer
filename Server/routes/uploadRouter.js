import express from "express";
import uploadController from "../controllers/uploadController.js";
import multer from "multer";

const router = express.Router(); 
const upload = multer({ dest: "uploads/" });

// * Router to handle uploads
//  removing multer so we can test upload.single("resume"),
router.post("/", uploadController.processUpload);

export default router;
