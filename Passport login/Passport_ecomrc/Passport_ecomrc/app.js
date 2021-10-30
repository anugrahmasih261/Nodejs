const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');  //this is to send msg while login
const session = require('express-session');

const app = express();

// Passport Config
require('./config/passport')(passport);

//this info is from or related to keys.js file which is mainly db connection fileS
// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(
        db,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));



// EJS   it's a middleware
app.use(expressLayouts);  //this line 26 should be here before the line 27 v.v.i
app.set('view engine', 'ejs');

// Express body parser  this is for schema user in user.js file to get form data 
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

//these 2 lines from passport docs
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());  //this is how we call or import library to use them with express app

// Global variables
//this flash msg to display error msgs through flash it's a middleware
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));