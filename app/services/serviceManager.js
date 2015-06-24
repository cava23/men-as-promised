var ServiceManager = (function () {
    var config = require('../../config/config');
    var PartService = require('./part.service');
    var StorageService = require('./storage.service');
    var OrgService = require('./org.service');
    var UserService = require('./user.service');
    var EmailService = require('./email.service');
    var MetricService = require('./metric.service');

    var partService;
    var storageService;
    var orgService;
    var userService;
    var emailService;
    var metricService;

    return {

        getPartService: function() {
            if (!partService) {
                partService = new PartService(this);
            }
            return partService;
        },

        getStorageService: function() {
            if (!storageService) {
                storageService = new StorageService(this);
            }
            return storageService;
        },

        getOrgService: function() {
            if (!orgService) {
                orgService = new OrgService(this);
            }
            return orgService;
        },

        getUserService: function() {
            if (!userService) {
                userService = new UserService(this);
            }
            return userService;
        },

        getEmailService: function() {
            if (!emailService) {
                emailService = new EmailService(this);
            }
            return emailService;
        },

        getMetricService: function() {
            if (!metricService) {
                metricService = new MetricService(this);
            }
            return metricService;
        }

    };
})();

module.exports = ServiceManager;
