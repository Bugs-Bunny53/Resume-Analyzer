import axios from 'axios';
import dotenv from 'dotenv';
import JobDetail from '../models/JobModel.js';
dotenv.config();

const oNetController = {};

// O*NET API Configuration
const ONET_API_BASE_URL = 'https://api-v2.onetcenter.org/';
const ONET_API_KEY = process.env.ONET_API_KEY; // Ensure this is set in your .env file

// Function to fetch job titles from O*NET
oNetController.getJobListings = async (req, res, next) => {
  console.log('⚒️ Fetching Job Listings from O*NET API');

  try {
    const response = await axios.get(
      `${ONET_API_BASE_URL}online/occupations/`,
      {
        headers: {
          'X-API-Key': ONET_API_KEY,
          Accept: 'application/json',
        },
      }
    );

    if (!response.data || !response.data.occupation) {
      throw new Error('No job listings found.');
    }

    res.status(200).json(response.data.occupation);
  } catch (error) {
    console.error('❌ Error fetching job listings from O*NET:', error.message);
    return next({
      log: 'Error fetching job listings from O*NET API',
      status: 500,
      message: { err: error.message },
    });
  }
};

// Function to fetch job details from O*NET by job code
oNetController.getJobDetails = (req, res, next) => {
  console.log('🕵️ Fetching Job Details from O*NET API');

  // Extract job code from request params
  const { code } = req.params;
  // Store all fetched data here
  const jobDetails = { code };

  // Check if the job is cached
  JobDetail.findOne({ code }).then((existingJob) => {
    if (existingJob) {
      console.log('🥵 Cache Hit!');
      res.locals.jobQuery = existingJob;
      next();
    }

    // If we don't find it in the cache, we go ask for it.
    return axios
      .get(`${ONET_API_BASE_URL}online/occupations/${code}`, {
        headers: {
          'X-API-Key': ONET_API_KEY,
          Accept: 'application/json',
        },
      })
      .then((response) => {
        jobDetails.main = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/tasks`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.tasks = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/technology_skills`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.technology_skills = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/tools_used`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.tools_used = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/detailed_work_activities`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.detailed_work_activities = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/job_zone`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.job_zone = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/apprenticeship`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.apprenticeship = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/interests`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.interests = response.data;
        return axios.get(
          `${ONET_API_BASE_URL}online/occupations/${code}/details/professional_associations`,
          { headers: { 'X-API-Key': ONET_API_KEY, Accept: 'application/json' } }
        );
      })
      .then((response) => {
        jobDetails.professional_associations = response.data;
        res.locals.jobQuery = jobDetails;
        next();
        return JobDetail.create(jobDetails);
      })
      .catch((error) => {
        console.error('❌ Error fetching job details:', error.message);
        next({
          log: 'Error fetching job details from O*NET API',
          status: 500,
          message: { err: error.message },
        });
      });
  });
};

export default oNetController;
