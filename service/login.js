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
var CfgLogin = require("../configurations/login");
var LibsEncryption = require("../libs/encryption");
var LibsModels = require("../libs/models");
var LibsTravser = require("../libs/traverse");
var FS = require("fs");
var Util = require("util");

//
//  Constant.
//
var CONFIGURATION_FILE_ENCODING = "utf-8";
var CONFIGURATION_FILE = "./configurations/login.json";

//
//  Global var.
//
var g_LoginConfiguration =new CfgLogin.LoginConfiguration();

//
//  Private functions.
//
/**
 * Create login configuration. If failed, return null.
 * 
 * @returns {LoginConfiguration} - The LoginConfiguration object.
 */
function CreateConfiguration() {
    
    //  Read configuration file.
    try {
        var data = FS.readFileSync(CONFIGURATION_FILE, CONFIGURATION_FILE_ENCODING).trim();
    } catch(error) {
        console.log(Util.format(
            "Login modules: Unable to read \"%s\". (error=\"%s\")",
            CONFIGURATION_FILE,
            error.message || "(unknown)"
        ));
        return null;
    }
    
    return CfgLogin.LoadLoginConfiguration(JSON.parse(data));
}

//  Initialize login configuration.
g_LoginConfiguration = CreateConfiguration();

//
//  Public functions.
//

function login(request, response) {

    //  Patameter check.
    try {
        var root = LibsTravser.WrapObject(request.body).notNull().typeOf(Object);
        var username = root.sub("username").notNull().typeOf(String).isUsername().inner();
        var password = root.sub("password").notNull().typeOf(String).isPassword().inner();
    } catch(error) {

        console.log(Util.format(
            "Login module login() : parameter check error. (error=\"%s\")",
            error.message || "(unknown)"
        ));
        //  REPLY: Invalid request.
        response.json(g_LoginConfiguration.getInvalidResquestResponse());
        return;
    }

    //  Check user is existed.
    LibsModels.Users.findOne({
        where: {
            id: username
        }
    }).then(function(project) {

        if (project === null) {

            //  REPLY: username is not existed.
            response.json(g_LoginConfiguration.getUsernameOrPasswordErrorResponse());
            return;
        }

        //  Check password is correct.
        var hash = project.passwordHash;
        var salt = project.passwordSalt;

        var isPasswordCorrect = LibsEncryption.CheckPassword(password, hash, salt);

        if (isPasswordCorrect) {

            //  Set cookie.
            response.cookie("username", username);
            response.cookie("identify", project.identify);

            //  REPLY: login success.
            response.json(g_LoginConfiguration.getLoginSuccessResponse());
            return;
        } else {

            //  REPLY: password is not existed.
            response.json(g_LoginConfiguration.getUsernameOrPasswordErrorResponse());
            return;
        }
    }).catch(function(error) {
        console.log(Util.format(
            "Login module : model find error. (error = \"%s\")",
            error.message || "(unknown)"
        ));

        //  REPLY: unexpected error.
        response.json(g_LoginConfiguration.getUnexpectedErrorResponse());
        return;
    })
}

function isLogin(request, response) {

//    console.log("Request : ", request);
    console.log("Cookie : ", request.cookies);
    if (request.cookies) {
        
        //  REPLY: user already login.
        response.json({
            "response": 1
        });
    } else {

        //  REPLY: user not login.
        response.json({
            "response": 0
        });
    }

    return;
}

function logout(request, response) {

    //  Clear cookie.
    resposne.clearCookie("username");
    response.clearCookie("password");

    //  REPLY: logout success.
    response.json({
        "response": 1,
        "message": "Clear success."
    });

    return;
}

//  Module exports.
module.exports = {
    login: login,
    isLogin: isLogin,
    logout: logout
};