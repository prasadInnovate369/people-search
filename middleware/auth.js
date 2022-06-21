/* eslint-disable semi */
/* eslint-disable quotes */
const jwt = require("jsonwebtoken");
const { getUserById } = require("../models/users");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.loginCookie;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

    const user = await getUserById(verifyUser.id);

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.send({ msg: error.message, status: 400 });
  }
};

const authenticateToken = (req, res, next) => {
  try {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader) {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      const decoded = jwt.verify(bearerToken, process.env.AUTH_TOKEN);
      req.user = decoded;
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    return res.send({ msg: error.message, status: 400 });
  }
};

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) return res.status(401).send("no token");
//   jwt.verify(token, process.env.AUTH_TOKEN, (err, user) => {
//     if (err) return res.status(403).send("expired token");
//     req.user = user;
//     next();
//   });
// };

module.exports = { auth, authenticateToken };
