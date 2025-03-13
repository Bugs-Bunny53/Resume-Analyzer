import express from "express";
import oNetController from "../controllers/oNetController.js";

export const router = express.Router();

// * Router for getting up to date information from oNet
router.get("/job-titles", oNetController.getJobListings);
router.get("/", oNetController.getJobListings);

// * Router to get job specifics from oNet
router.get("/job-titles/:code", oNetController.getJobDetails);
router.get("/:title", oNetController.getJobDetails);

export default router;
