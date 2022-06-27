const {JWT_SECRET} = require("../secrets")
const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  const token = req.headers.autorization
  if (!token) return next({status: 401, message: "token required"})

  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    err
    err
      ? next({ status: 401, message: "token invalid" })
      : (req.decodedToken = decodedToken);
    next();
  })
}