const jwt = require("jsonwebtoken");

const Authorization = (req, res, next) => {
  try {
    // Getting the authorization token from the request header
    const token = req.headers.authorization;
    const user = jwt.verify(token, "abitech_secret");
    console.log(user);
    res.locals.userId = user.id;
    res.locals.userEmail = user.email;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Session expired, Please login again" });
  }
};

module.exports = Authorization;
