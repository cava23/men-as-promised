'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errors = require('../../util/errors'),
	mongoose = require('mongoose-q')(),
	passport = require('passport'),
	User = mongoose.model('User');

function scrubUser(user) {
	// For security measurement we remove the roles from the req.body object
	delete user.roles;
	delete user.password;
	delete user.salt;
	delete user.provider;
	delete user.username;
	delete user.created;
	delete user.resetPasswordToken;
	delete user.resetPasswordExpires;
	delete user.additionalProvidersData;
	delete user.providerData;
}

/**
 * Update user details
 */
exports.updateMe = function(req, res) {
	// Init Variables
	var user = req.user;

	scrubUser(req.body);

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				throw new errors.BadRequestError(errors.getErrorMessage(err));
			} else {
				req.login(user, function(err) {
					if (err) {
						throw new errors.BadRequestError(errors.getErrorMessage(err));
					} else {
						res.sendResult(user);
					}
				});
			}
		});
	} else {
		throw new errors.BadRequestError("User is not signed in");
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.sendResult(req.user || null);
};

/**
 * Send feedback
 */
exports.sendFeedback = function(req, res) {
	if (!req.body || !req.body.message) {
		throw new errors.BadRequestError("Please include a message");
	}

	req.getServiceManager().getEmailService().sendFeedback(req.user, req.body.message)
		.then(function() {
			res.sendResult({});
		});
};