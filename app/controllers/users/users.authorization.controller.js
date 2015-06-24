'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose-q')(),
	routeUtils = require('../../util/route.utils'),
	errors = require('../../util/errors'),
	log = require('../../util/logs').getLogger("User Auth Controller");

/**
 * User authorization middleware
 */
exports.isOrgScoped = function(req, res, next) {
	// TODO: Use continuation passing to pass the request context through the promise chain
	var getter = function() {
		return req.getServiceManager().getUserService().getUser(req.params.userId);
	};

	return routeUtils.hasAuthorization(getter, req)
		.then(next)
		.catch(function(err) {
			if (err instanceof errors.NotAuthorizedError) {
				next(new errors.NotAuthorizedError('Org is not authorized to access this user'));
			} else {
				next(err);
			}
		});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).json({
            statusCode: 401,
			message: 'User is not logged in'
		});
	}

	next();
};

/**
 * User role authorizations routing middleware
 */
exports.requiresRoles = function(roles) {
	var _this = this;
	if (!_.isArray(roles)) {
		roles = [roles];
	}

	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			} else {
				return res.status(403).json({
                    statusCode: 403,
					message: 'User is not authorized'
				});
			}
		});
	};
};