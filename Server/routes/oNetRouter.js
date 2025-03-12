import express from 'express';
import oNetController from '../controllers/oNetController';

export const router = express.Router();

// * Router for getting up to date information from oNet
router.get('/', oNetController.getJobListings);

// * Router to get job specifics from oNet
router.get('/:title', oNetController.getJobDetails);

export default router;
