var should = require('should');
var mongoose = require('mongoose-q')();
var Org = mongoose.model('Org');
var User = mongoose.model('User');
var Part = mongoose.model('Part');
var _ = require('lodash');
var api = require('./api-utils');

var testOrgName = 'testOrg';

function cleanDb() {
    return User.remove().execQ()
        .then(function() {
            return Part.remove().execQ();
        })
        .then(function() {
            return Org.remove().execQ();
        });
}

function checkApiSuccess(res) {
    res.statusCode.should.be.eql(200);
    res.body.should.be.json;
    res.body.result.should.be.ok;
    if (_.isArray(res.body.result)) {
        res.body.should.have.property('count', res.body.result.length);
    }
}

function checkApiNotLoggedIn(res) {
    res.body.should.have.property('statusCode', 401);
    res.statusCode.should.be.eql(401);
    (res.body.message).should.match('User is not logged in');
}

function checkApiNotAuthorized(res) {
    res.body.should.have.property('statusCode', 403);
    res.statusCode.should.be.eql(403);
}

function checkApiBadRequest(res) {
    res.body.should.have.property('statusCode', 400);
    res.statusCode.should.be.eql(400);
}

function checkApiNotFound(res) {
    res.body.should.have.property('statusCode', 404);
    res.statusCode.should.be.eql(404);
}

function checkModelValidationError(err) {
    err.should.have.property('name', 'ValidationError');
}

function createTestOrg(agent, credentials, orgName) {
    // Create a new user
    var data = {
        firstName: 'Full',
        lastName: 'Name',
        email: 'test@test.com',
        orgName: orgName || testOrgName,
        adminUsername: credentials.username,
        adminPassword: credentials.password
    };

    return api.signup(agent, data)
        .then(function(res) {
            res.should.have.property('statusCode', 200);
            return logout(agent);
        });
}

function logout(agent) {
    return api.signout(agent);
}

function login(agent, credentials) {
    return api.signin(agent, credentials)
        .then(function(res) {
            checkApiSuccess(res);
            return res;
        });
}

module.exports = {
    cleanDb: cleanDb,
    checkApiSuccess: checkApiSuccess,
    checkApiNotLoggedIn: checkApiNotLoggedIn,
    checkApiNotAuthorized: checkApiNotAuthorized,
    checkApiBadRequest: checkApiBadRequest,
    checkApiNotFound: checkApiNotFound,
    checkModelValidationError: checkModelValidationError,
    createTestOrg: createTestOrg,
    login: login,
    logout: logout,
    orgName: testOrgName
};