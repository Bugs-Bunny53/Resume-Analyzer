import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAiController = {};

openAiController.analyzeContent = async (req, res, next) => {
  const yamlResume = JSON.parse(res.locals.yamlResume);
  const jobQueryData = res.locals.jobQuery;
  console.log('✅ Incoming YAML format: ', yamlResume);
  // console.log('✅ Incoming jobQueryData: ', jobQueryData);

  // ------------<< PARSED RESUME YAML SHIT >>------------------
  const personalInformation = {
    personalInformation: yamlResume.personal_information,
    availability: yamlResume.availability,
    salaryExpectations: yamlResume.salary_expectations,
    workPreferences: yamlResume.work_preferences,
  };

  const educationDetails = yamlResume.education_details;

  const experienceDetails = yamlResume.experience_details;
  console.log(experienceDetails);
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

  console.log('✅ Incoming jobQueryData: ', jobInformation);
  console.log('✅ Incoming jobQueryData: ', workDetails);
  console.log('✅ Incoming jobQueryData: ', skillsAndTools);
  console.log('✅ Incoming jobQueryData: ', professionalAssociations);
  console.log('✅ Incoming jobQueryData: ', interests);
  // ------------<< PROMPT CONSTRUCTION >>------------------
  const comparisonSections = {
    experienceDetails: {
      yaml: experienceDetails,
      job: workDetails,
      prompt:
        "Compare the experience listed in this resume to the job's tasks and responsibilities. Highlight missing skills or qualifications.",
    },
    skillsAndTools: {
      yaml: experienceDetails,
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
        experience: experienceDetails,
      },
      job: jobInformation.jobZone,
      prompt:
        "Compare the candidate's education and experience to the job zone requirements. Identify any gaps in training or qualifications.",
    },
    relatedOccupations: {
      yaml: experienceDetails,
      job: jobQueryData.main.related_occupations || [],
      prompt:
        "If the candidate's experience does not fully align with the job requirements, suggest alternative related occupations they might be qualified for.",
    },
    inDemandTechnologies: {
      yaml: experienceDetails,
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

export default openAiController.analyzeContent;
