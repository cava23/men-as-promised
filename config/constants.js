exports.ROLE_SYSTEM_ADMIN = "system-admin";
exports.ROLE_ORG_ADMIN = "admin";
exports.ROLE_USER = "user";
exports.ROLES_ALL_ORG = [this.ROLE_USER, this.ROLE_ORG_ADMIN];
exports.ROLES_ALL_ROLES = ([this.ROLE_SYSTEM_ADMIN]).concat(this.ROLES_ALL_ORG);