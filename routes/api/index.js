const express = require("express");
const serverless = require("serverless-http");
const passport = require("passport");
const localStrategy = require("passport-local");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

// Models
const userModel = require("../users");
const jobModel = require("../job");

// Initialize app
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Configure passport
passport.use(new localStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Auth check middleware
function IsLoggedin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Express" });
});

app.post("/register", (req, res) => {
  let { username, fullName, email, password } = req.body;
  if (!username || !fullName || !email || !password)
    return res.redirect("/?error=missing_fields");

  let userdata = new userModel({ username, fullName, email });
  userModel
    .register(userdata, password)
    .then(() => {
      passport.authenticate("local")(req, res, () => res.redirect("/home"));
    })
    .catch((err) => {
      if (err.name === "UserExistsError") {
        return res.redirect("/?error=user_exists");
      }
      res.redirect("/?error=registration_failed");
    });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/home", IsLoggedin, (req, res) => {
  res.render("home");
});

app.get("/profile", IsLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    if (!user) return res.redirect("/login");
    res.render("profile", { user });
  } catch (error) {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Export as serverless
module.exports = app;
module.exports.handler = serverless(app);
