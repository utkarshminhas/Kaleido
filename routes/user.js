var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
var bodyParser = require('body-parser')
/*
// create application/json parser
var jsonParser = bodyParser.json()
*/

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const User = require('../models/user')

router.get('/signup', function (req, res, next) {
    res.render('signup', { title: 'Kaleido' });
});

router.post('/signup', urlencodedParser, (request, response, next) => {

    // console.log("req body");
    // console.log(request.body);
    User.find({ email: request.body.email }).exec().then(user => {
        if (user.length >= 1) {

        } else {
            bcrypt.hash(request.body.pass, 10, (err, hash) => {
                if (err) {
                    return response.status(500).json({
                        error: err,
                    });

                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: request.body.email,
                        name: request.body.name,
                        password: hash,

                    });

                    console.log(user);

                    user.save().then(result => {
                        console.log("result after saving  user in KDB");

                        console.log(result);
                        response.render('index', { title: 'Kaleido', name: user.name });
                        // response.status(201).json({
                        //     message: 'User Created'
                        // });
                    })
                        .catch(err => {
                            console.log(err);
                            response.status(500).json({
                                error: err
                            })
                        });

                }
                // response.render('index', { title: 'Kaleido' });
            })
        }
    });
});


router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Kaleido' });
});

router.post('/login', urlencodedParser, (req, res, next) => {

    console.log("req body");
    console.log(req.body);
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    what: "email does not exist",
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.pass, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        // process.env.JWT_KEY,
                        "JWT_KEY_SECRET",
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.render('index', { title: 'Kaleido', name: user[0].name });

                    // res.status(200).json({
                    //     message: "Auth successful",
                    //     token: token
                    // });
                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;
