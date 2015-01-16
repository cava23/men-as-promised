'use strict';

/**
 * Module dependencies.
 */
var errors = require('../../util/errors'),
    log = require('../../util/logs').getLogger('User Controller');


/**
 * List users for org
 */
exports.list = function(req, res) {
    log.debug("Handling request to list users");

    req.body.org = req.user.org;
    return req.getServiceManager().getUserService().getUsers({org: req.user.org})
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Get a user by id
 */
exports.read = function(req, res) {
    log.debug("Handling request to get user with id: " + req.params.userId);

    return req.getServiceManager().getUserService().getUser(req.params.userId)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Create user for org
 */
exports.create = function(req, res) {
    log.debug("Handling request to create user");

    req.body.org = req.user.org;
    return req.getServiceManager().getUserService().createUser(req.body)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Update user for org
 */
exports.updateUser = function(req, res) {
    log.debug("Handling request to update user with id: " + req.params.userId);

    return req.getServiceManager().getUserService().updateUser(req.params.userId, req.body)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};

/**
 * Delete user for org
 */
exports.deleteUser = function(req, res) {
    log.debug("Handling request to delete user with id: " + req.params.userId);

    if (req.user._id.toString() === req.params.userId) {
        throw new errors.NotAuthorizedError("You cannot delete the currently logged in user");
    } else {
        return req.getServiceManager().getUserService().deleteUser(req.params.userId)
            .then(res.sendResult)
            .catch(function(err) {
                log.error(err);
                errors.returnError(res, err);
            });
    }
};

/**
 * Change password for user
 */
exports.changePassword = function(req, res) {
    log.debug("Handling request to change password for user with id: " + req.params.userId);

    if (req.user._id.toString() === req.params.userId) {
        throw new errors.BadRequestError("You cannot change your own password with this method");
    }

    return req.getServiceManager().getUserService().changePassword(req.params.userId, req.body)
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};