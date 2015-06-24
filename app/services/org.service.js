'use strict';

var db = require('./../services/db.service');
var _ = require('lodash');
var errors = require('../util/errors');
var constants = require('../../config/constants');
var config = require('../../config/config');

var OrgService = (function() {

    function OrgService(serviceManager) {
        this.serviceManager = serviceManager;
        this.dbOrg = new db('Org');
    }

    OrgService.prototype.createOrg = function (org, adminUser) {
        var self = this;

        return self.dbOrg.create(org)
            .then(function(org) {
                // Add org id and org-admin role
                adminUser.org = org._id;
                adminUser.roles = constants.ROLES_ALL_ORG;
                return self.serviceManager.getUserService().createUser(adminUser);
            })
            //.catch(function(err) {
            //    // TODO: delete org if this fails!
            //})
            .then(function(user) {
                if (config.mailer.sendOrgCreationNotice) {
                    self.serviceManager.getEmailService().sendOrgCreationNotice(org.name, user);
                }
                return user;
            });
    };

    OrgService.prototype.getOrgs = function (query) {
        query = query || {};
        return this.dbOrg.find(query);
    };

    OrgService.prototype.getOrg = function(orgId) {
        return this.dbOrg.findById(orgId);
    };

    OrgService.prototype.updateOrg = function(orgId, update) {
        var self = this;

        return self.getOrg(orgId)
            .then(function(org) {
                update = _.extend(org, update);
                return self.dbOrg.updateMongooseObj(update);
            });
    };

    return OrgService;

})();

module.exports = OrgService;