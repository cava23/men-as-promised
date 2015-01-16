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
    log.debug("Creating new part");
    var part = req.body;
    part.org = req.user.org;
	return req.getServiceManager().getPartService().addPart(part)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Show the current part
 */
exports.read = function(req, res) {
    log.debug("Getting part with id: " + req.params.partId);
    return req.getServiceManager().getPartService().getPart(req.params.partId)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Update a part
 */
exports.update = function(req, res) {
    log.debug("Updating part with id: " + req.params.partId);
    return req.getServiceManager().getPartService().updatePart(req.params.partId, req.body)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Delete a part
 */
exports.delete = function(req, res) {
    log.debug("Deleting part with id: " + req.params.partId);
    return req.getServiceManager().getPartService().deletePart(req.params.partId)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * List of parts
 */
exports.list = function(req, res) {
    log.debug("Listing parts");
    var query = {};
    if (!req.user.isSystemAdmin()) {
        query = {org: req.user.org};
    }

    return req.getServiceManager().getPartService().getParts(query)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Part authorization middleware
 */
exports.isOrgScoped = function(req, res, next) {
    var getter = function () {
        return req.getServiceManager().getPartService().getPart(req.params.partId);
    };

    return routeUtils.hasAuthorization(getter, req)
        .then(next)
        .catch(function(err) {
            if (err instanceof errors.NotAuthorizedError) {
                var error = new errors.NotAuthorizedError('Org is not authorized to access this part');
                log.error(error);
                errors.returnError(res, error);
            } else {
                return next(err);
            }
        });
};