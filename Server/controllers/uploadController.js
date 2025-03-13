import fs from 'fs/promises';
import yaml from 'js-yaml';
import { extractTextFromFile } from '../utils/extractTextFromFile.js';
import convertTextToYAML from '../utils/convertTextToYAML.js';

const uploadController = {};

uploadController.processUpload = async (req, res, next) => {
  console.log('👓 Processing File Upload!');
  if (!req.file)
    return next({
      log: 'uploadController did nto receive a valid file.',
      status: 500,
      message: { err: 'No file to process.' },
    });

  const { path, mimetype } = req.file;

  extractTextFromFile(path, mimetype)
    .then((extractedText) => {
      // Convert extracted text to YAML format
      const yamlData = convertTextToYAML(extractedText);
      const yamlString = yaml.dump(yamlData);

      // Save YAML data to MongoDB
      return YAMLModel.create(yamlData).then((savedData) => ({
        yamlString,
        savedData,
      }));
    })
    // TODO: Not sure this is what should be sent back, since the AI response is actually what we need.
    // Send an all clear response back
    .then((savedData) => {
      res.json({
        message: "Resume processed and stored successfully",
        id: savedData._id,
        yaml: savedData,
      });
    })
    // Catch errors
    .catch((error) => {
      console.error("❌ Error in processUpload:", error);
      res.status(500).json({ error: error.message });
    })
    // Remove the file from uploads
    .finally(() => {
      fs.unlink(path).catch((err) => console.error("Error deleting file:", err));
    });
};

export default uploadController;