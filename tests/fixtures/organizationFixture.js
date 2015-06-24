var mongoose = require('mongoose-q')(),
    Org = mongoose.model('Org');

function buildOrg(orgName, options) {
    options = options || {};
    return {
        firstName: 'Full',
        lastName: 'Name',
        email: 'test@test.com',
        orgName: orgName || 'testOrg',
        adminUsername: options.username,
        adminPassword: options.password,
        phoneNumber: '3192360132',
        address: '1619 Oriole Ave.',
        city: 'Chicago',
        state: 'Arizona',
        zip: '46532'
    };
}

function createOrg(orgName, options) {
    return Org.create(buildOrg(orgName, options));
}

module.exports = {
    buildOrg: buildOrg,
    createOrg: createOrg
};