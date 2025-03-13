
import { router } from 'express';
import authController from '../controllers/authController'

// * Router to handle login requests
router.post('/login', authController.login, (req, res) => {
  return res.status(200).send('login button');
});
// * Router to handle registration requests
router.post('/register', authController.register, (req, res) => {
  return res.status(200).send('register submit button');
});
