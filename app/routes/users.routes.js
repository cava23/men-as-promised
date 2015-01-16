'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var constants = require('../../config/constants');

module.exports = function(app) {
	// User Routes
	var users = require('../controllers/users.controller.js');

	// Currently logged in user routes
	app.route('/api/v1/me')
		.get(users.me)
		.put(users.updateMe); // currently logged in user updates here

	app.route('/api/v1/me/password').post(users.changePasswordMe);

	// routes for admin
	app.route('/api/v1/users')
		.get(users.requiresRoles(constants.ROLE_ORG_ADMIN), users.list)
		.post(users.requiresRoles(constants.ROLE_ORG_ADMIN), users.create);

	app.all('/api/v1/users/:userId', users.isOrgScoped);
	app.all('/api/v1/users/:userId/*', users.isOrgScoped);
	app.route('/api/v1/users/:userId')
		.get(users.requiresRoles(constants.ROLE_ORG_ADMIN), users.read)
		.put(users.requiresRoles(constants.ROLE_ORG_ADMIN), users.updateUser)
		.delete(users.requiresRoles(constants.ROLE_ORG_ADMIN), users.deleteUser);

	app.route('/api/v1/users/:userId/password').post(users.requiresRoles(constants.ROLE_ORG_ADMIN), users.changePassword);

	app.route('/api/v1/users/accounts').delete(users.removeOAuthProvider);

	// Setting up the users password api
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);
};