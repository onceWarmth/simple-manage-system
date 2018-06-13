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
var LibsTravser = require("../libs/traverse");
var Util = require("util");


//
//  Classes.
//
function LoginConfiguration(
    LoginSuccessResponse,
    UsernameOrPasswordErrorResponse,
    UnexpectedErrorResponse,
    InvalidRequestResponse
) {

    this.getLoginSuccessResponse = function() {
        return LoginSuccessResponse;
    };
    this.getUsernameOrPasswordErrorResponse = function() {
        return UsernameOrPasswordErrorResponse;
    };
    this.getUnexpectedErrorResponse = function() {
        return UnexpectedErrorResponse;
    };
    this.getInvalidResquestResponse = function() {
        return InvalidRequestResponse;
    };
}

//
//  Public function.
//

/**
 * Load login configuration.
 * 
 * @param {*} configuration - The input configuration.
 * @returns {LoginConfiguration} - The configuration object. 
 */
function LoadLoginConfiguration(configuration) {
    try {
        var root = LibsTravser.WrapObject(configuration).notNull().typeOf(Object);

        //  Login module resposne.
        var Response = root.sub("Response").notNull().typeOf(Object);
        var LoginSuccessResponse = Response.sub("LoginSuccessResponse").notNull().typeOf(Object).inner();
        var UsernameOrPasswordErrorResponse = Response.sub("UsernameOrPasswordErrorResponse").notNull().typeOf(Object).inner();
        var UnexpectedErrorResponse = Response.sub("UnexpectedErrorResponse").notNull().typeOf(Object).inner();
        var InvalidRequestResponse = Response.sub("InvalidRequestResponse").notNull().typeOf(Object).inner();

    } catch (error) {
        console.log(Util.format(
            "LoadLoginConfiguration(): Invalid configuration object (error=\"%s\")",
            error.message || "(unknown)"
        ));
    }

    return new LoginConfiguration(
        LoginSuccessResponse,
        UsernameOrPasswordErrorResponse,
        UnexpectedErrorResponse,
        InvalidRequestResponse
    );
}

//  Export public APIs.
module.exports = {
    LoginConfiguration: LoginConfiguration,
    LoadLoginConfiguration: LoadLoginConfiguration
};
