import fs from 'fs/promises';
import yaml from 'js-yaml';
import { extractTextFromFile } from '../utils/extractTextFromFile.js';
import generateYAMLWithAI from '../utils/convertTextToYAML.js';
import YAMLModel from '../models/YAMLModel.js';

const uploadController = {};

uploadController.processUpload = async (req, res, next) => {
  console.log('👓 Processing File Upload!');
  console.log("req.file is", req.file);
  
  if (!req.file)
    return next({
      log: 'uploadController did not receive a valid file.',
      status: 500,
      message: { err: 'No file to process.' },
    });

  const { buffer, mimetype } = req.file;

  try {
    const supportedFormats = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!supportedFormats.includes(mimetype)) {
      throw new Error('Unsupported file format. Please upload a PDF, text, or Word document.');
    }

    const extractedText = await extractTextFromFile(buffer, mimetype);
    const yamlData = await generateYAMLWithAI(extractedText);
    
    console.log("✅ AI-Generated YAML:", yamlData);
    
    const yamlString = yaml.dump(yamlData);
    
    
    res.locals.yamlResume = yamlData;
    // YAMLModel.create(yamlData);
    return next();

  } catch (error) {
    console.error("❌ Error in processUpload:", error);
    return res.status(500).json({ error: error.message });
  } 
};

export default uploadController;

