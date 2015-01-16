'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.controller.js'),
	parts = require('../controllers/parts.controller.js');

module.exports = function(app) {
    var users = require('../controllers/users.controller.js');
    var prefix = '/api/v1/parts';

	// Part Routes
    app.all(prefix + '/:partId', parts.isOrgScoped);
    app.all(prefix + '/:partId/*', parts.isOrgScoped);

	app.route(prefix)
		.get(parts.list)
		.post(parts.create);

	app.route(prefix + '/:partId')
		.get(parts.read)
		.put(parts.update)
		.delete(parts.delete);

};