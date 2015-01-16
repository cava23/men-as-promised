'use strict';

/**
 * Module dependencies.
 */
exports.healthCheck = function(req, res) {
    res.json({
        ok: true
    });
};