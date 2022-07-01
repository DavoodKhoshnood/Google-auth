const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const GOOGLE_CLIENT_ID = '70179633780-3knto36u5ur2one0qm7j8noeg73dmhsn.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(null, profile);
    // });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user )
});

passport.deserializeUser(function(user, done) {
    done(null, user )
});