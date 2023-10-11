const mongoose = require("mongoose");
const User = require("./User");

const blogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: User,
    },
    title: {
      type: String,
      required: [true, "Blog title need to be filled"],
    },
    content: {
      type: String,
      required: [true, "Blog can't be created without content."],
    },
    photo: {
      type: String,
    },
    like: [
      {
        type: mongoose.Schema.ObjectId,
        ref: User,
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

blogSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "blog",
  localField: "_id",
});

blogSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user like",
    select: "name",
  });
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
