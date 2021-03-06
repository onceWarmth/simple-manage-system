//  Copyright (C) 2018 The Varme Project. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy of
//  this software and associated documentation files (the "Software"), to deal in
//  the Software without restriction, including without limitation the rights to
//  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
//  of the Software, and to permit persons to whom the Software is furnished to do
//  so, subject to the following conditions: 
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
//  THE SOFTWARE.
//

//
//  Imports.
//
var LibsModels = require("./libs/models");
var LibsEncryption = require("./libs/encryption");

var Util = require("util");
var Uuid = require("uuid");

var username = "admin";
var password = "admin123";

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
        identify: 0,
        locksSales: 0,
        stocksSales: 0,
        barrelsSales: 0,
        commission: 0
    }
}).spread(function(user, created) {

    if (created) {
        console.log("Create success.");
    } else {
        console.log("Already existed.");
    }
}).catch(function(error) {
    console.log(error);
});

username = "user";
password = "user123";

encryResult = LibsEncryption.HashPassword(password);
salt = encryResult.salt;
hash = encryResult.hash;

LibsModels.Users.findOrCreate({
    where: {
        id: username
    },
    defaults: {
        id: username,
        passwordSalt: salt,
        passwordHash: hash,
        identify: 1,
        locksSales: 0,
        stocksSales: 0,
        barrelsSales: 0,
        commission: 0
    }
}).spread(function(user, created) {

    if (created) {
        console.log("Create success.");
    } else {
        console.log("Already existed.");
    }
}).catch(function(error) {
    console.log(error);
});
