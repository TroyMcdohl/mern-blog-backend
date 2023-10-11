const express = require("express");
const path = require("path");
const globalErrorHandler = require("./error/globalErrorHandler");
require("dotenv").config();
const app = express();
const authRouter = require("./router/authRouter");
const blogRouter = require("./router/blogRouter");
const reviewRouter = require("./router/reviewRouter");
const AppError = require("./error/AppError");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

mongoose
  .connect(process.env.MONGODB_CONNECT)
  .then(() => console.log("DB connnected"))
  .catch((err) => console.log(err));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/photo/user")));
app.use(express.static(path.join(__dirname, "public/photo/blog")));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/review", reviewRouter);

app.all("*", (req, res, next) => {
  return next(new AppError(`The route find ${req.originalUrl} is not found.`));
});

app.use(globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
