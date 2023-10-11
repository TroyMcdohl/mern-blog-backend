const crypto = require("crypto");
const catchAsync = require("../util/catchAsync");
const User = require("../model/User");
const AppError = require("../error/AppError");
const jwt = require("jsonwebtoken");
const Email = require("../mail/mail");
const multer = require("multer");
const sharp = require("sharp");

const filterObj = (obj, ...limitedField) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (!limitedField.includes(el)) return;

    newObj[el] = obj[el];
  });

  return newObj;
};

const createToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRECT, {
    expiresIn: 1 * 3600 * 1000 * 24,
  });
  return token;
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  if (!newUser) {
    return next(new AppError("User cannot be created,please try again.", 400));
  }

  res.status(201).json({
    status: "success",
    data: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (
    !user ||
    !(await user.comparePassword(req.body.password, user.password))
  ) {
    return next(
      new AppError("Login fail.Please check your email and password.", 400)
    );
  }

  const token = createToken(user._id);

  const cookieOption = {
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOption);

  if (process.env.NODE_ENV == "production") cookieOption.secure = true;
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  // res.cookie("jwt", "logout", {
  //   expires: new Date(Date.now() + 3600 * 3600 * 1000),
  //   httpOnly: true,
  // });
  res.clearCookie("jwt");
  res.status(200).json({
    status: "success",
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (!users || users.length == 0) {
    return next(new AppError("Users not found.", 404));
  }

  res.status(200).json({
    status: "success",
    numbers: users.length,
    data: users,
  });
});

exports.protect = async (req, res, next) => {
  if (!req.cookies.jwt) return next(new AppError("Please login again."));

  const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRECT);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User not found,plesae login again", 400));
  }

  req.user = user;

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const filter = filterObj(req.body, "name", "email", "bio");

  if (req.file) {
    filter.photo = req.file.filename;
  }

  const updateUser = await User.findByIdAndUpdate(req.user._id, filter, {
    new: true,
    runValidators: true,
  });

  if (!updateUser) {
    return next(new AppError("Something went wrong,please log in again.", 400));
  }

  res.status(200).json({
    status: "success",
    data: updateUser,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (
    !user ||
    !(await user.comparePassword(req.body.oldPassword, user.password))
  ) {
    return next(new AppError("Password wrong.", 400));
  }

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;

  try {
    await user.save();

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "Can't update password.",
    });
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("User with that email not found.", 400));
  }

  const resetToken = user.createResetToken();

  await user.save({ validateBeforeSave: false });

  const url = ` ${req.protocol}://localhost:3000/blog/resetpassword/${resetToken}`;

  try {
    const data = await new Email(user, url).chgPassword();

    res.status(200).json({
      status: "success",
      message: "Email send successfully.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Email cannot be send,try again."));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  let resetToken;
  if (req.params.token) {
    resetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  }

  const user = await User.findOne({ passwordResetToken: resetToken });

  if (!user) {
    return next(
      new AppError(
        "Reset password can't work for some reason,please try again."
      )
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordRestExpires = undefined;

  try {
    await user.save();

    res.status(200).json({
      status: "success",
      messsage: "Password update successfully.",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      messsage: "Password can't be update,please try again.",
    });
  }
});

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload an image.", 400), false);
  }
};

const upload = multer({
  multerStorage: multerStorage,
  fileFilter: multerFilter,
});

exports.singleUpload = upload.single("photo");

exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/photo/user/${req.file.filename}`);

  next();
});
