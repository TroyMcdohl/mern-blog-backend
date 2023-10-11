const AppError = require("./AppError");

const castErrorHandler = (err) => {
  const msg = `Invalid ${err.path}:${err.value}.`;
  return new AppError(msg, 400);
};

const duplicateError = (err) => {
  const data = err.message.match(/{(.*?)}/, (match) => match);

  return new AppError(
    `${data[1]} already taken,please use another email addresss.`,
    400
  );
};

const validateError = (err) => {
  const message = Object.values(err.errors).map((val) => val.message);
  return new AppError(`${message}`, 400);
};

const developErrorHandler = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack,
  });
};

const errorHandler = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV == "development") {
    developErrorHandler(res, err);
  } else {
    if (err.name == "CastError") {
      err = castErrorHandler(err);
    }

    if (err.code == 11000) {
      err = duplicateError(err);
    }
    if (err.name == "ValidationError") {
      err = validateError(err);
    }

    errorHandler(res, err);
  }
};
