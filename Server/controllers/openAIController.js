import OpenAI from 'openai';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const expectedYamlStructure = `
    personal_information:
    name: String
    surname: String
    date_of_birth: String
    country: String
    city: String
    address: String
    zip_code: String
    phone_prefix: String
    phone: String
    email: String
    github: String
    linkedin: String
    education_details:
    - education_level: String
        institution: String
        field_of_study: String
        final_evaluation_grade: String
        start_date: String
        year_of_completion: String
    experience_details:
    - position: String
        company: String
        employment_period: String
        location: String
        industry: String
        key_responsibilities: [String]
        skills_acquired: [String]
    projects:
    - name: String
        description: String
        link: String
    achievements:
    - name: String
        description: String
    certifications:
    - name: String
        description: String
    languages:
    - language: String
        proficiency: String
    interests: [String]
    availability:
    notice_period: String
    salary_expectations:
    salary_range_usd: String
    self_identification:
    gender: String
    pronouns: String
    veteran: String
    disability: String
    ethnicity: String
    legal_authorization:
    eu_work_authorization: String
    us_work_authorization: String
    requires_us_visa: String
    requires_us_sponsorship: String
    requires_eu_visa: String
    legally_allowed_to_work_in_eu: String
    legally_allowed_to_work_in_us: String
    requires_eu_sponsorship: String
    canada_work_authorization: String
    requires_canada_visa: String
    legally_allowed_to_work_in_canada: String
    requires_canada_sponsorship: String
    uk_work_authorization: String
    requires_uk_visa: String
    legally_allowed_to_work_in_uk: String
    requires_uk_sponsorship: String
    work_preferences:
    remote_work: String
    in_person_work: String
    open_to_relocation: String
    willing_to_complete_assessments: String
    willing_to_undergo_drug_tests: String
    willing_to_undergo_background_checks: String
    `;

export const openAIAnalysisController = (req, res, next) => {
  // Use the resume object provided in the request body if no YAML version is in res.locals.
  let yamlResume;
  if (res.locals.yamlResume) {
    yamlResume = res.locals.yamlResume;
  } else if (req.body.resume) {
    try {
      yamlResume = yaml.dump(req.body.resume);
    } catch (err) {
      console.error('Error converting resume to YAML:', err);
      return res
        .status(500)
        .json({ error: 'Error converting resume to YAML.' });
    }
  } else {
    return res.status(400).json({ error: 'No resume provided.' });
  }

  // Use provided job details from req.body or set a dummy object.
  let jobDetails;
  if (res.locals.jobDetails) {
    jobDetails = res.locals.jobDetails;
  } else if (req.body.jobDetails) {
    jobDetails = req.body.jobDetails;
  } else {
    // Dummy job details for testing
    jobDetails = {
      occupation: 'Software Engineer',
      description: 'Designs, develops, and maintains software systems.',
      requirements: ['JavaScript', 'React', 'Node.js'],
    };
  }

  // Build a context message that includes the expected YAML structure.
  const assistantContext = `The expected YAML structure for resumes is as follows:${expectedYamlStructure}`;

  const prompt = `
    Using the provided YAML resume (which follows the above structure) and the job details below, please analyze the resume and output a structured analysis as valid JSON. All keys aside from overallAssessment will contain an numerical % "grade" that demonstrates the quality of each "category" of the resume analysis.
    The JSON object should have the following keys:
    - overallAssessment: A brief summary of the candidate's overall suitability.
    - grade: a numerical value which demonstrates how likely an applicant is to pass the check
    - completeness: An object that comments on any missing information or well-detailed sections.
    - experienceRelevance: An object that analyzes how the candidate's experience matches the job requirements, including any gaps.
    - skillMatch: An object detailing the candidate's technical and soft skills along with any gaps.
    - redFlags: An array listing potential issues (e.g., frequent job changes, gaps in employment).
    - formattingAndClarity: An object assessing the resume's presentation and clarity.
    - recommendations: An array of specific suggestions for improvements.

    Below is an example output:

    {
    "overallAssessment": "The resume demonstrates a strong technical background but could be improved in clarity and organization.",
    "completeness": {
        "grade": 90
        "missingInformation": ["LinkedIn URL", "Certifications"],
        "adequateDetails": ["Detailed education history", "Clear employment dates"]
    },
    "experienceRelevance": {
        "grade": 93
        "relevantExperience": ["Software development", "Agile project management"],
        "experienceGaps": ["Limited leadership roles", "Minimal cloud experience"]
    },
    "skillMatch": {
        "grade": 96   
        "technicalSkills": ["JavaScript", "React", "Node.js"],
        "softSkills": ["Communication", "Teamwork"],
        "skillGaps": ["Data analysis", "DevOps expertise"]
    },
    "redFlags": {
        "grade": 90  
        details: ["Frequent job changes", "Gaps longer than 6 months"]
    },
    "formattingAndClarity": {
        "grade": 90  
        "strengths": ["Clear section headers", "Consistent formatting"],
        "areasForImprovement": ["Improve layout", "Standardize date formats"]
    },
    "recommendations": [
        "Include a professional summary.",
        "Add measurable achievements for each role.",
        "Consider reordering sections to highlight relevant skills."
    ]
    }

    YAML Resume:
    ${yamlResume}

    Job Details:
    ${JSON.stringify(jobDetails, null, 2)}

    If there is a grade for overallAssessment, remove it.
    `;

  openai.chat.completions
    .create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: assistantContext },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    })
    .then((response) => {
      // Use response.data if available, otherwise use response itself.
      const result = response.data || response;
      console.log('Full API response:', result);
      const output =
        result.choices &&
        result.choices[0].message &&
        result.choices[0].message.content;
      console.log('Output:', output);
      let analysis;
      try {
        analysis = JSON.parse(output);
      } catch (parseError) {
        console.error(
          'Error parsing GPT-4 response as JSON:',
          parseError,
          'Raw output:',
          output
        );
        return res
          .status(500)
          .json({ error: 'Error parsing resume analysis.' });
      }
      res.locals.analysis = analysis;
      next();
    })
    .catch((error) => {
      console.error('Error in openAIAnalysisController:', error);
      res.status(500).json({ error: 'Error processing resume analysis.' });
    });
};

export default openAIAnalysisController;
