const mongoose = require("mongoose");
const Blog = require("./Blog");
const User = require("./User");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
  },
  blog: {
    type: mongoose.Schema.ObjectId,
    ref: Blog,
  },
  review: {
    type: String,
    required: [true, "Review need to be filled"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5,
  },
});

reviewSchema.pre(/^find/, function () {
  this.populate({
    path: "blog",
    select: "createdAt",
  }).populate({
    path: "user",
    select: "photo",
  });
});

reviewSchema.index({ user: 1, blog: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
