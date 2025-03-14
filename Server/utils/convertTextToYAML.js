// import openai from 'openai';
import dotenv from "dotenv";

dotenv.config();

// const openai = new OpenAIApi(
//   new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
//   })
// );

export const generateYAMLWithAI = async (resumeText) => {
  const prompt = `
You are an expert at structuring resumes into YAML format. Given the following resume text and resume PDF/Word Doc, extract structured data and return it in JSON format:

---
${resumeText}
---
${resumeText}
---



Ensure the structure matches this format:
{
  "personal_information": {
    "name": "",
    "surname": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": ""
  },
  "education_details": [
    {
      "institution": "",
      "field_of_study": "",
      "year_of_completion": ""
    }
  ],
  "experience_details": [
    {
      "position": "",
      "company": "",
      "employment_period": "",
      "location": "",
      "responsibilities": []
    }
  ],
  "skills": [],
  "certifications": [],
  "languages": [],
  "projects": [],
  "achievements": [],
  "work_preferences": {
    "remote_work": "",
    "in_person_work": ""
  }
}
Return **only** valid JSON.
  `;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a YAML extraction assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    // Parse and return the AI-generated JSON response
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error("❌ Error generating YAML with AI:", error);
    throw new Error("Failed to generate YAML from AI.");
  }
};

export default generateYAMLWithAI;
