const express = require("express");
const router = express.Router();
const blogController = require("../controller/blogController");
const authController = require("../controller/authController");
const reviewRouter = require("./reviewRouter");

router.use("/:bid/review", reviewRouter);

router
  .route("/")
  .post(
    authController.protect,
    blogController.uploadBlogPhoto,
    blogController.resizeBlogPhoto,
    blogController.createBlog
  );

router
  .route("/allblogs")
  .get(authController.protect, blogController.getAllBlogs);

router
  .route("/favblogs")
  .get(authController.protect, blogController.getLikeBlog);

router
  .route("/userblogs")
  .get(authController.protect, blogController.getUserBlogs);

router
  .route("/blogposts")
  .get(authController.protect, blogController.blogPostOnTime);

router
  .route("/:bid")
  .delete(authController.protect, blogController.deleteBlog)
  .get(authController.protect, blogController.getBlog);

router
  .route("/like/:bid")
  .patch(authController.protect, blogController.likeBlog);

router
  .route("/unlike/:bid")
  .patch(authController.protect, blogController.unlikeBlog);

module.exports = router;
