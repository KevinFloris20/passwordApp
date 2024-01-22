const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const routes = require('./routes'); 
require('dotenv').config(); 
const port = 3000;
const PORT = process.env.PORT || port;


// Passport configuration
const users = JSON.parse(process.env.USERS);
passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            console.log('User not found');
            return done(null, false);
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

const app = express();

// 5. Use helmet to set security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"]
        },
    },
})); 

// Express-rate-limit to rate limit requests
const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 6000,
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production' && PORT !== port
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 1); 

// Global middleware to require authentication for all routes
app.use((req, res, next) => {
    if (req.isAuthenticated() || req.path === '/login') {
        return next();
    }
    res.redirect('/login');
});

// Serve static login page
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// Use the routes from routes.js
app.use(routes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));



// this stuff works great im not deleting it EVER 1/21/24
// const express = require('express');
// const session = require('express-session');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const path = require('path');

// const users = [{ id: 1, username: 'user', password: 'password' }];

// passport.use(new LocalStrategy(
//     (username, password, done) => {
//         console.log('LocalStrategy', username, password);
//         const user = users.find(u => u.username === username && u.password === password);
//         if (!user) {
//             return done(null, false);
//         }
//         return done(null, user);
//     }
// ));

// passport.serializeUser((user, done) => {
//     console.log('serializeUser', user);
//     done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//     console.log('deserializeUser', id);
//     const user = users.find(u => u.id === id);
//     done(null, user);
// });

// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use(session({
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 6000
//     }
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// app.use((req, res, next) => {
//     console.log('Request URL:', req.url);
//     next();
// });

// app.get('/', (req, res) => {
//     console.log('Accessing /');
//     if (req.isAuthenticated()) {
//         console.log('User is authenticated');
//         res.sendFile(path.join(__dirname, 'public/index.html'));
//     } else {
//         console.log('User is not authenticated');
//         res.redirect('/login');
//     }
// });

// app.get('/login', (req, res) => {
//     console.log('Accessing /login');
//     res.sendFile(path.join(__dirname, 'public/login.html'));
// });

// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }));

// function isAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.status(401).send('Unauthorized');
// }

// app.get('/style.css', isAuthenticated, (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/style.css'));
// });

// app.get('/script.js', isAuthenticated, (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/script.js'));
// });

// app.listen(3000, () => console.log('Server started on port 3000'));
