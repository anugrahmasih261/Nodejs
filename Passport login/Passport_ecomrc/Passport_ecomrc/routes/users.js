//this page has routes related to users only like login and signup

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    //this is how to check all fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    //this is both passwords check
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    //check password lenght
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });  //this how json msg is send to client side
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
        //if validation is passed then we need to use model to save import it as on line 8 and 9
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                //check if user exists or not 
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                //if user does not exists we need to create new user so by using bcrypt import it as on line 5
                const newUser = new User({
                    name,
                    email,
                    password
                });

                // Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        //set password to hashed
                        newUser.password = hash;
                        //now save the new user
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login Handel
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',    //here we can use the route to our dashboard page where we want to land after login
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle a function for logout
router.get('/logout', (req, res) => {
    req.logout();   //here logout is passport middleware function
    req.flash('success_msg', 'You are logged out');   //whenever u want to use flash msg use like this flash comes and goes type lib
    res.redirect('/users/login');
});

module.exports = router;
