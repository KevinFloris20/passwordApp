const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

// Assuming you have a user array or database setup
const users = [{ id: 1, username: 'user', password: 'password' }];

passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    // cookie: { maxAge: null }  // Setting maxAge to null will delete the cookie when the browser is closed
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to redirect unauthenticated requests to login
function ensureAuthenticated(req, res, next) {
    console.log(req.isAuthenticated());
    console.log(req, res, next)
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

// Middleware to destroy session after serving a page
function destroySession(req, res, next) {
        console.log(req.isAuthenticated());
    console.log(req, res, next)
    res.on('finish', () => {
        req.session.destroy();
    });
    next();
}

app.get('/', destroySession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/login',destroySession, (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.listen(3000, () => console.log('Server started on port 3000'));
