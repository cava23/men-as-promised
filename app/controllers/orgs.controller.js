'use strict';

/**
 * Module dependencies.
 */
var errors = require('../util/errors');
var log = require('../util/logs').getLogger("Orgs Controller");

exports.list = function(req, res) {
    log.debug("Handling request to list orgs");
    return req.getServiceManager().getOrgService().getOrgs()
        .then(res.sendResult);
};

exports.getCurrentOrg = function(req, res) {
    log.debug('Handling request to get current org');
    return req.getServiceManager().getOrgService().getOrg(req.user.org)
        .then(res.sendResult);
};

exports.update = function(req, res) {
    log.debug('Handling request to update current org');
    return req.getServiceManager().getOrgService().updateOrg(req.user.org, req.body)
        .then(res.sendResult);
};