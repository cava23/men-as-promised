'use strict';

var aws = require('aws-sdk');
var config = require('../../config/config');
var errors = require('../util/errors');
var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var swig  = require('swig');
var Q = require('q');
var log = require('../util/logs').getLogger('Email Service');

var EmailService = (function() {

    function EmailService(serviceManager) {
        aws.config.update({accessKeyId: config.aws['access-key-id'], secretAccessKey: config.aws['secret-access-key']});
        // compile templates
        this.templates = {};
        this.templates.orgCreation = swig.compileFile('./app/templates/org-creation-email.html');
        this.templates.feedback = swig.compileFile('./app/templates/feedback.html');
        this.transport = nodemailer.createTransport(sesTransport({
            accessKeyId: config.mailer.options.auth.accessKeyId,
            secretAccessKey: config.mailer.options.auth.secretAccessKey,
            rateLimit: 5
        }));
    }

    EmailService.prototype.sendOrgCreationNotice = function(orgName, user) {
        log.info("Sending org creation notice for new org, " + orgName + ", to " + config.mailer.exampleTeam);
        var html = this.templates.orgCreation({
            orgName: orgName,
            displayName: user.displayName,
            email: user.email,
            appName: config.app.title
        });

        var mailOptions = {
            to: config.mailer.exampleTeam,
            from: config.mailer.from,
            subject: 'Org Creation Notice',
            html: html
        };

        var defer = Q.defer();

        this.transport.sendMail(mailOptions, function(err) {
            if (!err) {
                defer.resolve(null);
            } else {
                defer.reject(err);
            }
        });

        return defer.promise;
    };

    EmailService.prototype.sendFeedback = function(fromUser, message) {
        var html = this.templates.feedback({
            displayName: fromUser.displayName,
            username: fromUser.username,
            org: fromUser.org.toString(),
            message: message,
            appName: config.app.title
        });

        var mailOptions = {
            to: config.mailer.exampleTeam,
            from: config.mailer.from,
            subject: 'My Enterprise App Feedback',
            html: html
        };

        var defer = Q.defer();

        this.transport.sendMail(mailOptions, function(err) {
            if (!err) {
                defer.resolve(null);
            } else {
                defer.reject(err);
            }
        });

        return defer.promise;
    };

    return EmailService;

})();

module.exports = EmailService;