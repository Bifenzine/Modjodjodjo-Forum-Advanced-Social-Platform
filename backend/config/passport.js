import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook"; // Import Facebook strategy
import User from "../models/user.model.js";
import dotenv from "dotenv";
import config from "./config.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: `${config.backendUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check if there is already a user with the same google id in the database
        let user = await User.findOne({ googleId: profile.id });

        // if the googleid doesn t match anyone in the database we store them on it
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            fullName: profile.displayName,
            username: profile.emails[0].value.split("@")[0],
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null,
            profilePic: profile.photos[0].value,
            // no need to password here because we use Oauth with google
            password: null, // or an empty string ''
            isVerified: true,
          });
        }
        // we see data stored oof the user
        console.log("user");
        console.log(user);
        // and we retuen the data of the user to use it later
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: config.oauth.github.clientId,
      clientSecret: config.oauth.github.clientSecret,
      callbackURL: `${config.backendUrl}/api/auth/github/callback`, // Replace with your backend URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check if there is a user with the same ithubid in  the database
        let user = await User.findOne({ githubId: profile.id });

        // if thre isn t we store him in the database
        if (!user) {
          // const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          user = await User.create({
            githubId: profile.id,
            // github does not provide full name
            fullName: profile.displayName || null,
            username: profile.username,
            // github does not provide email
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null,
            profilePic:
              profile.photos && profile.photos[0]
                ? profile.photos[0].value
                : null,
            // no need to password here because we use Oauth with github
            password: null, // or an empty string ''
            isVerified: true,
          });
        }

        // we retuen the user data to use it later
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// facebook strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: config.oauth.facebook.appId,
      clientSecret: config.oauth.facebook.appSecret,
      callbackURL: `${config.backendUrl}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"], // Request these profile fields from Facebook
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            fullName: profile.displayName,
            username: profile.emails[0].value.split("@")[0],
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null,
            profilePic: profile.photos[0].value,
            password: null,
            isVerified: true,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // get the logged user data too use it in the session
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
