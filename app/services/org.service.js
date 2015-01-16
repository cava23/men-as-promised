'use strict';

var mongo = require('./../services/mongo.service');
var _ = require('lodash');
var errors = require('../util/errors');
var constants = require('../../config/constants');

var OrgService = (function() {

    function OrgService(serviceManager) {
        this.serviceManager = serviceManager;
        this.dbOrg = new mongo('Org');
    }

    OrgService.prototype.createOrg = function (orgName, adminUser) {
        var self = this;

        return self.dbOrg.create({name: orgName})
            .then(function(org) {
                // Add org id and org-admin role
                adminUser.org = org._id;
                adminUser.roles = constants.ROLES_ALL_ORG;
                return self.serviceManager.getUserService().createUser(adminUser);
            });
    };

    OrgService.prototype.getOrgs = function (query) {
        query = query || {};
        return this.dbOrg.find(query);
    };

    return OrgService;

})();

module.exports = OrgService;