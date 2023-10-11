const Review = require("../model/Review");
const catchAsync = require("../util/catchAsync");

exports.createReview = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.blog = req.params.bid;
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: newReview,
  });
});

exports.getBlogReview = catchAsync(async (req, res, next) => {
  const blogReview = await Review.find({ blog: req.params.bid });

  res.status(200).json({
    status: "success",
    data: blogReview,
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.rid);

  res.status(200).json({
    status: "success",
  });
});

exports.userBlogsReview = catchAsync(async (req, res, next) => {
  const blogReview = await Review.aggregate([
    {
      $group: {
        _id: "$blog",
        totalRe: { $sum: 1 },
        avgRe: { $avg: "$rating" },
      },
    },
    {
      $project: {
        totalReview: "$totalRe",
        avgReview: { $round: ["$avgRe", 2] },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: blogReview,
  });
});
