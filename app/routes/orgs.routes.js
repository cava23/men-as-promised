'use strict';

var util = require('./../util/route.utils.js');
var constants = require('../../config/constants');

module.exports = function(app) {
    var orgs = require('../controllers/orgs.controller.js');
    var users = require('../controllers/users.controller.js');

    var prefix = '/api/v1/orgs';

    app.route(prefix)
        .get(users.requiresRoles(constants.ROLE_SYSTEM_ADMIN), orgs.list);
};