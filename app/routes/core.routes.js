'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../controllers/core.controller.js');
    var users = require('../controllers/users.controller.js');

    app.all("/api/*", users.requiresLogin);
	app.route('/health/check').get(core.healthCheck);
};