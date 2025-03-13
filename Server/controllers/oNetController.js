import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const oNetController = {};

// O*NET API Configuration
const ONET_API_BASE_URL = "https://api-v2.onetcenter.org/";
const ONET_API_KEY = process.env.ONET_API_KEY;  // Ensure this is set in your .env file

// Function to fetch job titles from O*NET
oNetController.getJobListings = async (req, res, next) => {
  console.log('⚒️ Fetching Job Listings from O*NET API');

  try {
    const response = await axios.get(`${ONET_API_BASE_URL}online/search`, {
      params: { keyword: '' },
      headers: {
        'X-API-Key': ONET_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.data || !response.data.occupation) {
      throw new Error('No job listings found.');
    }

    res.status(200).json(response.data.occupation);
  } catch (error) {
    console.error('❌ Error fetching job listings from O*NET:', error.message);
    return next({
      log: 'Error fetching job listings from O*NET API',
      status: 500,
      message: { err: error.message }
    });
  }
};

// Function to fetch job details from O*NET
oNetController.getJobDetails = async (req, res, next) => {
  console.log('🕵️ Fetching Job Details from O*NET API');
  const { title } = req.params;

  try {
    const response = await axios.get(`${ONET_API_BASE_URL}find/${title}`, {
      headers: {
        'X-API-Key': ONET_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.data) {
      throw new Error('No details found for this job title.');
    }

    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Error fetching job details from O*NET:', error.message);
    return next({
      log: 'Error fetching job details from O*NET API',
      status: 500,
      message: { err: error.message }
    });
  }
};

export default oNetController;
