import express from 'express';
import oNetController from '../controllers/oNetController';

const router = express.Router();

// * Router for getting up to date information from oNet
router.get('//job-titles', oNetController.getJobListings);

// * Router to get job specifics from oNet
router.get('/job-titles/:title', oNetController.getJobDetails)

// * Router to handle login requests
router.post('/login', oNetController.login, (req, res) => {
  return res.status(200).send('login button');
});

// * Router to handle registration requests
router.post('./register,', oNetController.register, (req, res) => {
  return res.status(200).send('register submit button');
});

export default router;
