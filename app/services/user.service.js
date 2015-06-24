'use strict';

var db = require('./../services/db.service');
var _ = require('lodash');
var errors = require('../util/errors');
var constants = require('../../config/constants');

var UserService = (function() {

    function UserService(serviceManager) {
        this.serviceManager = serviceManager;
        this.dbUser = new db('User');
    }

    UserService.prototype.getUser = function (id) {
        return this.dbUser.findById(id, { select: "-password -salt" });
    };

    UserService.prototype.getUsers = function(query) {
        return this.dbUser.find(query, { select: "-password -salt" });
    };

    UserService.prototype.createUser = function (user) {
        var self = this;
        user.provider = 'local';
        user.displayName = user.firstName + ' ' + user.lastName;

        return self.dbUser.create(user)
            .then(function(user) {
                delete user._doc.password;
                delete user._doc.salt;
                return user;
            });
    };

    UserService.prototype.changePassword = function(userId, passwordDetails) {
        var self = this;
        if (passwordDetails.newPassword) {
            return this.dbUser.findById(userId)
                .then(function(user) {
                    if (!passwordDetails.currentPassword || user.authenticate(passwordDetails.currentPassword)) {
                        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                            user.password = passwordDetails.newPassword;

                            return self.updateUser(userId, user);
                        } else {
                            throw new errors.BadRequestError('Passwords do not match');
                        }
                    } else {
                        throw new errors.BadRequestError('Current password is incorrect');
                    }
                });
        } else {
            throw new errors.BadRequestError('Please provide a new password');
        }
    };

    UserService.prototype.updateUser = function (id, update) {
        var self = this;

        delete update.org;
        delete update.provider;

        return self.getUser(id)
            .then(function(user) {
                if (user.roles.indexOf(constants.ROLE_ORG_ADMIN) > -1 && update.roles && update.roles.indexOf(constants.ROLE_ORG_ADMIN) === -1) {
                    // if the update removes the admin role, make sure another admin exists
                    return self.dbUser.find({org: user.org, roles: {$in: [constants.ROLE_ORG_ADMIN]}})
                        .then(function (results) {
                            if (results && results.length < 2) {
                                throw new errors.BadRequestError("You must have at least one admin user");
                            }
                            return user;
                        });
                }
                return user;
            })
            .then(function(user) {
                update = _.extend(user, update);
                update.displayName = update.firstName + ' ' + update.lastName;
                return self.dbUser.updateMongooseObj(update);
            })
            .then(function(user) {
                delete user._doc.password;
                delete user._doc.salt;
                return user;
            });
    };

    UserService.prototype.deleteUser = function (id) {
        var self = this;
        return self.getUser(id)
            .then(function(user) {
                return self.dbUser.deleteMongooseObj(user);
            })
            .then(function(user) {
                delete user._doc.password;
                delete user._doc.salt;
                return user;
            });
    };

    return UserService;

})();

module.exports = UserService;