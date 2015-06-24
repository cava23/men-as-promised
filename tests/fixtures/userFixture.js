

function buildUser(firstName, lastName, username, password, email, org) {
    return {
        firstName: firstName || 'User',
        lastName: lastName || 'Name',
        username: username || 'username',
        password: password || 'password',
        displayName: firstName || 'User' + ' ' + lastName || 'Name',
        email: email || 'email@email.com',
        org: org || 'org-id'
    };
}

module.exports = {
    buildUser: buildUser
};