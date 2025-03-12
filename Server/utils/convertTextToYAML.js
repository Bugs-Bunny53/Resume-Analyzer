export const convertTextToYAML = (text) => {
  const extract = (regex, index = 1) => text.match(regex)?.[index] || null;

  return {
    personal_information: {
      name: extract(/Name:\s*(.*)/i),
      surname: extract(/Surname:\s*(.*)/i),
      date_of_birth: extract(/Date of Birth:\s*(.*)/i),
      country: extract(/Country:\s*(.*)/i),
      city: extract(/City:\s*(.*)/i),
      address: extract(/Address:\s*(.*)/i),
      zip_code: extract(/Zip Code:\s*(.*)/i),
      phone_prefix: extract(/Phone Prefix:\s*(.*)/i),
      phone: extract(/Phone:\s*(.*)/i),
      email: extract(/Email:\s*(.*)/i),
      github: extract(/GitHub:\s*(.*)/i),
      linkedin: extract(/LinkedIn:\s*(.*)/i),
    },
    education_details: extractEducation(text),
    experience_details: extractExperience(text),
    projects: extractProjects(text),
    achievements: extractList(text, "Achievements"),
    certifications: extractList(text, "Certifications"),
    languages: extractLanguages(text),
    interests: extractList(text, "Interests"),
    availability: {
      notice_period: extract(/Notice Period:\s*(.*)/i),
    },
    salary_expectations: {
      salary_range_usd: extract(/Salary Expectations:\s*(.*)/i),
    },
    self_identification: {
      gender: extract(/Gender:\s*(.*)/i),
      pronouns: extract(/Pronouns:\s*(.*)/i),
      veteran: extract(/Veteran:\s*(.*)/i),
      disability: extract(/Disability:\s*(.*)/i),
      ethnicity: extract(/Ethnicity:\s*(.*)/i),
    },
    legal_authorization: extractLegalAuthorization(text),
    work_preferences: extractWorkPreferences(text),
  };
};

// Extracts education details
const extractEducation = (text) => {
  const educationMatches = [...text.matchAll(/Education:\s*(.*?)\n/gis)];
  return educationMatches.map((match) => ({
    education_level: extract(/Education Level:\s*(.*)/i),
    institution: extract(/Institution:\s*(.*)/i),
    field_of_study: extract(/Field of Study:\s*(.*)/i),
    final_evaluation_grade: extract(/Final Grade:\s*(.*)/i),
    start_date: extract(/Start Date:\s*(.*)/i),
    year_of_completion: extract(/Year of Completion:\s*(.*)/i),
  }));
};

// Extracts work experience details
const extractExperience = (text) => {
  const experienceMatches = [...text.matchAll(/Experience:\s*(.*?)\n/gis)];
  return experienceMatches.map((match) => ({
    position: extract(/Position:\s*(.*)/i),
    company: extract(/Company:\s*(.*)/i),
    employment_period: extract(/Employment Period:\s*(.*)/i),
    location: extract(/Location:\s*(.*)/i),
    industry: extract(/Industry:\s*(.*)/i),
    key_responsibilities: extractResponsibilities(text),
    skills_acquired: extractList(text, "Skills Acquired"),
  }));
};

// Extracts responsibilities
const extractResponsibilities = (text) => {
  const matches = [...text.matchAll(/Responsibility:\s*(.*)/gi)];
  return matches.map((match, index) => ({
    [`responsibility_${index + 1}`]: match[1],
  }));
};

// Extracts list-based fields like achievements and interests
const extractList = (text, sectionName) => {
  const regex = new RegExp(`${sectionName}:\\s*(.*)`, "gi");
  return [...text.matchAll(regex)].map((match) => match[1].split(",").map((item) => item.trim()));
};

// Extracts projects
const extractProjects = (text) => {
  const projectMatches = [...text.matchAll(/Project:\s*(.*?)\n/gis)];
  return projectMatches.map((match) => ({
    name: extract(/Project Name:\s*(.*)/i),
    description: extract(/Project Description:\s*(.*)/i),
    link: extract(/Project Link:\s*(.*)/i),
  }));
};

// Extracts languages
const extractLanguages = (text) => {
  const matches = [...text.matchAll(/Language:\s*(.*), Proficiency:\s*(.*)/gi)];
  return matches.map((match) => ({
    language: match[1],
    proficiency: match[2],
  }));
};

// Extracts legal authorization details
const extractLegalAuthorization = (text) => {
  const keys = [
    "eu_work_authorization",
    "us_work_authorization",
    "requires_us_visa",
    "requires_us_sponsorship",
    "requires_eu_visa",
    "legally_allowed_to_work_in_eu",
    "legally_allowed_to_work_in_us",
    "requires_eu_sponsorship",
    "canada_work_authorization",
    "requires_canada_visa",
    "legally_allowed_to_work_in_canada",
    "requires_canada_sponsorship",
    "uk_work_authorization",
    "requires_uk_visa",
    "legally_allowed_to_work_in_uk",
    "requires_uk_sponsorship",
  ];

  let result = {};
  keys.forEach((key) => {
    result[key] = extract(new RegExp(`${key.replace(/_/g, " ")}:\\s*(.*)`, "i"));
  });

  return result;
};

// Extracts work preferences
const extractWorkPreferences = (text) => {
  return {
    remote_work: extract(/Remote Work:\s*(.*)/i),
    in_person_work: extract(/In Person Work:\s*(.*)/i),
    open_to_relocation: extract(/Open to Relocation:\s*(.*)/i),
    willing_to_complete_assessments: extract(/Willing to Complete Assessments:\s*(.*)/i),
    willing_to_undergo_drug_tests: extract(/Willing to Undergo Drug Tests:\s*(.*)/i),
    willing_to_undergo_background_checks: extract(/Willing to Undergo Background Checks:\s*(.*)/i),
  };
};
