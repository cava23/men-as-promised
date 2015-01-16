(function () {

    'use strict';

    var winston = require('winston');
    var config = require('../../config/config');

    var transports = [
        new (winston.transports.Console)({
            timestamp:true,
            handleExceptions: true,
            colorize: false,
            level: config.log_level
        })
    ];

    var logger = new (winston.Logger)({
        transports: transports
    });

    var getLogger = function(serviceName) {
        var ServiceLogger = function() {

            this.debug = function() {
                if (arguments.length === 1) {
                    logger.debug(serviceName + ": " + arguments[0]);
                } else {
                    logger.debug(serviceName + ": ", arguments);
                }

            };

            this.info = function() {
                logger.info(serviceName + ": ", arguments);
            };

            this.error = function() {
                if (arguments[0] instanceof Error) {
                    logger.error(serviceName + ": ", arguments[0].message, arguments[0].name, arguments[0].type, arguments);
                } else {
                    logger.error(serviceName + ": ", arguments);
                }
            };
        };

        return new ServiceLogger();
    };

    module.exports = {
        getLogger: getLogger
    };

})();