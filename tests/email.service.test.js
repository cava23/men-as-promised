'use strict';

var should = require('should');
var proxyquire =  require('proxyquire');
var userFixture = require('./fixtures/userFixture');

var nodemailerMock = {};

// Unskip these tests after adding SES config to config/env/test.js file
describe.skip('Email Service', function() {

    it('should send org creation notice', function() {
        nodemailerMock.createTransport = function() {
            return {
                sendMail: function(options, callback) {
                    options.should.have.property('html').ok;
                    should(options.html.indexOf('myorg')).be.greaterThan(-1);
                    should(options.html.indexOf('User Name')).be.greaterThan(-1);
                    should(options.html.indexOf('bing@gmail.com')).be.greaterThan(-1);
                    callback();
                }
            }
        };
        var EmailService = proxyquire('../app/services/email.service', { 'nodemailer': nodemailerMock });
        var emailService = new EmailService(undefined);
        return emailService.sendOrgCreationNotice('myorg', {displayName:'User Name', email: 'bing@gmail.com'});
    });

    it('should send feedback', function() {
        var user = userFixture.buildUser();
        var message = 'test message';
        nodemailerMock.createTransport = function() {
            return {
                sendMail: function(options, callback) {
                    options.should.have.property('html').ok;
                    should(options.html.indexOf(user.org)).be.greaterThan(-1);
                    should(options.html.indexOf(user.displayName)).be.greaterThan(-1);
                    should(options.html.indexOf(user.username)).be.greaterThan(-1);
                    should(options.html.indexOf(message)).be.greaterThan(-1);
                    callback();
                }
            }
        };
        var EmailService = proxyquire('../app/services/email.service', { 'nodemailer': nodemailerMock });
        var emailService = new EmailService(undefined);

        return emailService.sendFeedback(user, message);
    });

});