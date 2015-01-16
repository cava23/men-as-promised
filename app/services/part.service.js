'use strict';

var mongo = require('./../services/mongo.service');
var _ = require('lodash');
var config = require('../../config/config');
var errors = require('../util/errors');

var PartService = (function() {

    function PartService(serviceManager) {
        this.serviceManager = serviceManager;
        this.dbPart = new mongo('Part');
    }

    PartService.prototype.addPart = function (part) {
        var self = this;
        return self.dbPart.create(part);
    };

    PartService.prototype.updatePart = function(partId, update) {
        var self = this;

        delete update.org;

        return self.getPart(partId)
            .then(function(part) {
                update = _.extend(part, update);
                return self.dbPart.updateMongooseObj(update);
            });
    };

    PartService.prototype.getPart = function(id) {
        return this.dbPart.findById(id);
    };

    PartService.prototype.getParts = function(query) {
        return this.dbPart.find(query);
    };

    PartService.prototype.deletePart = function(partId) {
        var self = this;
        var partToDelete;
        return self.getPart(partId)
            .then(function(part) {
                return self.dbPart.deleteMongooseObj(part);
            });
    };

    return PartService;

})();

module.exports = PartService;