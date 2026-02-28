import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

export const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
        callbackURL: 'http://localhost:8000/api/auth/google/callback'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('No email found from Google profile'), false);
                }

                // Check if user exists by googleId
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    return done(null, user);
                }

                // Check if user exists by email (if they registered normally first)
                user = await User.findOne({ email });
                if (user) {
                    user.googleId = profile.id; // Link the account
                    await user.save();
                    return done(null, user);
                }

                // Create new user via SSO
                user = new User({
                    name: profile.displayName || email.split('@')[0],
                    email: email,
                    googleId: profile.id,
                    role: 'FOUNDER', // Defaulting to founder per the app constraints
                });

                await user.save();
                return done(null, user);

            } catch (error) {
                return done(error, false);
            }
        }
    ));
};
