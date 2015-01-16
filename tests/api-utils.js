var qagent = require("agent-q");

// Orgs
function listOrgs(agent) {
    return qagent.end(agent.get('/api/v1/orgs'));
}

// Users
function signup(agent, data) {
    return qagent.end(agent
        .post('/auth/signup')
        .send(data));
}

function signin(agent, data) {
    return qagent.end(agent
        .post('/auth/signin')
        .send(data));
}

function signout(agent) {
    return qagent.end(agent.get('/auth/signout'));
}

function getUser(agent, userId) {
    return qagent.end(agent.get('/api/v1/users/' + userId));
}

function listUsers(agent) {
    return qagent.end(agent.get('/api/v1/users'));
}

function createUser(agent, data) {
    return qagent.end(agent
        .post('/api/v1/users')
        .send(data));
}

function updateUser(agent, userId, data) {
    return qagent.end(agent
        .put('/api/v1/users/' + userId)
        .send(data));
}

function deleteUser(agent, userId) {
    return qagent.end(agent
        .delete('/api/v1/users/' + userId));
}

function changeUserPassword(agent, userId, passwordDetails) {
    return qagent.end(agent
        .post('/api/v1/users/' + userId + '/password')
        .send(passwordDetails));
}

function getCurrentUser(agent) {
    return qagent.end(agent.get('/api/v1/me'));
}

function updateCurrentUser(agent, data) {
    return qagent.end(agent
        .put('/api/v1/me')
        .send(data));
}

function changePasswordCurrentUser(agent, passwordDetails) {
    return qagent.end(agent
        .post('/api/v1/me/password')
        .send(passwordDetails));
}

// Parts
function listParts(agent) {
    return qagent.end(agent.get('/api/v1/parts'));
}

function createPart(agent, part) {
    return qagent.end(agent
        .post('/api/v1/parts')
        .send(part));
}

function getPart(agent, partId) {
    return qagent.end(agent.get('/api/v1/parts/' + partId));
}

function updatePart(agent, partId, data) {
    return qagent.end(agent
        .put('/api/v1/parts/' + partId)
        .send(data));
}

function deletePart(agent, partId) {
    return qagent.end(agent
        .delete('/api/v1/parts/' + partId));
}


// Health Check
function getHealthCheck(agent) {
    return qagent.end(agent.get('/health/check'));
}

module.exports = {
    listOrgs: listOrgs,
    signup: signup,
    signin: signin,
    signout: signout,
    getUser: getUser,
    listUsers: listUsers,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    changeUserPassword: changeUserPassword,
    getCurrentUser: getCurrentUser,
    updateCurrentUser: updateCurrentUser,
    changePasswordCurrentUser: changePasswordCurrentUser,
    listParts: listParts,
    createPart: createPart,
    getPart: getPart,
    updatePart: updatePart,
    deletePart: deletePart,
    getHealthCheck: getHealthCheck
};