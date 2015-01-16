var _ = require('lodash');
var errors = require('./errors');

/**
 * Org-scoped authorization middleware helper
 */
exports.hasAuthorization = function(getter, req) {
    return getter()
        .then(function(entity) {
            if ((entity.org.toString() !== req.user.org.toString()) && !req.user.isSystemAdmin()) {
                throw new errors.NotAuthorizedError();
            }
        });
};