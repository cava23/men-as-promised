'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	log = require('../../app/util/logs').getLogger('Local Strategy'),
	User = require('mongoose-q')().model('User');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			User.findOne({
				username: username ? username.toLowerCase() : null
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					log.debug('Unknown user: ' + username);
					return done(null, false, {
						statusCode: 400,
						message: 'Unknown user or invalid password' // do not expose detailed knowledge of failure
					});
				}
				if (!user.authenticate(password)) {
					log.debug('Invalid password for user: ' + username);
					return done(null, false, {
						statusCode: 400,
						message: 'Unknown user or invalid password' // do not expose detailed knowledge of failure
					});
				}

				return done(null, user);
			});
		}
	));
};