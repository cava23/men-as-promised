'use strict';

var should = require('should'),
    request = require('supertest-as-promised'),
    app = require('../server'),
    common = require('./common'),
    agent = request.agent(app),
    api = require('./api-utils'),
    mongoose = require('mongoose-q')(),
    User = mongoose.model('User'),
    constants = require('../config/constants');

var adminCreds, systemAdmin, systemAdminCreds;

describe('Org routes', function() {

    beforeEach(function() {
        adminCreds = {
            username: 'admin',
            password: 'password'
        };

        systemAdminCreds = {
            username: 'systemAdmin',
            password: 'password'
        };

        systemAdmin = {
            firstName: 'System',
            lastName: 'Admin',
            email: 'test@test.com',
            username: systemAdminCreds.username,
            password: systemAdminCreds.password,
            provider: 'local',
            roles: [
                constants.ROLE_SYSTEM_ADMIN
            ]
        };
    });

    afterEach(function() {
        return common.cleanDb();
    });

    function createOrg(orgName) {
        var data = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            orgName: orgName || common.orgName,
            adminUsername: adminCreds.username,
            adminPassword: adminCreds.password
        };

        return api.signup(agent, data)
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.property('org').ok;
                return res;
            });
    }

    it('should be able to create a new org', function() {
        return createOrg()
            .then(function() {
                adminCreds.username = "anotherAdmin";
                return createOrg("org2");
            })
            .then(function() {
                return api.signout(agent);
            })
            .then(function() {
                var user = new User(systemAdmin);
                return user.saveQ();
            })
            .then(function() {
                return api.signin(agent, systemAdminCreds);
            })
            .then(function(res) {
                return api.listOrgs(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(2);
            });
    });

    it('should not allow an org-admin to list orgs', function() {
        return createOrg()
            .then(function() {
                adminCreds.username = "anotherAdmin";
                return createOrg("org2");
            })
            .then(function(res) {
                return api.listOrgs(agent);
            })
            .then(function(res) {
                common.checkApiNotAuthorized(res);
            });
    });

    it('should not allow a user without any roles to list orgs', function() {
        return createOrg()
            .then(function() {
                adminCreds.username = "anotherAdmin";
                return createOrg("org2");
            })
            .then(function() {
                var user = new User({
                    firstName: 'System',
                    lastName: 'Admin',
                    email: 'test@test.com',
                    username: systemAdminCreds.username,
                    password: systemAdminCreds.password,
                    provider: 'local'
                });
                return user.saveQ();
            })
            .then(function() {
                return api.signin(agent, systemAdminCreds);
            })
            .then(function(res) {
                return api.listOrgs(agent);
            })
            .then(function(res) {
                common.checkApiNotAuthorized(res);
            });
    });

});