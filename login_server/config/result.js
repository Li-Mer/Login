const responseHandler = (req, res, next) => {
  res.sendResult = ({
    data = null,
    code = 200,
    msg = "success",
    error = null,
    serviceCode = 200,
  } = {}) => {
    res.status(code).json({
      serviceCode,
      msg,
      data,
      error,
    });
  };

  next();
};

module.exports = responseHandler;
