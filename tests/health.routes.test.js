'use strict';

var should = require('should'),
    request = require('supertest-as-promised'),
    app = require('../server'),
    agent = request.agent(app),
    api = require('./api-utils');

describe('Health Check', function() {
    it('should return health check', function() {
        return api.getHealthCheck(agent)
            .then(function(res) {
                res.body.should.have.property("ok", true);
            });
    });
});