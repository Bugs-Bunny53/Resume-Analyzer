const express = require('express');
const app = express();
const PORT = 3000;

/**
 * require routers
 */
const router = require('./routes/api.js');
const apiRouter = require('./routes/characters.js');
const favRouter = require('./routes/favs.js');

/**
 * handle parsing request body
 */
app.use(express.json());

/**
 * define route handlers
 */
// Generic entry point
app.use('/api/characters', (req, res, next) => {
  console.log('🗨️ Characters route accessed.');
  apiRouter(req, res, next);
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

module.exports = app;
