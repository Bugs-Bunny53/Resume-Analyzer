import axios  from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const oNetController = {};

oNetController.getJobListings = (req, res, next) => {
  console.log('⚒️ Getting Job Listings from oNet SQL DB');

  res.json({
    message: "This will return all job titles from the local oNet database.",
    data: [] // Replace with actual data later
});

};

oNetController.getJobDetails = (req, res) => {
  const { title } = req.params;

  // Placeholder response until database integration is complete
  res.json({
      message: `This will return detailed information for the job title: ${title}`,
      data: {} // Replace with actual data later
  });
};
