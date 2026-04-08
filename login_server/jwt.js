const jwt = require("jsonwebtoken");
const { getPrivateKeyPem, getPubKeyPem } = require("./keys");

const privateSecret = getPrivateKeyPem();
const publicSecret = getPubKeyPem();

const options = {
  expiresIn: "2h",
  algorithm: "RS256",
};

function generateToken(user) {
  const payload = {
    email: user.email,
  };

  return jwt.sign(payload, privateSecret, options);
}

function authenticateToken(req, res, next) {
  if (["/login", "/getPubKey"].includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.sendResult({
      msg: "Unauthorized: No token provided.",
      code: 401,
      serviceCode: 401,
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.sendResult({
      msg: "Unauthorized: Invalid authorization header.",
      code: 401,
      serviceCode: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, publicSecret, { algorithms: ["RS256"] });
    req.user = decoded;
    return next();
  } catch (err) {
    return res.sendResult({
      msg: "Unauthorized: Invalid token.",
      code: 401,
      serviceCode: 401,
    });
  }
}

module.exports = {
  generateToken,
  authenticateToken,
};
