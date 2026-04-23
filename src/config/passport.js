const passport = require("passport");
let GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require("../Models/User.Model.js");
// Serialize user for session storage
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://huddler-app-fjy9.onrender.com/user/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {

    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(new Error("No email from Google"));
    }

    let user = await User.findOne({ googleId: profile.id });

    if (user) return done(null, user);

    user = await User.findOne({ email });

    if (user) {
      user.googleId = profile.id;
      user.displayName = profile.displayName;
      user.profilePicture = profile.photos?.[0]?.value;
      user.authProvider = "google";
      await user.save({ validateBeforeSave: false });
      return done(null, user);
    }

    const newUser = new User({
      googleId: profile.id,
      email,
      username: email.split("@")[0],
      displayName: profile.displayName,
      profilePicture: profile.photos?.[0]?.value,
      authProvider: "google"
    });

    await newUser.save();
    return done(null, newUser);

  } catch (error) {
    return done(error);
  }
}));

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   //callbackURL: "https://huddler.onrender.com/user/google/callback", // Fixed path
//   callbackURL: "https://huddler-app-fjy9.onrender.com/auth/google/callback"
//   // scope: ['profile', 'email']
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     // Check for existing user by Google ID
//     let user = await User.findOne({ googleId: profile.id });
//     if (user) {
//       return done(null, user);
//     }

//     // If a user exists with the same email, link the Google account
//     user = await User.findOne({ email: profile.emails?.[0]?.value });
//     if (user) {
//       user.googleId = profile.id;
//       user.displayName = profile.displayName;
//       user.profilePicture = profile.photos?.[0]?.value;
//       user.authProvider = 'google';
//       await user.save({ validateBeforeSave: false });
//       return done(null, user);
//     }

//     // Create a new user for this Google profile
//     // Generate username from email or displayName
//     const emailPrefix = profile.emails?.[0]?.value.split('@')[0];
//     const generatedUsername = emailPrefix || profile.displayName?.replace(/\s+/g, '').toLowerCase();

//     const newUser = new User({
//       googleId: profile.id,
//       email: profile.emails?.[0]?.value,
//       username: generatedUsername,
//       displayName: profile.displayName,
//       profilePicture: profile.photos?.[0]?.value,
//       authProvider: 'google'
//     });

//     await newUser.save();
//     return done(null, newUser);
//   } catch (error) {
//     return done(error);
//   }
// }));



module.exports = passport;
