var express = require('express');
var https = require('https');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');
var OAuth2 = require('OAuth').OAuth2;
var access_token_string;
var config = require('../config');

router.get('/:searchString', function(req, res, next) {
    console.log("Twitter search string " + req.params.searchString);

    if (!access_token_string) {

        var oauth2 = new OAuth2(config.twitterAppKey, config.twitterAppSecret,config.twitterBaseURL, null, 'oauth2/token', null);
        oauth2.getOAuthAccessToken('', {
            'grant_type': 'client_credentials'
        }, function(err, access_token) {
			
			 if (err) {
                console.log("Search Failed with : " + err.message);
                return res.status(500).json([{error: 'Twitter failed to fetch auth token'}]);
            }
			
         //string that we can use to authenticate request
            access_token_string = access_token;
            mySearch(req, res);
        });
    } else {
       mySearch(req, res);
    }
});

router.post('/register', function(req, res) {

    console.log("server:reg called for" + req.body.username);
    User.register(new User({
            username: req.body.username
        }),
        req.body.password,
        function(err, user) {
            if (err) {
                console.log("server:reg call for" + req.body.username + " failed with err" + err.message);
                return res.status(500).json({
                    err: err
                });
            }
            passport.authenticate('local')(req, res, function() {
                console.log("server:reg call for" + req.body.username + " success ");
                return res.status(200).json({
                    status: 'Registration Successful!'
                });
            });
        });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }

            var token = Verify.getToken(user);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});


function mySearch(req, res) {

    var options = {
        hostname: 'api.twitter.com',
        path: '/1.1/search/tweets.json?q=' + encodeURIComponent(req.params.searchString),
        headers: {
            Authorization: 'Bearer ' + access_token_string
        }
    };

    https.get(options, function( result) {
        var buffer = '';
        result.setEncoding('utf8');
        result.on('data', function(data) {
            buffer += data;
        });
        result.on('end', function() {
        var tweets = JSON.parse(buffer);
        console.log(tweets); // searched  tweets!
        res.status(200).json(tweets.statuses);
        });
    })
 


}

module.exports = router;