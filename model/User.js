const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please insert name."],
  },
  email: {
    type: String,
    validate: {
      validator: function (val) {
        return validator.isEmail(val);
      },
    },
    required: [true, "Please insert email."],
    unique: true,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  bio: {
    type: String,
    default: "Here write your bio",
  },
  password: {
    type: String,
    required: [true, "Please insert password."],
  },
  confirmPassword: {
    type: String,
    required: [true, "Please insert confirm password."],
    validate: {
      validator: function (val) {
        return this.password == val;
      },
      message: "Password and Confirm Password need to be same.",
    },
  },

  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: String,
  passwordRestExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePassword = (reqPwd, userPwd) => {
  return bcrypt.compare(reqPwd, userPwd);
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordRestExpires = Date.now() * 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
