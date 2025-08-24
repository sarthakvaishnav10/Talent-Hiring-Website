# Install These Packages
 npm i passport passport local passport-local-mongoose mongoose express-session

# write app.js code first in the app and write it after view engine and before logger

 code for App.js
 app.use(expressSession({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser);
passport.deserializeUser(usersRouter.deserializeUser);
app.use(flash());


# Setup users.js properly

# In index.js try registering a user and then other codes as well