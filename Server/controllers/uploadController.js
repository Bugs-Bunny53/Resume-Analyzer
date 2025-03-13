import fs from 'fs/promises';
import yaml from 'js-yaml';
import { extractTextFromFile } from '../utils/extractTextFromFile';
import { convertTextToYAML } from '../utils/convertTextToYAML';

const uploadController = {};

uploadController.processUpload = async (req, res, next) => {
  console.log('👓 Processing File Upload!');
  if (!req.file)
    return next({
      log: 'uploadController did nto receive a valid file.',
      status: 500,
      message: { err: error },
    });

  const { path, mimetype } = req.file;

  try {
    // Extract text from PDF/DOCX
    const extractedText = await extractTextFromFile(path, mimetype);

    // Convert to YAML format
    const yamlData = convertTextToYAML(extractedText);
    const yamlString = yaml.dump(yamlData);

    // Save YAML file
    await fs.writeFile('resume.yaml', yamlString);

    res.json({ message: 'Resume processed successfully', yaml: yamlString });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await fs.unlink(path); // Delete uploaded file after processing
  }
};
