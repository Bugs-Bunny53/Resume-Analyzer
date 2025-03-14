import openai from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai2 = new openai(
  {
    apiKey: process.env.OPENAI_KEY,
  }
);

export const generateYAMLWithAI = async (resumeText) => {

const prompt = `
You are an expert at structuring resumes into YAML format. Given the following resume text and resume PDF/Word Doc, extract structured data and return it in JSON format:

---
${resumeText}
---

Ensure the structure matches this format:
${ YAMLModel }

Do not include markdown. an example of markdown would be \`\`\`
If your final output includes markdown as shown above, remove it.
Return **only** valid JSON.
  `;

  try {
    const response = await openai2.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a YAML extraction assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    // Parse and return the AI-generated JSON response
      console.log(response);
      console.log(response.choices[0].message.content);
    const parsedResponse = JSON.parse(response.choices[0].message.content);
      console.log(parsedResponse);
      return parsedResponse;
  } catch (error) {
    console.error('❌ Error generating YAML with AI:', error);
    throw new Error('Failed to generate YAML from AI.');
  }
};

export default generateYAMLWithAI