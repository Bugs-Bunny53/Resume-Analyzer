import pdfParse from "pdf-parse";
import docx4js from "docx4js";
import fs from "fs/promises";

export const extractTextFromFile = async (filePath, mimeType) => {
  const fileBuffer = await fs.readFile(filePath);

  if (mimeType === "application/pdf") {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const doc = await docx4js.load(fileBuffer);
    return doc.toString();
  }

  throw new Error("Your file format sucks");
};