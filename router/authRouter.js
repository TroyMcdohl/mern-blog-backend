const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").patch(authController.logout);

router.route("/").get(authController.protect, authController.getAllUsers);

router.route("/forgotpassword").post(authController.forgotPassword);
router.route("/resetpassword/:token").patch(authController.resetPassword);

router
  .route("/updateme")
  .patch(
    authController.protect,
    authController.singleUpload,
    authController.uploadUserPhoto,
    authController.updateMe
  );

router
  .route("/updatepassword")
  .patch(authController.protect, authController.updatePassword);

module.exports = router;
