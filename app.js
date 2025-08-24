var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const expressSession = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const mongoose = require("mongoose");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware order is important!
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session configuration MUST come before passport
app.use(
  expressSession({
    secret: "Hellohii",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true only if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Flash messages MUST come after session
app.use(flash());

// Passport configuration MUST come after session and flash
app.use(passport.initialize());
app.use(passport.session());

// FIXED: Correct way to set up passport serialization
// The userModel should be imported here, not from usersRouter
const userModel = require("./routes/users"); // This should point to your user model
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
