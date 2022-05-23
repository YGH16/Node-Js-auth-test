const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

    // Check token exists
  if (!token) {
    return res.status(403).send("No Token exists");
  }

    // decode the token
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;

  } catch (err) {
      
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;