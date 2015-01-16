'use strict';

var should = require('should'),
    assert = require('assert'),
	request = require('supertest-as-promised'),
	app = require('../server'),
    mongoose = require('mongoose-q')(),
	User = mongoose.model('User'),
	Part = mongoose.model('Part'),
    common = require('./common'),
	agent = request.agent(app),
    qagent = require("agent-q"),
    api = require('./api-utils');


/**
 * Globals
 */
var part;
var part1;

var userCreds = {
    username: 'myName',
    password: 'password'
};

var user1Creds = {
    username: 'myOtherName',
    password: 'password'
};

/**
 * Part routes tests
 */
describe('Part CRUD tests', function() {

    beforeEach(function () {
        part = {
            title: 'Part Title',
            description: 'Part Description'
        };

        part1 = {
            title: 'Part 1 Title',
            description: 'Part 1 Description'
        };

        // Save a user to the test db and create new part
        return common.createTestOrg(agent, userCreds)
            .then(function (newUser) {
                return common.createTestOrg(agent, user1Creds, "org2");
            });
    });

    afterEach(function () {
        return common.cleanDb();
    });

    it('should be able to save a part if signed in', function () {
        var org;
        return common.login(agent, userCreds)
            .then(function (res) {
                org = res.body.result.org;
                // Save a new part
                return api.createPart(agent, part);
            })
            .then(function (res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.property('title', part.title);

                // Get a list of parts
                return qagent.end(agent.get('/api/v1/parts'));
            })
            .then(function (res) {
                common.checkApiSuccess(res);

                // Get parts list
                var parts = res.body.result;

                // Set assertions
                (parts[0].org).should.equal(org);
                (parts[0].title).should.match('Part Title');
            });
    });

    it('should not be able to save a part if not signed in', function () {
        return api.createPart(agent, part)
            .then(function (res) {
                // Call the assertion callback
                common.checkApiNotLoggedIn(res);
            });
    });

    it('should not be able to save a part if no title is provided', function () {
        // Invalidate title field
        part.title = '';

        return common.login(agent, userCreds)
            .then(function () {
                // Save a new part
                return api.createPart(agent, part);
            })
            .then(function (res) {
                // Set message assertion
                (res.body.message).should.match('Title cannot be blank');
                common.checkApiBadRequest(res);
            });
    });

    it('should not be able to get a part for a different user', function () {
        var partId;

        return common.login(agent, userCreds)
            .then(function () {
                // Save a new part
                return api.createPart(agent, part);
            })
            .then(function(res) {
                partId = res.body.result._id;
                return common.logout(agent);
            })
            .then(function() {
                return common.login(agent, user1Creds);
            })
            .then(function() {
                return api.getPart(agent, partId);
            })
            .then(function (res) {
                common.checkApiNotAuthorized(res);
            });
    });

    it('should be able to update a part if signed in', function () {
        var partId;

        return common.login(agent, userCreds)
            .then(function () {
                // Save a new part
                return api.createPart(agent, part);
            })
            .then(function (res) {
                common.checkApiSuccess(res);
                partId = res.body.result._id;

                // Update part title
                part.title = 'WHY YOU GOTTA BE SO MEAN?';

                // Update an existing part
                return api.updatePart(agent, partId, part);
            })
            .then(function (res) {
                common.checkApiSuccess(res);

                // Set assertions
                (res.body.result._id).should.equal(partId);
                (res.body.result.title).should.match('WHY YOU GOTTA BE SO MEAN?');
            })
    });

    it('should not be able to get a list of parts if not signed in', function () {
        // Create new part model instance
        var partObj = new Part(part);

        // Save the part
        return partObj.saveQ()
            .then(function () {
                // Request parts
                return api.listParts(agent);
            })
            .then(function (res) {
                common.checkApiNotLoggedIn(res);
            });
    });

    it('should be able to get a list of parts', function () {
        var orgId;
        // Create parts for different users to ensure only the currently logged in user's parts are returned
        return common.login(agent, user1Creds)
            .then(function() {
                return api.createPart(agent, part1);
            })
            .then(function() {
                return common.logout(agent);
            })
            .then(function() {
                return common.login(agent, userCreds);
            })
            .then(function(res) {
                orgId = res.body.result.org;
                return api.createPart(agent, part);
            })
            .then(function () {
                // Request parts
                return api.listParts(agent);
            })
            .then(function (res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(1);
                res.body.result[0].should.have.property('org', orgId);
            });
    });

    it('should not be able to get a single part if not signed in', function () {
        // Create new part model instance
        var partObj = new Part(part);

        // Save the part
        return partObj.saveQ()
            .then(function () {
                return api.getPart(agent, partObj._id);
            })
            .then(function (res) {
                common.checkApiNotLoggedIn(res);
            });
    });

    it('should be able to get a single part if signed in', function () {
        var partId;

        return common.login(agent, userCreds)
            .then(function () {
                // Save a new part
                return api.createPart(agent, part);
            })
            .then(function (res) {
                common.checkApiSuccess(res);
                partId = res.body.result._id;
                return api.getPart(agent, partId);
            })
            .then(function (res) {
                common.checkApiSuccess(res);
            });
    });

    it('should be able to delete a part if signed in', function () {
        var partId;

        return common.login(agent, userCreds)
            .then(function () {
                // Save a new part
                return api.createPart(agent, part);
            })
            .then(function (res) {
                common.checkApiSuccess(res);
                partId = res.body.result._id;

                // Delete an existing part
                return api.deletePart(agent, partId);
            })
            .then(function (res) {
                common.checkApiSuccess(res);
                (res.body.result._id).should.equal(partId);
            });
    });

    it('should not be able to delete a part if not signed in', function () {
        // Set part user
        part.user = '5499f92ebb67cd7813435345';

        // Create new part model instance
        var partObj = new Part(part);

        // Save the part
        return partObj.saveQ()
            .then(function () {
                // Try deleting part
                return api.deletePart(agent, partObj._id);
            })
            .then(function (res) {
                // Set message assertion
                common.checkApiNotLoggedIn(res);
            });
    });

    it('should return 404 if partID does not exist', function () {
        return common.login(agent, userCreds)
            .then(function () {
                return api.getPart(agent, "546fd680db9d7f00006d7e66");
            })
            .then(function (res) {
                common.checkApiNotFound(res);
            });
    });

    it('should return 400 if partID is not valid', function() {
        return common.login(agent, userCreds)
            .then(function () {
                return api.getPart(agent, "hello");
            })
            .then(function (res) {
                common.checkApiBadRequest(res);
            });
    });

    it('should list all parts for all orgs if system-admin', function() {
        var adminInfo = {
            "firstName":"System",
            "lastName":"Admin",
            "email":"no-reply@yourdomain.com",
            "username":"checkItOut",
            "password":"test1234",
            provider: 'local',
            "roles":["user","system-admin"]
        };
        var admin = new User(adminInfo);

        return common.login(agent, userCreds)
            .then(function () {
                // Save a new part
                return api.createPart(agent, part);
            })
            .then(function(res) {
                return common.logout(agent);
            })
            .then(function() {
                return admin.saveQ();
            })
            .then(function() {
                // log in as system-admin
                return common.login(agent, adminInfo);
            })
            .then(function() {
                return api.listParts(agent);
            })
            .then(function(res) {
                common.checkApiSuccess(res);
                res.body.result.should.have.length(1);
            });
    });

});
