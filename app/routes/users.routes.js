'use strict';

/**
 * Module dependencies.
 */
var constants = require('../../config/constants');
var util = require('./../util/route.utils.js');
var	sw = require('swagger-node-express');
var	paramTypes = sw.paramTypes;

module.exports = function(app, swagger) {
	// User Routes
	var users = require('../controllers/users.controller.js');
    var orgs = require('../controllers/orgs.controller.js');

	swagger.configureDeclaration("user", {
		description : "Operations about Users",
		produces: ["application/json"]
	});

	// Currently logged in user routes
	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/me',
		method: "GET",
		summary : "Get the currently logged in user",
		notes : "",
		type : "User",
		nickname : "getCurrentUser",
		parameters : [],
		responseMessages : []
	}, users.me);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/me',
		method: "PUT",
		summary : "Update the currently logged in user",
		notes : "",
		type : "User",
		nickname : "updateCurrentUser",
		parameters : [paramTypes.body("body", "The properties to update", "User", "{}")],
		responseMessages : []
	}, users.updateMe);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/me/password',
		method: "POST",
		summary : "Change the currently logged in user's password",
		notes : "",
		type : "User",
		nickname : "changeCurrentUserPassword",
		parameters : [],
		responseMessages : []
	}, users.changePasswordMe);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/me/feedback',
		method: "POST",
		summary : "Send feedback to the development team",
		notes : "",
		type : "",
		nickname : "sendFeedback",
		parameters : [],
		responseMessages : []
	}, users.sendFeedback);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/me/org',
		method: "GET",
		summary : "Get information about your org",
		notes : "",
		type : "Org",
		nickname : "getOrg",
		parameters : [],
		responseMessages : []
	}, [users.requiresRoles(constants.ROLE_ORG_ADMIN), orgs.getCurrentOrg]);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/me/org',
		method: "PUT",
		summary : "Update your org information",
		notes : "",
		type : "Org",
		nickname : "updateOrg",
		parameters : [paramTypes.body("body", "The properties to update", "Org", "{}")],
		responseMessages : []
	}, [users.requiresRoles(constants.ROLE_ORG_ADMIN), orgs.update]);

	// routes for admin
	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/users',
		method: "GET",
		summary : "List all users",
		notes : "",
		type : "User",
		nickname : "getUsers",
		parameters : [],
		responseMessages : []
	}, [users.requiresRoles([constants.ROLE_ORG_ADMIN, constants.ROLE_ENGINEER, constants.ROLE_SHOP]), users.list]);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/users',
		method: "POST",
		summary : "Create a new user",
		notes : "",
		type : "User",
		nickname : "createUser",
		parameters : [paramTypes.body("body", "The new User", "User", "{}", true)],
		responseMessages : []
	}, [users.requiresRoles(constants.ROLE_ORG_ADMIN), users.create]);

	app.all('/api/v1/users/:userId', users.isOrgScoped);
	app.all('/api/v1/users/:userId/*', users.isOrgScoped);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/users/{userId}',
		method: "GET",
		summary : "Get a user by ID",
		notes : "",
		type : "User",
		nickname : "getUser",
		parameters : [paramTypes.path("userId", "The ID of the User to return", "string")],
		responseMessages : []
	}, [users.requiresRoles(constants.ROLE_ORG_ADMIN), users.read]);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/users/{userId}',
		method: "PUT",
		summary : "Update a user by ID",
		notes : "",
		type : "User",
		nickname : "updateUser",
		parameters : [
			paramTypes.path("userId", "The ID of the User to update", "string"),
			paramTypes.body("body", "The properties to update", "User", "{}")
		],
		responseMessages : []
	}, [users.requiresRoles(constants.ROLE_ORG_ADMIN), users.updateUser]);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/users/{userId}',
		method: "DELETE",
		summary : "Delete a user by ID",
		notes : "",
		type : "User",
		nickname : "deleteUser",
		parameters : [paramTypes.path("userId", "The ID of the User to delete", "string")],
		responseMessages : []
	}, [users.requiresRoles(constants.ROLE_ORG_ADMIN), users.deleteUser]);

	util.registerDocumentedRoute(swagger, {
		path : '/api/v1/users/{userId}/password',
		method: "POST",
		summary : "Change a user's password by ID",
		notes : "",
		type : "User",
		nickname : "changeUserPassword",
		parameters : [paramTypes.path("userId", "The ID of the User to update", "string")],
		responseMessages : []
	}, [users.requiresRoles(constants.ROLE_ORG_ADMIN), users.changePassword]);

	// Setting up the users password api
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);

	util.registerDocumentedRoute(swagger, {
		path : '/auth/signin',
		method: "POST",
		summary : "Sign in",
		notes : "A cookie is returned that must be used in subsequent API requests.",
		type : "User",
		nickname : "signin",
		parameters : [paramTypes.body("body", "Username and password", "Credentials", "", true)],
		responseMessages : []
	}, users.signin);

	util.registerDocumentedRoute(swagger, {
		path : '/auth/signout',
		method: "GET",
		summary : "Sign out",
		notes : "",
		type : "User",
		nickname : "signout",
		parameters : [],
		responseMessages : []
	}, users.signout);
};