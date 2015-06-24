'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errors = require('../../util/errors'),
	mongoose = require('mongoose-q')(),
	passport = require('passport'),
	User = mongoose.model('User'),
    log = require('../../util/logs').getLogger('User Controller');

/**
 * Signup
 */
exports.signup = function(req, res, next) {
	log.debug("Handling request to create org");

	var org = {
        name: req.body.orgName,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
    };
	var adminUser = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		username: req.body.adminUsername,
		password: req.body.adminPassword
	};

	return req.getServiceManager().getOrgService().createOrg(org, adminUser)
		.then(function(adminUser) {
			log.debug("Logging in as org-admin for new org: " + org.name);
			// Remove sensitive data before login
			adminUser.password = undefined;
			adminUser.salt = undefined;

			req.login(adminUser, function(err) {
				if (err) {
					log.error(err);
					res.status(400).send(err);
				} else {
					res.sendResult(adminUser);
				}
			});
		});
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
            log.error(err, info);
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
                    log.error(err);
					res.status(400).send(err);
				} else {
					res.sendResult(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.sendResult({
        ok: true
    });
};
