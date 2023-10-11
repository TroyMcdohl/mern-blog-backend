const express = require("express");
const router = express.Router({ mergeParams: true });
const authController = require("../controller/authController");
const reviewController = require("../controller/reviewController");

router
  .route("/")
  .post(authController.protect, reviewController.createReview)
  .get(authController.protect, reviewController.getBlogReview);

router
  .route("/:rid")
  .delete(authController.protect, reviewController.deleteReview);

router
  .route("/userblogs/reviews")
  .get(authController.protect, reviewController.userBlogsReview);

module.exports = router;
