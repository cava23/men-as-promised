exports.ROLE_SYSTEM_ADMIN = "system-admin";
exports.ROLE_ORG_ADMIN = "admin";
exports.ROLE_ENGINEER = "engineer";
exports.ROLE_SHOP = "shop";
exports.ROLE_CUSTOMER = "client";
exports.ROLES_ALL_ORG = [this.ROLE_ENGINEER, this.ROLE_ORG_ADMIN, this.ROLE_SHOP];
exports.ROLES_ALL_ROLES = ([this.ROLE_SYSTEM_ADMIN]).concat(this.ROLES_ALL_ORG);

exports.HEADER_NO_DELAY = "no-delay";

exports.METRIC_CREATE_PART_DURATION = 'create-part-duration';