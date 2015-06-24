var _ = require('lodash');
var errors = require('./errors');
var config = require('../../config/config');

/**
 * Org-scoped authorization middleware helper
 */
exports.hasAuthorization = function(getter, req) {
    return getter()
        .then(function(entity) {
            if ((req.user.org && (entity.org.toString() !== req.user.org.toString())) || (!req.user.org && !req.user.isSystemAdmin())) {
                throw new errors.NotAuthorizedError();
            }
        });
};

exports.getListOptions = function(req) {
    var options = {};

    // Sorting
    if (req.query.sortBy) {
        if (req.query.sortOrder === "asc") {
            options.sort = req.query.sortBy;
        } else {
            // descending order
            options.sort = "-" + req.query.sortBy;
        }
        delete req.query.sortBy;
        delete req.query.sortOrder;
    }

    // Limiting
    options.limit = req.query.limit;
    delete req.query.limit;

    // Populate
    if (req.query.populate) {
        options.populate = [];
        var fieldsToPopulate = req.query.populate.split(',');
        _.forEach(fieldsToPopulate, function(field) {
            options.populate.push({path: field});
        });
        delete req.query.populate;
    }

    return options;
};

exports.throwIfMissingProperty = function(req, property) {
    if (!req.body || !req.body[property]) {
        throw new errors.BadRequestError("Missing required property '" + property + "'");
    }
};

exports.registerDocumentedRoute = function(swagger, spec, callback) {
    swagger['add' + spec.method]({spec:spec, action:callback});
};
