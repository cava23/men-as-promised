'use strict';

var mongoose = require('mongoose-q')(),
    errors = require('./../util/errors'),
    _ = require('lodash'),
    Q = require('q');

var Collection = function(schema) {
    var self = this;
    self.model = mongoose.model(schema);

    function buildQuery(query, options) {
        options = options || {};

        if (options.sort) {
            query = query.sort(options.sort);
        }

        if (options.populate) {
            _.forEach(options.populate, function(populateField) {
                query = query.populate(populateField.path, populateField.field);
            });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.select) {
            query = query.select(options.select);
        }

        return query;
    }

    self.find = function(query, options) {
        return buildQuery(self.model.find(query), options).execQ()
            .catch(function(err) {
                throw new errors.BadRequestError(errors.getErrorMessage(err));
            });
    };

    self.findOne = function(query, options) {
        return buildQuery(self.model.findOne(query), options).execQ()
            .catch(function(err) {
                throw new errors.BadRequestError(errors.getErrorMessage(err));
            });
    };

    self.findById = function(id, options) {
        return buildQuery(self.model.findById(id), options).execQ()
            .then(function(object) {
                if (!object) {
                    throw new errors.NotFoundError("Object with id, " + id + ", could not be found");
                }
                return object;
            },
            function(err) {
                throw new errors.BadRequestError(errors.getErrorMessage(err));
            });
    };

    self.create = function(obj) {
        var object = new self.model(obj);
        return object.saveQ()
            .catch(function(err) {
                throw new errors.BadRequestError(errors.getErrorMessage(err));
            });
    };

    self.insert = function(objects) {
        var tasks = [];
        // convert these to models
        var documents = _.map(objects, function(object) {
            return new self.model(object);
        });

        // validate each one
        // if any are invalid, none are saved
        _.forEach(documents, function(document) {
            tasks.push(Q.promise(function(resolve, reject) {
                document.validate(function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            }));
        });

        // convert to plain objects
        var docObjects = _.map(documents, function(document) {
            return document.toObject();
        });

        return Q.all(tasks)
            .then(function() {
                return Q.ninvoke(self.model.collection, 'insert', docObjects);
            })
            .catch(function(err) {
                throw new errors.BadRequestError(errors.getErrorMessage(err));
            });
    };

    self.addToSet = function(obj, property, items) {
        try {
            _.forEach(items, function(item) {
                obj[property].addToSet(item);
            });
        } catch (e) {
            throw new errors.BadRequestError(errors.getErrorMessage(e));
        }
        return self.updateMongooseObj(obj);
    };

    self.removeFromSet = function(obj, property, items) {
        // for some reason operation.stations.pull.apply doesn't work, so just loop through
        try {
            _.forEach(items, function(item) {
                obj[property].pull(item);
            });
        } catch (e) {
            throw new errors.BadRequestError(errors.getErrorMessage(e));
        }
        return self.updateMongooseObj(obj);
    };

    self.update = function(obj, options) {
        return obj.updateQ(options)
            .then(function() {
                return self.model.findById(obj.id).execQ();
            })
            .catch(function(err) {
                throw new errors.BadRequestError(errors.getErrorMessage(err));
            });
    };

    self.updateMongooseObj = function(obj) {
        if (obj instanceof self.model) {
            return obj.saveQ()
                .catch(function(err) {
                    throw new errors.BadRequestError(errors.getErrorMessage(err));
                });
        } else {
            throw new errors.BadRequestError("obj is not an instance of " + schema);
        }
    };

    self.deleteMongooseObj = function(obj) {
        if (obj instanceof self.model) {
            return obj.removeQ()
                .catch(function(err) {
                    throw new errors.BadRequestError(errors.getErrorMessage(err));
                });
        } else {
            throw new errors.BadRequestError("obj is not an instance of " + schema);
        }
    };

    self.remove = function(query) {
        return self.model.removeQ(query)
            .catch(function(err) {
                throw new errors.BadRequestError(errors.getErrorMessage(err));
            });
    };

    self.populate = function(collections, field) {
        return self.model.populate(collections, field);
    };
};

module.exports = Collection;
