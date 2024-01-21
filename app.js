const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const users = [{ id: 1, username: 'user', password: 'password' }];

passport.use(new LocalStrategy(
    (username, password, done) => {
        console.log('LocalStrategy', username, password);
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    console.log('serializeUser', user);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log('deserializeUser', id);
    const user = users.find(u => u.id === id);
    done(null, user);
});

const app = express();
// app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    next();
});

app.get('/', (req, res) => {
    console.log('Accessing /');
    if (req.isAuthenticated()) {
        console.log('User is authenticated');
        res.sendFile(path.join(__dirname, 'public/index.html'));
    } else {
        console.log('User is not authenticated');
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    console.log('Accessing /login');
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('Unauthorized');
}

app.get('/style.css', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/style.css'));
});

app.get('/script.js', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/script.js'));
});

app.listen(3000, () => console.log('Server started on port 3000'));
