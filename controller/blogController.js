const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../error/AppError");
const Blog = require("../model/Blog");
const catchAsync = require("../util/catchAsync");

exports.createBlog = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.photo = req.file.filename;

  const newBlog = await Blog.create(req.body);

  res.status(201).json({
    newBlog,
  });
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const blogs = await Blog.find();

  res.status(200).json({
    status: "success",
    numbers: blogs.length,
    data: blogs,
  });
});

exports.getUserBlogs = catchAsync(async (req, res, next) => {
  const userBlogs = await Blog.find({ user: req.user._id }).populate("reviews");

  res.status(200).json({
    status: "success",
    numbers: userBlogs.length,
    data: userBlogs,
  });
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.bid);

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findByIdAndDelete(req.params.bid);

  res.status(200).json({
    status: "success",
  });
});

exports.likeBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.bid,
    {
      $addToSet: { like: [req.user._id] },
    },
    {
      new: true,
    }
  );

  if (!blog) {
    return next(new AppError("Can't like this blog,try again.", 400));
  }

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

exports.unlikeBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.bid,
    {
      $pull: { like: req.user._id },
    },
    {
      new: true,
    }
  );

  if (!blog) {
    return next(new AppError("Can't unlike this blog,try again.", 400));
  }

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

exports.getLikeBlog = catchAsync(async (req, res, next) => {
  const favBlog = await Blog.find({ like: { $in: req.user._id } });

  res.status(200).json({
    status: "success",
    data: favBlog,
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    cb(next(new AppError("Please upload an image.", 400)), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadBlogPhoto = upload.single("photo");

exports.resizeBlogPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `blog-${Date.now()}-${Date.now()}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/photo/blog/${req.file.filename}`);

  next();
});

exports.blogPostOnTime = catchAsync(async (req, res, next) => {
  const blogs = await Blog.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        posts: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: blogs,
  });
});
