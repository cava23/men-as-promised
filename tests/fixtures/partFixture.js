var mongoose = require('mongoose-q')(),
    Part = mongoose.model('Part');

function buildPart(orgId, options) {
    options = options || {};
    return Part.create({
    title: options.title || 'SomePartTitle',
    org: orgId
  });
}

function createPart(orgId, options) {
    return Part.create(buildPart(orgId, options));
}


module.exports = {
    buildPart: buildPart,
    createPart: createPart
};
