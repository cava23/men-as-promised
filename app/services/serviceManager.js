var ServiceManager = (function () {
    var PartService = require('./part.service');
    var OrgService = require('./org.service');
    var UserService = require('./user.service');

    var partService;
    var orgService;
    var userService;

    return {

        getPartService: function() {
            if (!partService) {
                partService = new PartService(this);
            }
            return partService;
        },

        getOrgService: function() {
            if (!orgService) {
                orgService = new OrgService(this);
            }
            return orgService;
        },

        getUserService: function() {
            if (!userService) {
                userService = new UserService(this);
            }
            return userService;
        }

    };
})();

module.exports = ServiceManager;