const router = require('express').Router();
const User = require('./users-model')


router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (err) {
    next(err)
  }
})

module.exports = router;