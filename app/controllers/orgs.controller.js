'use strict';

/**
 * Module dependencies.
 */
var errors = require('../util/errors');
var log = require('../util/logs').getLogger("Orgs Controller");

exports.list = function(req, res) {
    log.debug("Handling request to list orgs");
    return req.getServiceManager().getOrgService().getOrgs()
        .then(res.sendResult)
        .catch(function(err) {
            log.error(err);
            errors.returnError(res, err);
        });
};