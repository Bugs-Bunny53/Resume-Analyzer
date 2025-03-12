import { pool } from '../data/db';
import dotenv from 'dotenv';
dotenv.config();

const oNetController = {};

oNetController.getJobListings = (req, res, next) => {
  console.log('⚒️ Getting Job Listings from oNet SQL DB');

  pool
    .query('SELECT title FROM occupations')
    .then((result) => {
      if (result.rows.length === 0) {
        throw Error;
      }
      res.locals.titles = result.rows;
    })
    .then(next())
    .catch((error) => {
      return next({
        log: 'Shit went sideways in the SQL request for job listings...',
        status: 500,
        message: { err: error },
      });
    });
};

oNetController.getJobDetails = (req, res) => {
  console.log('🕵️ Getting Job Details from oNet SQL DB');
  const { title } = req.params;

  pool
    .query('SELECT * FROM occupations WHERE title = $1', [title])
    .then((result) => {
      if (result.rows.length === 0) {
        throw Error;
      }
      res.locals.details = result.rows;
    })
    .then(next())
    .catch((error) => {
      return next({
        log: 'Shit went sideways in the SQL request for job listings...',
        status: 500,
        message: { err: error },
      });
    });
};
