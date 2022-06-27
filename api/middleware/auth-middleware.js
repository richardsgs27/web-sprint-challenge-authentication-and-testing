const Users = require('../users/users-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../secrets/index')

const checkNewUser = async (req, res, next) => {
  const { username } = req.body
  const user = await Users.findByUserName(username)

  user
    ? next({ status: 401, message: 'username taken' })
    : next()
}

const createNewUser = async (req, res, next) => {
  const { username, password } = req.body
  const hash = bcrypt.hashSync(password, 8)
  const user = { username, password: hash }
  try {
    const newUserRec = await Users.create(user)
    res.status(201).json(newUserRec)
  } catch (error) {
    next(error)
  }
}

const verifyUser = async (req, res, next) => {
  const { username } = req.body
  const user = await Users.findByUserName(username)

  user
    ? req.user = user
    : next({ status: 401, message: 'invalid credentials' })
  next()
}

const validateUserCredentials = (req, res, next) => {
  const { username, password } = req.body

  !username || !password
    ? next({ status: 401, message: 'username and password required' })
    : next()
}

const validateUserToken = (req, res, next) => {
  const user = req.user
  const { password } = req.body
  const credentials = bcrypt.compareSync(password, user.password)

  const generateToken = user => {
    const payload = {
      subject: user.id,
      username: user.username,
    }
    const options = {
      expiresIn: '1d'
    }
    return jwt.sign(payload, JWT_SECRET, options)
  }

  credentials
    ? res.status(200).json({
      message: `welcome, ${user.username}`,
      token: generateToken(user)
    })
    : next({ status: 401, message: 'invalid credentials' })
}


module.exports = {
  checkNewUser,
  createNewUser,
  verifyUser,
  validateUserCredentials,
  validateUserToken
}