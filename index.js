/** @format */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
require("./src/database/mongoDB");
const fileUpload = require("express-fileupload");
const createError = require("http-errors");
const app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const UserSchema = require("./src/model/user/userSchema");
const {generateAccessToken} = require("./src/helper/helper")
const mongoose = require("mongoose");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger("dev"));
app.use(
  fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
/** GOOGLE login start */
// Configure session
app.use(session({
  secret: 'your_session_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Define Passport strategy and routes
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5050/'
},
async (accessToken, refreshToken, profile, done) => {
  done(null, profile); // Pass the profile to serializeUser
}));
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route for initiating Google login
// app.get('/auth/google', passport.authenticate('google', {
//   scope: ['profile', 'email']
// }));
// app.get('/',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   async (req, res) => {
//     // Successful authentication
//     if (!req.user) {
//       console.log('No user found');
//       return res.redirect('/');
//     }
//     else {
//       const getUser = await UserSchema.findOne({email: req.user.emails[0].value});
//       if(!getUser) {
//         const userData = UserSchema({
//           _id: new mongoose.Types.ObjectId(),
//           name: req.user.displayName,
//           email: req.user.emails[0].value,
//           username: req.user.emails[0].value.split("@")[0]
//         })
//         const user = await userData.save();
//         const token = await generateAccessToken(user);
//         return res.status(201).json({message: "User login with google", status: 201, user, token})
//       } else {
//         console.log("User exists")
//         const token = await generateAccessToken(getUser);
//         return res.status(201).json({message: "User login with google", status: 201, user: getUser, token})
//       }
//     }
// });

app.get('/auth/google', async(req, res, next) => {
  const userData = await UserSchema.findOne({email: req.body.email});
  if(!userData) {
    const newUser = UserSchema({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.email,
      email: req.body.email,
      username: req.body.username
    });
    const user = await newUser.save();
    // Generate access token
    const accessToken = await generateAccessToken(user);
    // Generate refresh token
    const refreshToken = await generateRefreshToken(user);
    return res.status(201).json({
      message: "User registration successful",
      statusCode: 200,
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } else {
    // Generate access token
    const accessToken = await generateAccessToken(userData);
    // Generate refresh token
    const refreshToken = await generateRefreshToken(userData);
    return res.status(201).json({
      message: "User registration successful",
      statusCode: 200,
      user: userData,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
});
/** GOOGLE login end */


/** FACEBOOK login start */
// Configure Passport Facebook strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:5050/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email']
},
function(accessToken, refreshToken, profile, done) {
  // Here you would typically find or create a user in your database
  console.log('Profile details:', profile);
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Route to initiate Facebook login
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Callback route
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    console.log("Facebook email", req.user.emails)
    // Successful authentication
    console.log('Callback route hit');
    res.json({ user: req.user });
});
/** FACEBOOK login end */



const port = process.env.PORT || 5050;

// user routes
app.use("/api/users", require("./src/routes/users/userRoutes"));
// admin routes
app.use("/api/admins", require("./src/routes/admin/adminRoutes"));
// booking cab route
app.use("/api/bookings", require("./src/routes/bookCab/bookCabroutes"));
// cars route
app.use("/api/cars", require("./src/routes/cars/CarsRoutes"));
// reviews router
app.use("/api/reviews", require("./src/routes/reviews/reviewsRoute"));

app.use("/api/drivers", require("./src/routes/driver/driverRoutes"))

app.use("/api/notification", require("./src/routes/notification/notificatiRoute"));

app.use("/api/enquire", require("./src/routes/enquireRoute/enquireRoute"));

app.use("/api/config", require("./src/routes/config/configRoute"));

app.use("/api/content", require("./src/routes/content/contentRoute"))


app.use(async (req, res, next) => {
  next(createError.NotFound("Page not found"));
});
// Error message
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const server = app.listen(port, () => {
  console.log(`Server listening on port:${port}`);
});

const io = require("socket.io")(server, {
  transports: ["websocket"],
  pingTimeout: 360000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected...")
})