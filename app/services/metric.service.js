'use strict';

var aws = require('aws-sdk');
var config = require('../../config/config');
var errors = require('../util/errors');
var Q = require('q');

var MetricService = (function() {

    function MetricService(serviceManager) {
        aws.config.update({accessKeyId: config.aws['access-key-id'], secretAccessKey: config.aws['secret-access-key'], region: config.aws.region});
        this.cloudWatch = new aws.CloudWatch();
    }

    MetricService.prototype.putMetricData = function(metricName, value, units) {
        var defer = Q.defer();

        var params = {
            MetricData: [ /* required */
                {
                    MetricName: metricName,
                    Dimensions: [],
                    Timestamp: (new Date()).toISOString(),
                    Unit: units,
                    Value: value
                }
            ],
            Namespace: 'example-api-' + process.env.NODE_ENV
        };

        this.cloudWatch.putMetricData(params, function(err, data){
            if(err){
                defer.reject(err);
            } else {
                defer.resolve(data.statusCode);
            }
        });

        return defer.promise.timeout(config.aws.timeout);
    };

    return MetricService;

})();

module.exports = MetricService;
