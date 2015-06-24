'use strict';

var aws = require('aws-sdk');
var config = require('../../config/config');
var errors = require('../util/errors');
var Q = require('q');
var knox = require('knox');

var StorageService = (function() {

    function StorageService(serviceManager) {
        aws.config.update({accessKeyId: config.aws['access-key-id'], secretAccessKey: config.aws['secret-access-key']});
        this.s3 = new aws.S3();
        this.client = knox.createClient({
                key: config.aws['access-key-id'],
                secret: config.aws['secret-access-key'],
                bucket: config.aws['files-bucket']
        });
    }

    function parseUrl(url) {
        var parts = {
            bucket: '',
            key: ''
        };
        var regex = /^https?:\/\/([a-zA-Z0-9\-_]+)\.s3\.amazonaws\.com\/(.+)$/;
        var match = regex.exec(url);
        if (!match || match.length < 3) {
            return undefined;
        }

        parts.bucket = match[1];
        parts.key = match[2];

        if (parts.bucket != config.aws['files-bucket']) {
            throw new errors.BadRequestError("Invalid S3 key, wrong bucket");
        }

        return parts;
    }

    function makeKey(key) {
        if (key.indexOf('http') === 0) {
            var parts = parseUrl(key);
            if (parts) {
                return parts.key;
            }
        }

        return key;
    }

    StorageService.prototype.putStream = function(stream, fileName, headers) {
        var defer = Q.defer();

        this.client.putStream(stream, fileName, headers, function(err, data){
            if(err){
                defer.reject(err);
            } else {
                defer.resolve(data.statusCode);
            }
        });

        return defer.promise.timeout(config.aws.timeout);
    };

    StorageService.prototype.deleteFile = function (key) {
        key = makeKey(key);

        var defer = Q.defer();
        var s3_params = {
            Bucket: config.aws['files-bucket'],
            Key: key
        };

        this.s3.deleteObject(s3_params, function(err, data){
            if(err){
                defer.reject(err);
            } else {
                defer.resolve(data);
            }
        });

        return defer.promise.timeout(config.aws.timeout);
    };

    StorageService.prototype.getFileStream = function (key) {
        key = makeKey(key);

        var s3_params = {
            Bucket: config.aws['files-bucket'],
            Key: key
        };

        return this.s3.getObject(s3_params).createReadStream();
    };

    StorageService.prototype.getFileMetadata = function (key) {
        key = makeKey(key);

        var defer = Q.defer();
        var s3_params = {
            Bucket: config.aws['files-bucket'],
            Key: key
        };

        this.s3.headObject(s3_params, function(err, data){
            if(err){
                defer.reject(err);
            } else {
                defer.resolve(data);
            }
        });

        return defer.promise.timeout(config.aws.timeout);
    };

    return StorageService;

})();

module.exports = StorageService;
