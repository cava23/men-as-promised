'use strict';

var should = require('should'),
    request = require('supertest-as-promised'),
    app = require('../server'),
    common = require('./common'),
    agent = request.agent(app),
    api = require('./api-utils'),
    orgFixture = require('./fixtures/organizationFixture'),
    constants = require('../config/constants');

var adminCreds;

describe('Orgs and Users', function() {

    beforeEach(function() {
        adminCreds = {
            username: 'andrew_admin',
            password: 'password'
        };
    });

    afterEach(function() {
        return common.cleanDb();
    });

    function createOrg(orgName) {
        var data = orgFixture.buildOrg(orgName, adminCreds);

        return api.signup(agent, data)
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.property('org').ok;
                return res;
            });
    }

    function shouldHaveRole(res, role) {
        res.body.result.should.have.property('roles');
        res.body.result.roles.should.containEql(role);
    }

    function checkLoggedInAsAdmin() {
        return api.getCurrentUser(agent)
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ORG_ADMIN);
                return res;
            });
    }

    it('should be able to create a new org', function() {
        return createOrg()
            .then(function(res) {
                // should be logged in and have zero parts
                return api.listParts(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(0);
                // check that the currently logged in user is admin
                return checkLoggedInAsAdmin();
            })
            .then(function(res) {
                // log out and back in with admin credentials
                return api.signout(agent);
            })
            .then(function(res) {
                // TODO: verify we're logged out?
                return api.signin(agent, adminCreds);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ORG_ADMIN);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                shouldHaveRole(res, constants.ROLE_SHOP);
                return api.listParts(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
            });
    });

    it('should create an org and log in with different case', function() {
        return createOrg()
            .then(function(res) {
                // should be logged in and have zero parts
                return api.listParts(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(0);
                // check that the currently logged in user is admin
                return checkLoggedInAsAdmin();
            })
            .then(function(res) {
                // log out and back in with admin credentials
                return api.signout(agent);
            })
            .then(function(res) {
                // TODO: verify we're logged out?
                adminCreds.username = "ANDREW_ADMIN";
                return api.signin(agent, adminCreds);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ORG_ADMIN);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                shouldHaveRole(res, constants.ROLE_SHOP);
                return api.listParts(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
            });
    });

    it('should return error if username is already taken', function() {
        return createOrg()
            .then(function(res) {
                // change the case
                adminCreds.username = adminCreds.username.toUpperCase();
                var data = orgFixture.buildOrg("org", adminCreds);
                return api.signup(agent, data);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
                res.body.should.have.property('message', 'Username already exists');
            });
    });

    it('should add a user to org with engineer role', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'andrew',
            password: 'password',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };

        return createOrg()
            .then(function() {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                res.body.result.should.not.have.property('password');
                res.body.result.should.not.have.property('salt');
                // make sure we're still logged in as admin
                return checkLoggedInAsAdmin();
            })
            .then(function() {
                // logout and back in as engineer
                return api.signout(agent);
            })
            .then(function() {
                // log in using a different case
                return api.signin(agent, {username: 'Andrew', password: user.password});
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                return api.listParts(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(0);
            });
    });

    it('should add a user to org without password', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            username: 'andrew',
            password: 'password',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };

        return createOrg()
            .then(function() {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                res.body.result.should.not.have.property('password');
                res.body.result.should.not.have.property('salt');
                // make sure we're still logged in as admin
                return checkLoggedInAsAdmin();
            })
            .then(function() {
                // logout and back in as engineer
                return api.signout(agent);
            })
            .then(function() {
                // log in using a different case
                return api.signin(agent, {username: 'Andrew', password: user.password});
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                return api.listParts(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(0);
            });
    });

    it('should add a role to a user', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'andrew',
            password: 'password',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };
        var userId;

        return createOrg()
            .then(function() {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                userId = res.body.result._id;
                user.roles.push(constants.ROLE_SHOP);
                return api.updateUser(agent, userId, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                shouldHaveRole(res, constants.ROLE_SHOP);
                res.body.result.should.not.have.property('password');
                res.body.result.should.not.have.property('salt');
                // log out as admin and back in as user
                return api.signout(agent);
            })
            .then(function() {
                return api.signin(agent, {username: user.username, password: user.password});
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                shouldHaveRole(res, constants.ROLE_SHOP);
            });
    });

    it('should not be able to update a user in a different org', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'andrew',
            password: 'password',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };
        var userId;

        return createOrg()
            .then(function() {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                userId = res.body.result._id;
                return api.signout(agent);
            })
            .then(function() {
                adminCreds.username = "chris";
                return createOrg("org2");
            })
            .then(function() {
                user.roles.push(constants.ROLE_SHOP);
                return api.updateUser(agent, userId, user);
            })
            .then(function(res) {
                common.checkApiNotAuthorized(res);
            });
    });

    it('should delete a user', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'andrew',
            password: 'password',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };

        return createOrg()
            .then(function() {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                return api.deleteUser(agent, res.body.result._id);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.not.have.property('password');
                res.body.result.should.not.have.property('salt');
                // logout and try to login as deleted user
                return api.signout(agent);
            })
            .then(function() {
                return api.signin(agent, {username: user.username, password: user.password});
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
            });
    });

    it('should not be able to delete a user from a different org', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'andrew',
            password: 'password',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };
        var userId;

        return createOrg()
            .then(function() {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                userId = res.body.result._id;
                return api.signout(agent);
            })
            .then(function() {
                adminCreds.username = "chris";
                return createOrg("org2");
            })
            .then(function() {
                return api.deleteUser(agent, userId);
            })
            .then(function(res) {
                common.checkApiNotAuthorized(res);
            });
    });

    it('should not be able to delete yourself', function() {
        var userId;

        return createOrg()
            .then(function(res) {
                common.checkApiSuccess(res);
                userId = res.body.result._id;
            })
            .then(function() {
                return api.deleteUser(agent, userId);
            })
            .then(function(res) {
                common.checkApiNotAuthorized(res);
            });
    });

    it('should be able to list users in an org', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'andrew',
            password: 'password',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };

        // create two orgs to ensure only one org's users are returned in the list
        return createOrg("org2")
            .then(function() {
                return api.signout(agent);
            })
            .then(function() {
                adminCreds.username = "chris";
                return createOrg();
            })
            .then(function(res) {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                shouldHaveRole(res, constants.ROLE_ENGINEER);
                // make sure we're still logged in as admin
                return checkLoggedInAsAdmin();
            })
            .then(function(res) {
                return api.listUsers(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(2);
                res.body.result[0].should.not.have.property('password');
                res.body.result[0].should.not.have.property('salt');
                res.body.result[1].should.not.have.property('password');
                res.body.result[1].should.not.have.property('salt');
            });
    });

    it('should be able to get a user', function() {
        var userId;

        return createOrg()
            .then(function(res) {
                userId = res.body.result._id;
                return api.getUser(agent, userId);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.property('_id', userId);
                res.body.result.should.not.have.property('password');
                res.body.result.should.not.have.property('salt');
            });
    });

    it('should not be able to remove admin role from only admin user', function() {
        return createOrg()
            .then(function(res) {
                res.body.result.roles = [constants.ROLE_ENGINEER];
                return api.updateUser(agent, res.body.result._id, res.body.result);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
                res.body.should.have.property('message', 'You must have at least one admin user');
            });
    });

    it('should be able to change a users password', function() {
        var user = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'andrew',
            password: 'testerpassword',
            roles: [
                constants.ROLE_ENGINEER
            ]
        };
        var passwordDetails = {
            newPassword: "password",
            verifyPassword: "password"
        };
        var userId;

        return createOrg()
            .then(function(res) {
                return api.createUser(agent, user);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                userId = res.body.result._id;
                return api.changeUserPassword(agent, userId, passwordDetails);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.not.have.property('password');
                res.body.result.should.not.have.property('salt');
                // logout and try to login as deleted user
                return api.signout(agent);
            })
            .then(function(res) {
                return api.signin(agent, {username: user.username, password: passwordDetails.newPassword});
            })
            .then(function(res) {
                common.checkApiSuccess(res);
            });
    });

    it('should not be able to change the password of the currently logged in user with the admin route', function() {
        var passwordDetails = {
            newPassword: "password",
            verifyPassword: "password"
        };
        var userId;

        return createOrg()
            .then(function(res) {
                common.checkApiSuccess(res);
                userId = res.body.result._id;
                return api.changeUserPassword(agent, userId, passwordDetails);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
            });
    });

});
