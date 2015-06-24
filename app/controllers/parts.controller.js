'use strict';

/**
 * Module dependencies.
 */
var errors = require('../util/errors'),
	_ = require('lodash'),
    routeUtils = require('../util/route.utils'),
    log = require('../util/logs').getLogger("Parts Controller");


/**
 * Create a new part
 */
exports.create = function(req, res) {
    log.debug("Handling request to create a new part for org with id: " + req.user.org);
    var part = req.body;
    part.org = req.user.org;
	return req.getServiceManager().getPartService().addPart(part)
        .then(res.sendResult);
};

/**
 * Show the current part
 */
exports.read = function(req, res) {
    log.debug("Handling request to get part with id: " + req.params.partId);
    return req.getServiceManager().getPartService().getPart(req.params.partId)
        .then(res.sendResult);
};

/**
 * Update a part
 */
exports.update = function(req, res) {
    log.debug("Handling request to update part with id: " + req.params.partId);
    return req.getServiceManager().getPartService().updatePart(req.params.partId, req.body)
        .then(res.sendResult);
};

/**
 * Delete a part
 */
exports.delete = function(req, res) {
    log.debug("Handling request to delete part with id: " + req.params.partId);
    return req.getServiceManager().getPartService().deletePart(req.params.partId)
        .then(res.sendResult);
};

/**
 * List of parts
 */
exports.list = function(req, res) {
    var query = {};

    if (req.user.org) {
        query.org = req.user.org;
    }

    if (!req.user.isSystemAdmin()) {
        log.debug("Handling request to list parts for org with id: " + req.user.org);
    } else {
        log.debug("Handling request to list parts for system-admin acting as org with id: " + req.user.org);
    }

    return req.getServiceManager().getPartService().getParts(query)
        .then(res.sendResult);
};

/**
 * Part authorization middleware
 */
exports.isOrgScoped = function(req, res, next) {
    // TODO: Use continuation passing to pass the request context through the promise chain
    var getter = function () {
        return req.getServiceManager().getPartService().getPart(req.params.partId);
    };

    return routeUtils.hasAuthorization(getter, req)
        .then(next)
        .catch(function(err) {
            if (err instanceof errors.NotAuthorizedError) {
                next(new errors.NotAuthorizedError('Org is not authorized to access this part'));
            } else {
                next(err);
            }
        });
};