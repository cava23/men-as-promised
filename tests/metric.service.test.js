'use strict';

var should = require('should');
var MetricService = require('../app/services/metric.service');

// Unskip after adding AWS config to config/env/test.js
describe.skip('Metric Service', function() {
    var metricService = new MetricService();

    it('should send custom metric', function() {
        return metricService.putMetricData('test', 0, 'None');
    });

});