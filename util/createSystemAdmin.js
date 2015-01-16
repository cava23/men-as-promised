var app = require('../server');
var mongoose = require('mongoose-q')(),
    User = mongoose.model('User');

var adminInfo = {
    "firstName":"System",
    "lastName":"Admin",
    "email":"admin@yourdomain.com",
    "username":process.argv[2],
    "password":process.argv[3],
    provider: 'local',
    "roles":["system-admin", "user", "admin"]
};
var admin = new User(adminInfo);

admin.save(function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Created system admin user successfully");
    }
    process.exit();
});