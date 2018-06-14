var LibsModels = require("./libs/models");
var LibsEncryption = require("./libs/encryption");
var Util = require("util");

var adminUsername = "admin";
var adminPassword = "admin123";

insertUser(adminUsername, adminPassword, 0);

var userUsername = "user";
var userPassword = "password";

insertUser(userUsername, userPassword, 1);

for (var i = 0; i < 10; i++) {
    
    var salesmanUsername = Util.format(
        "user%d",
        i
    );

    var salesmanPassword = "user123";
    insertUser(salesmanUsername, salesmanPassword, 1);
}



function insertUser(username, password, identify) {
    var encryResult = LibsEncryption.HashPassword(password);
    var salt = encryResult.salt;
    var hash = encryResult.hash;

    LibsModels.Users.findOrCreate({
        where: {
            id: username
        },
        defaults: {
            id: username,
            passwordSalt: salt,
            passwordHash: hash,
            identify: identify,
            locksSales: 0,
            stocksSales: 0,
            barrelsSales: 0,
            commission: 0
        }
    }).spread(function(user, created) {
        if (created) {
            console.log(Util.format(
                "%s created success",
                username
            ));
        } else {
            console.log(Util.format(
                "%s already existed",
                username
            ));
        }
    })
}