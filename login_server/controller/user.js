const Validate = require("@/validate/index");
const { getPubKeyPem, privateDecrypt } = require("../keys");
const { generateToken } = require("../jwt");

class UserController {
  // get public key
  async publicKey(req, res, next) {
    try {
      const pub_key = getPubKeyPem();
      return res.sendResult({
        msg: "public key fetched",
        data: {
          pub_key,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  // user login
  async login(req, res, next) {
    try {
      const encrypted = req.body?.encrypted;
      const { email, password } = privateDecrypt(encrypted);

      await Validate.nullCheck(email, "email cannot be empty", "email");
      await Validate.nullCheck(password, "password cannot be empty", "password");

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        return res.sendResult({
          code: 422,
          msg: "invalid email format",
          serviceCode: 422,
        });
      }

      if (email === "1820770205@qq.com" && password === "admin") {
        const token = generateToken({ email: email.trim() });
        return res.sendResult({
          msg: "login success",
          data: {
            token,
          },
        });
      }

      return res.sendResult({
        msg: "email or password is incorrect",
        code: 401,
        serviceCode: 401,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new UserController();
