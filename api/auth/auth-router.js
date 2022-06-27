const router = require('express').Router();

const {
  checkNewUser,
  createNewUser,
  verifyUser,
  validateUserCredentials,
  validateUserToken,
} = require('../middleware/auth-middleware')


router.post('/register',
  validateUserCredentials,
  checkNewUser,
  createNewUser,
  async (req, res, next) => {
   
  });

router.post('/login',
  validateUserCredentials,
  verifyUser,
  validateUserToken,
  (req, res, next) => {
    next()
  });

module.exports = router;