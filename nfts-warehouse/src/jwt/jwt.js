const jwt = require('jsonwebtoken')

const verifyToken = (roles) => (req, res, next) => {
    var token =
      req.body["access_token"] || req.query["access_token"] || req.headers["authorization"];
  
    if (!token) {
      return res.status(401).send({
          "error": "Forbidden",
          "error_detal": "A token is required for authentication"
      });
    }
    if (token.includes(' ')){
        token = token.split(' ')[1]
    }
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      req.user = decoded;
    } catch (err) {
      console.error(err)
      return res.status(401).send({
          "error": "Forbidden",
          "error_detal": "Invalid token"
      });
    }

    if (roles && roles.length) {
      const hasRole = req.user.roles.some(r => roles.includes(r))
      if (!hasRole) {
        return res.status(403).send({
          "error": "Unauthorized",
          "error_detal": "Access denied"
      });
      }
    }
    return next();
  };
  
  module.exports = {
    verifyToken
  }
