
var storageService = require('../app/services/storage.service');
var fs = require('fs');
var assert = require('assert');
var common = require('./common');
var http = require('http');
var jsonFixture = __dirname + '/fixtures/testFile.json';

// Unskip these tests after adding AWS config to config/env/test.js file
describe.skip('storage service', function() {
    var service;
    before(function() {
        service = new storageService();
    });

    it('should be able to stream to s3 from a file', function(done) {
        this.timeout(60000);
        fs.stat(jsonFixture, function (err, stat) {


            var headers = {
                'Content-Length': stat.size,
                'Content-Type': 'application/json'
            };

            var fileStream = fs.createReadStream(jsonFixture);
            return service.putStream(fileStream, '/test/user.json', headers)
                .then(function() {
                    return common.getS3TestFile('test/user.json');
                })
                .then(function() {
                    done();
                })
                .catch(function(err) {
                    console.log(err);
                    done(err);
                });
        });
    });

    it('should be able to stream to s3 from an http stream', function(done) {
        this.timeout(60000);
        http.get({ host: 'google.com', path: '/' }, function (res) {
            var headers = {
                'Content-Length': res.headers['content-length']
                , 'Content-Type': res.headers['content-type']
            };
            return service.putStream(res, '/google', headers)
                .then(function(res) {
                    assert.equal(res, 200);
                    return common.getS3TestFile('google');
                })
                .then(function() {
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });
    })
});
