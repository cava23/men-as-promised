'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.controller.js'),
	parts = require('../controllers/parts.controller.js'),
    config = require('../../config/config'),
    utils = require('../util/route.utils'),
    constants = require('../../config/constants'),
	sw = require('swagger-node-express'),
    paramTypes = sw.paramTypes;

module.exports = function(app, swagger) {
    var prefix = '/api/v1/parts';

    swagger.configureDeclaration("part", {
        description : "Operations about Parts",
        produces: ["application/json"]
    });

	// Parts
    app.all(prefix + '/:partId', parts.isOrgScoped);

    utils.registerDocumentedRoute(swagger, {
        path : prefix,
        method: "GET",
        summary : "Get a list of parts",
        notes : "",
        type : "Part",
        nickname : "getParts",
        parameters : [],
        responseMessages : []
    }, parts.list);

    utils.registerDocumentedRoute(swagger, {
        path : prefix,
        method: "POST",
        summary : "Create a new part",
        notes : "",
        type : "Part",
        nickname : "createPart",
        parameters : [paramTypes.body("body", "The part to create", "Part", "{}", true)],
        responseMessages : []
    }, [users.requiresRoles(constants.ROLE_ENGINEER), parts.create]);

    utils.registerDocumentedRoute(swagger, {
        path : prefix + "/{partId}",
        method: "GET",
        summary : "Get a part by ID",
        notes : "",
        type : "Part",
        nickname : "getPart",
        parameters : [paramTypes.path("partId", "The ID of the Part to return", "string")],
        responseMessages : []
    }, parts.read);

    utils.registerDocumentedRoute(swagger, {
        path : prefix + "/{partId}",
        method: "PUT",
        summary : "Update a part by ID",
        notes : "",
        type : "Part",
        nickname : "updatePart",
        parameters : [
            paramTypes.path("partId", "The ID of the Part to update", "string"),
            paramTypes.body("body", "The properties to update", "Part", "{}")
        ],
        responseMessages : []
    }, [users.requiresRoles(constants.ROLE_ENGINEER), parts.update]);

    utils.registerDocumentedRoute(swagger, {
        path : prefix + "/{partId}",
        method: "DELETE",
        summary : "Delete a part by ID",
        notes : "This will delete the part and everything associated with it.",
        type : "Part",
        nickname : "deletePart",
        parameters : [paramTypes.path("partId", "The ID of the Part to delete", "string")],
        responseMessages : []
    }, [users.requiresRoles(constants.ROLE_ENGINEER), parts.delete]);

};