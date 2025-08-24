var express = require("express");
var router = express.Router();
const userModel = require("./users");
const jobModel = require("./job");
const passport = require("passport");
const localStrategy = require("passport-local");

// Configure passport
passport.use(new localStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

function IsLoggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.post("/register", function (req, res) {
  console.log("========== REGISTRATION ROUTE HIT ==========");
  console.log("Body:", req.body);
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  let { username, fullName, email } = req.body;

  // Validate required fields
  if (!username || !fullName || !email || !req.body.password) {
    console.log("Missing required fields");
    return res.redirect("/?error=missing_fields");
  }

  let userdata = new userModel({
    username,
    fullName,
    email,
  });

  userModel
    .register(userdata, req.body.password)
    .then(function (registereduser) {
      console.log("User registered successfully:", registereduser.username);

      passport.authenticate("local")(req, res, function (err) {
        if (err) {
          console.log("Authentication error:", err);
          return res.redirect("/login");
        }

        console.log("User authenticated, redirecting to home");
        res.redirect("/home"); // Changed from /profile to /home
      });
    })
    .catch(function (err) {
      console.log("Registration error:", err);

      // Handle specific error types
      if (err.name === "UserExistsError") {
        console.log("Username already exists");
        return res.redirect("/?error=user_exists");
      }

      // Redirect back to registration page with error
      res.redirect("/?error=registration_failed");
    });
});

// Home route (protected)
router.get("/home", IsLoggedin, function (req, res) {
  res.render("home");
});

// Login POST route
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home", // Changed from /profile to /home
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Profile route (protected)
router.get("/profile", IsLoggedin, async function (req, res) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    if (!user) {
      console.log("User not found in database");
      return res.redirect("/login");
    }

    res.render("profile", { user });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    res.redirect("/login");
  }
});

// Login GET route
router.get("/login", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

// Logout route
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
module.exports.handler = serverless(app);
