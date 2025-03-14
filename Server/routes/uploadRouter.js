// import express from "express";
// import uploadController from "../controllers/uploadController.js";
// import multer from "multer";
// import path from "path";

// const router = express.Router(); 

// const upload = multer({ dest: "uploads/" });
// // Use the `upload.single('file')` middleware before `processUpload`
// router.post('/', upload.single("resume"), uploadController.processUpload);

// export default router;



///////// TESTING CODE BELOW ///////

import multer from 'multer';
import path from 'path';
import express from "express";
import uploadController from "../controllers/uploadController.js";

// Multer storage configuration (Store files in "uploads/" directory)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');  // Specify where to store the uploaded files
    },
    filename: (req, file, cb) => {
      // Use the original filename or customize it if necessary
      cb(null, Date.now() + path.extname(file.originalname));  // Append timestamp to avoid name conflicts
    },
  });
  
//   const upload = multer({ storage: storage });


// // * Router to handle uploads
// //  removing multer so we can test upload.single("resume"),
// router.post("/", upload.single("resume"), uploadController.processUpload);



// // File filter to allow only PDFs, text, and Word documents
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, text, and Word documents are allowed.'));
  }
};

// Initialize Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});


const router = express.Router();
// router.post('/upload', upload.single())
router.post("/", upload.single("resume"), uploadController.processUpload);

export default router;
