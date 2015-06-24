var should = require('should');
var mongoose = require('mongoose-q')();
var path = require('path');
var Org = mongoose.model('Org');
var User = mongoose.model('User');
var Part = mongoose.model('Part');
var _ = require('lodash');
var config = require('../config/config');
var Q = require('q');
var aws = require('aws-sdk');
var api = require('./api-utils');
var orgFixtures = require('./fixtures/organizationFixture');

aws.config.update({accessKeyId: config.aws['access-key-id'], secretAccessKey: config.aws['secret-access-key']});

var testOrgName = 'testOrg';

function cleanDb() {
    console.log('\nCleaning database');
    var db = mongoose.connection;
    var tasks = [];
    _.forOwn(db.collections, function(collection) {
        var defer = Q.defer();
        collection.remove(function(err) {
            if (err) defer.reject(err);
            defer.resolve(null);
        });
        tasks.push(defer.promise);
    });
    return Q.allSettled(tasks);
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
    var data = orgFixtures.buildOrg(orgName || testOrgName, credentials);
    var orgId;

    return api.signup(agent, data)
        .then(function(res) {
            res.should.have.property('statusCode', 200);
            orgId = res.body.result.org;
            return logout(agent);
        })
        .then(function() {
            return orgId;
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

function getDataFilePath(filename) {
    return path.join(__dirname, 'data-files', filename);
}

function putS3TestFile(contentType, location) {
    var s3 = new aws.S3();
    var defer = Q.defer();
    var key = "parts/images/test" || location;
    var params = {
        Bucket: config.aws['files-bucket'],
        Key: key,
        Body: "some stuff",
        ContentType: contentType
    };

    s3.putObject(params, function(err, data) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve('https://' + config.aws['files-bucket'] + '.s3.amazonaws.com/' + key);
        }
    });

    return defer.promise;
}

function getS3TestFile(path) {
    var s3 = new aws.S3();
    var defer = Q.defer();
    var key = "parts/images/test";
    var params = {
        Bucket: config.aws['files-bucket'],
        Key: path || key
    };

    s3.getObject(params, function(err, data) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(data);
        }
    });

    return defer.promise;
}

function deleteS3TestFile(path) {
    var s3 = new aws.S3();
    var defer = Q.defer();
    var key = "parts/images/test";
    var params = {
        Bucket: config.aws['files-bucket'],
        Key: path || key
    };

    s3.deleteObject(params, function(err, data) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(data);
        }
    });

    return defer.promise;
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
    getDataFilePath: getDataFilePath,
    getS3TestFile: getS3TestFile,
    putS3TestFile: putS3TestFile,
    deleteS3TestFile: deleteS3TestFile,
    testBucket: config.aws['files-bucket'],
    orgName: testOrgName
};
