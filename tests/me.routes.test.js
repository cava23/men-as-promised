'use strict';

var should = require('should'),
    request = require('supertest-as-promised'),
    app = require('../server'),
    common = require('./common'),
    agent = request.agent(app),
    api = require('./api-utils');

var userCreds = {
    username: 'myName',
    password: 'password'
};

describe('Currently logged in user routes', function() {
    before(function() {
        return common.createTestOrg(agent, userCreds);
    });

    after(function() {
        return common.cleanDb();
    });

    it('should return info about the currently logged in user', function() {
        return common.login(agent, userCreds)
            .then(function() {
                return api.getCurrentUser(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.not.have.property('password');
                res.body.result.should.have.property('username');
                res.body.result.should.have.property('firstName');
                res.body.result.should.have.property('lastName');
                res.body.result.should.have.property('email');
                res.body.result.should.have.property('displayName');
            });
    });

    it('should update currently logged in user', function() {
        var update = {
            email: 'supertest@test.com',
            firstName: 'Test',
            lastName: 'Mr.'
        };
        return common.login(agent, userCreds)
            .then(function() {
                return api.updateCurrentUser(agent, update);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.not.have.property('password');
                res.body.result.should.have.property('username');
                res.body.result.should.have.property('firstName', update.firstName);
                res.body.result.should.have.property('lastName', update.lastName);
                res.body.result.should.have.property('email', update.email);
                res.body.result.should.have.property('displayName');
            });
    });

    it('should not be able to update password or username', function() {
        var update = {
            password: 'new_password',
            username: 'new_username'
        };
        return common.login(agent, userCreds)
            .then(function() {
                return api.updateCurrentUser(agent, update);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.property('username', userCreds.username);
                return common.logout(agent);
            })
            .then(function() {
                return common.login(agent, userCreds)
            });
    });

    it('should be able to change password', function() {
        var passwordDetails = {
            currentPassword: userCreds.password,
            newPassword: 'test1234',
            verifyPassword: 'test1234'
        };

        return common.login(agent, userCreds)
            .then(function() {
                return api.changePasswordCurrentUser(agent, passwordDetails);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.property('username', userCreds.username);
                return common.logout(agent);
            })
            .then(function() {
                userCreds.password = passwordDetails.newPassword;
                return common.login(agent, userCreds)
            })
            .then(function(res) {
                common.checkApiSuccess(res);
            });
    });

    it('should not be able to change password without supplying current password', function() {
        var passwordDetails = {
            newPassword: 'test1234',
            verifyPassword: 'test1234'
        };

        return common.login(agent, userCreds)
            .then(function() {
                return api.changePasswordCurrentUser(agent, passwordDetails);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
            });
    });

    it('should return bad request if current password is incorrect', function() {
        var passwordDetails = {
            currentPassword: 'notmypassword',
            newPassword: 'test1234',
            verifyPassword: 'test1234'
        };

        return common.login(agent, userCreds)
            .then(function() {
                return api.changePasswordCurrentUser(agent, passwordDetails);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
            });
    });

    it('should return bad request if passwords do not match', function() {
        var passwordDetails = {
            currentPassword: userCreds.password,
            newPassword: 'test1234',
            verifyPassword: 'test4321'
        };

        return common.login(agent, userCreds)
            .then(function() {
                return api.changePasswordCurrentUser(agent, passwordDetails);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
            });
    });

    it('should not be able to change password if not logged in', function() {
        var passwordDetails = {
            currentPassword: userCreds.password,
            newPassword: 'test1234',
            verifyPassword: 'test1234'
        };

        return common.logout(agent)
            .then(function() {
                return api.changePasswordCurrentUser(agent, passwordDetails);
            })
            .then(function(res) {
                common.checkApiNotLoggedIn(res);
            });
    });

    it('should return bad request if new password is too short', function() {
        var passwordDetails = {
            currentPassword: userCreds.password,
            newPassword: 'test',
            verifyPassword: 'test'
        };

        return common.login(agent, userCreds)
            .then(function() {
                return api.changePasswordCurrentUser(agent, passwordDetails);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
            });
    });

    it('should return bad request if new password is not provided', function() {
        var passwordDetails = {
            currentPassword: userCreds.password
        };

        return common.login(agent, userCreds)
            .then(function() {
                return api.changePasswordCurrentUser(agent, passwordDetails);
            })
            .then(function(res) {
                common.checkApiBadRequest(res);
            });
    });
});