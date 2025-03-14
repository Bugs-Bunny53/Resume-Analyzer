import express, { json } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Connect to the Mongo DB on server start
import connectDB from './data/db.js';
connectDB();

/**
 * require routers
 */
import oNetRouter from './routes/oNetRouter.js';
import authRouter from './routes/authRouter.js';
import dataRouter from './routes/dataRouter.js';
import uploadRouter from './routes/uploadRouter.js';

/**
 * handle parsing request body
 */
app.use(cors());
app.use(json());
app.use(express.urlencoded({ extended: true }));

/**
 * define route handlers`
 */
app.use('/job', (req, res, next) => {
  console.log('🤝 Incoming request for Job Titles!');
  oNetRouter(req, res, next);
});

app.use('/upload', (req, res, next) => {
  console.log('📜 Incoming resume upload!');
  uploadRouter(req, res, next);
});

import openAIAnalysisController from './controllers/openAIController.js';
app.post(
  '/analyze/:code',
  (req, res, next) => {
    // For testing, we simulate job details.
    res.locals.jobDetails = {
      occupation: 'Software Engineer',
      description: 'Designs, develops, and maintains software systems.',
      // Add other relevant fields if necessary
    };
    next();
  },
  openAIAnalysisController, // produces analysis and stores it in res.locals.analysis
  (req, res) => {
    res.status(200).json({
      analysis: res.locals.analysis,
      yamlResume: res.locals.yamlResume,
      jobDetails: res.locals.jobDetails,
    });
  }
);

app.use('/', (req, res, next) => {
  console.log('🫚 Incoming request for root!');
  authRouter(req, res, next);
});

// catch-all route handler for any requests to an unknown route
app.use((req, res) => {
  console.log('🔒 404 Response Sent!');
  res.status(404).send('404 Page Not Found');
});

// global error handler
app.use((err, req, res, next) => {
  console.log('❌ Error triggered.');
  const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign(defaultError, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).send(errorObj.message);
});

/**
 * start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

export default app;
