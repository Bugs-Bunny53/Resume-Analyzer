import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log();

const openAiController = {};

openAiController.analyzeContent = async (req, res, next) => {
  const yamlResume = res.locals.yamlResume;
  const jobQueryData = res.locals.jobQuery;

  // ------------<< PARSED RESUME YAML SHIT >>------------------
  const personalInformation = {
    personalInformation: yamlResume.personal_information,
    availability: yamlResume.availability,
    salaryExpectations: yamlResume.salary_expectations,
    workPreferences: yamlResume.work_preferences,
  };

  const educationDetails = yamlResume.education_details;

  const experienceDetails = yamlResume.experience_details.map((exp) => ({
    position: exp.position,
    company: exp.company,
    responsibilities: exp.key_responsibilities,
    skills: exp.skills_acquired,
  }));

  const showcaseDetails = {
    projects: yamlResume.projects,
    achievements: yamlResume.achievements,
    certifications: yamlResume.certifications,
    languages: yamlResume.languages,
    interests: yamlResume.interests,
  };

  const selfIdentification = yamlResume.self_identification;
  const legalAuthorization = yamlResume.legal_authorization;

  // ------------<< JOB QUERY RESPONSE SHIT >>------------------
  const jobInformation = {
    code: jobQueryData.code,
    title: jobQueryData.main.title,
    description: jobQueryData.main.description,
    sampleTitles: jobQueryData.main.sample_of_reported_titles,
    brightOutlook: jobQueryData.main.bright_outlook,
    jobZone: jobQueryData.job_zone,
    apprenticeship: jobQueryData.apprenticeship,
  };

  const workDetails = {
    tasks: jobQueryData.tasks.task.map((task) => task.title),
    activities: jobQueryData.detailed_work_activities.activity.map(
      (activity) => activity.title
    ),
  };

  const skillsAndTools = {
    technologySkills: jobQueryData.technology_skills.category.flatMap(
      (category) => category.example.map((example) => example.title)
    ),
    toolsUsed: jobQueryData.tools_used.category.flatMap((tool) => tool.example),
  };

  const professionalAssociations =
    jobQueryData.professional_associations.source.map((association) => ({
      name: association.name,
      url: association.url,
    }));

  const interests = jobQueryData.interests.element.map((interest) => ({
    name: interest.name,
    description: interest.description,
  }));

  // ------------<< PROMPT CONSTRUCTION >>------------------
  const comparisonSections = {
    experienceDetails: {
      yaml: experienceDetails,
      job: workDetails,
      prompt:
        "Compare the experience listed in this resume to the job's tasks and responsibilities. Highlight missing skills or qualifications.",
    },
    skillsAndTools: {
      yaml: experienceDetails.flatMap((exp) => exp.skills),
      job: {
        technologySkills: skillsAndTools.technologySkills,
        sampleTitles: jobInformation.sampleTitles,
      },
      prompt:
        "Compare the candidate's skills to the required technologies for the job. What key skills are missing?",
    },
    professionalAssociations: {
      yaml: showcaseDetails.certifications,
      job: professionalAssociations,
      prompt:
        "Compare the candidate's certifications to the relevant professional associations in this job field. Highlight if additional certifications are recommended.",
    },
    interests: {
      yaml: showcaseDetails.interests,
      job: interests,
      prompt:
        "Compare the candidate’s interests to the job's interests. How well does the candidate's passion align?",
    },
    jobZoneComparison: {
      yaml: {
        education: educationDetails,
        experience: experienceDetails.map((exp) => ({
          position: exp.position,
          company: exp.company,
        })),
      },
      job: jobInformation.jobZone,
      prompt:
        "Compare the candidate's education and experience to the job zone requirements. Identify any gaps in training or qualifications.",
    },
    relatedOccupations: {
      yaml: experienceDetails.map((exp) => exp.position),
      job: jobQueryData.main.related_occupations || [],
      prompt:
        "If the candidate's experience does not fully align with the job requirements, suggest alternative related occupations they might be qualified for.",
    },
    inDemandTechnologies: {
      yaml: experienceDetails.flatMap((exp) => exp.skills),
      job: skillsAndTools.technologySkills.filter(
        (skill) => skill.hot_technology === true
      ),
      prompt:
        "Compare the candidate's skills to the list of hot technologies in demand for this role. Identify key technologies they should learn to remain competitive.",
    },
    remainingInfo: {
      yaml: {
        personalInformation,
        selfIdentification,
        legalAuthorization,
      },
      job: jobInformation,
      prompt:
        'Review the remaining information for the candidate, compare their self identification, legal authorization, and personal information to the job description. Highlight any discrepancies that might exist.',
    },
  };

  // ------------<< MAKE API CALLS IN PARALLEL >>------------------
  const apiCalls = Object.entries(comparisonSections).map(
    async ([section, data]) => {
      if (
        !data.yaml ||
        !data.job ||
        data.yaml.length === 0 ||
        data.job.length === 0
      ) {
        console.warn(`Skipping ${section}: Missing relevant data`);
        return {
          section,
          feedback: { score: 0, body: 'Skipped due to missing data.' },
        };
      }

      const prompt = `
      You are an AI resume evaluator. Your task is to compare the resume information to the job posting and provide **constructive feedback**.
      \n**Category: ${section.replace(/([A-Z])/g, ' $1').trim()}**
      \n**Resume Data:** ${JSON.stringify(data.yaml, null, 2)}
      \n**Job Data:** ${JSON.stringify(data.job, null, 2)}
      \n${data.prompt}
      \nReturn your response **strictly in the following JSON format**:
      {
        "score": 0-100,
        "body": "Detailed feedback here."
      }
    `;

      console.log(`🔵 Sending request to OpenAI for section: ${section}`);

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI assistant that compares resumes to job postings and provides structured feedback in JSON format.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        });

        const rawResponse = response.choices?.[0]?.message?.content;
        console.log(`🟢 OpenAI Response for ${section}:`, rawResponse);

        let structuredFeedback;
        try {
          structuredFeedback = JSON.parse(rawResponse);
        } catch (jsonError) {
          console.error(
            `❌ Error parsing JSON response for ${section}:`,
            jsonError
          );
          structuredFeedback = {
            score: 0,
            body: 'Invalid JSON response from AI.',
          };
        }

        return { section, feedback: structuredFeedback };
      } catch (apiError) {
        console.error(`❌ OpenAI API error for section ${section}:`, apiError);
        return {
          section,
          feedback: { score: 0, body: 'OpenAI request failed.' },
        };
      }
    }
  );

  // Wait for all API responses
  const results = await Promise.all(apiCalls);
  res.json({
    feedback: Object.fromEntries(
      results.map(({ section, feedback }) => [section, feedback])
    ),
  });
};

/*
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
*/
export default openAiController.analyzeContent;
