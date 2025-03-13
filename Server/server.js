import express, { json } from 'express';
const app = express();
const PORT = 3000;

// Connect to the Mongo DB on server start
import connectDB from "./data/db.js";
connectDB();

/**
 * require routers
 */
import apiRouter from './routes/oNetRouter';

/**
 * handle parsing request body
 */
app.use(json());
app.use(express.urlencoded({ extended: true }));


/**
 * define route handlers`
 */
app.use('/job-titles', (req, res, next) => {
  console.log('🤝 Incoming request for Job Data!');
  oNetRouter(req, res, next);
});

app.use("/upload", (req, res, next) => {
  console.log('📜 Incoming resume upload!');
  uploadRouter(req, res, next)
});

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
