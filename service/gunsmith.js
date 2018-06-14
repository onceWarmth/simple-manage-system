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
var LibsCommon = require("../libs/common");
var LibsEncryption = require("../libs/encryption");
var LibsModels = require("../libs/models");
var LibsTraverse = require("../libs/traverse");
var Util = require("util");

//
//  Private functions
//
function getDateFromTimestamp(timestamp) {

    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    return Util.format(
        "%d-%d-%d %d:%d:%d",
        year,
        month,
        day,
        hour,
        minutes,
        seconds
    );
}

//
//  Public functions.
//
function addSalesperson(request, response) {
    
    //  Check identify.
    if (!LibsCommon.isGunsmithIdentify(request)) {

        //  REPLY: identify error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录。"
        });
        return;
    }

    try {
        var root = LibsTraverse.WrapObject(request.body).notNull().typeOf(Object);
        var username = root.sub("username").notNull().typeOf(String).isUsername().inner();
        var password = root.sub("password").notNull().typeOf(String).isPassword().inner();
    } catch (error) {

        console.log(Util.format(
            "Gunsmith module addSalesperson() : parameter error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "参数错误，请检查您的输入。"
        });
        return;
    }

    //  Encrypt password.
    var encryptData = LibsEncryption.HashPassword(password);
    var hash = encryptData.hash;
    var salt = encryptData.salt;

    //  Find or create.
    LibsModels.Users.findOrCreate({
        where: {
            id: username
        },
        defaults: {
            id: username,
            passwordHash: hash,
            passwordSalt: salt,
            identify: 1,
            locksSales: 0,
            stocksSales: 0,
            barrelsSales: 0,
            commission: 0
        }
    }).spread(function(user, created) {

        if (created) {
            response.json({
                response: 1,
                message: "添加成功"
            });
            return;
        } else {
            response.json({
                response: 0,
                message: "该用户已存在"
            });
            return;
        }

    }).catch(function(error) {

        console.log(Util.format(
            "Gunsmith moule addSalesperson() : Models find or create function error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "服务器开小差了，请联系系统管理员"
        });
        return;
    });
}

function editSalespersonPassword(request, response) {
    //  Check identify.
    if (!LibsCommon.isGunsmithIdentify(request)) {

        //  REPLY: identify error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录。"
        });
        return;
    }

    try {
        var root = LibsTraverse.WrapObject(request.body).notNull().typeOf(Object);
        var username = root.sub("username").notNull().typeOf(String).isUsername().inner();
        var password = root.sub("password").notNull().typeOf(String).isPassword().inner();
    } catch (error) {

        console.log(Util.format(
            "Gunsmith module editSalespersonPassword() : parameter error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "参数错误，请检查您的输入。"
        });
        return;
    }

    LibsModels.Users.findById(username).then(function(project) {

        if (project === null) {
            response.json({
                response: 0,
                message: "该用户不存在，请刷新页面后重新尝试"
            });
            return;
        }

        //  Encrypt password.
        var encryptData = LibsEncryption.HashPassword(password);
        var hash = encryptData.hash;
        var salt = encryptData.salt;

        //  Update models.
        project.passwordHash = hash;
        project.passwordSalt = salt;
        project.save();

        response.json({
            response: 1,
            message: "修改成功"
        });

    }).catch(function(error) {
        
        console.log(Util.format(
            "Gunsmith moule editSalespersonPassword() : Models findById function error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "服务器开小差了，请联系系统管理员"
        });
        return;
    });
}

function deleteSalesperson(request, response) {

    //  Check identify.
    if (!LibsCommon.isGunsmithIdentify(request)) {

        //  REPLY: identify error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录。"
        });
        return;
    }

    try {
        var root = LibsTraverse.WrapObject(request.body).notNull().typeOf(Object);
        var username = root.sub("username").notNull().typeOf(String).isUsername().inner();
    } catch (error) {

        console.log(Util.format(
            "Gunsmith module deleteSalesperson() : parameter error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "参数错误，请检查您的输入。"
        });
        return;
    }

    LibsModels.Users.findById(username).then(function(project) {

        //  
        if (project === null) {
            
            response.json({
                response: 0,
                message: "该用户已删除，请刷新页面重试。"
            });
            return;
        }

        project.destroy();
        response.json({
            response: 1,
            message: "删除成功"
        });
    }).catch(function(error) {

        console.log(Util.format(
            "Gunsmith moule deleteSalesperson() : Models findById function error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "服务器开小差了，请联系系统管理员"
        });
        return;
    });
}

function getSalespersonData(request, response) {

    //  Check identify.
    if (!LibsCommon.isGunsmithIdentify(request)) {

        //  REPLY: identify error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录。"
        });
        return;
    }

    LibsModels.Users.findAll({
        where: {
            identify: 1
        }
    }).then(function(projects) {

        var result = [];
        for (var i = 0; i < projects.length; i++) {
            var user = projects[i];
            var data = {};
            data["username"] = user.id;
            data["locksSales"] = user.locksSales;
            data["barrelsSales"] = user.barrelsSales;
            data["stocksSales"] = user.stocksSales;
            data["commission"] = user.commission;
            result.push(data);
        }
        response.json({
            response: 1,
            message: "查找成功",
            users: result
        });
    }).catch(function(error) {

        console.log(Util.format(
            "Gunsmith moule getSalespersonData() : Models findall function error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "服务器开小差了，请联系系统管理员"
        });
        return;
    });
}

function getHistoryReports(request, response) {

    //  Check identify.
    if (!LibsCommon.isGunsmithIdentify(request)) {

        //  REPLY: identify error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录。"
        });
        return;
    }

    LibsModels.Reports.findAll().then(function(projects) {

        var result = [];
        for (var i = 0; i < projects.length; i++) {

            var report = projects[i];
            
            var data = {
                username: report.username,
                date: getDateFromTimestamp(report.timestamp),
                city: report.city,
                locksSales: report.locksSales,
                stocksSales: report.stocksSales,
                barrelsSales: report.barrelsSales
            };

            result.push(data);
        }

        response.json({
            response: 1,
            message: "查询成功",
            reports: result
        });
    }).catch(function(error) {

        console.log(Util.format(
            "Gunsmith moule getHistoryReports() : Models findall function error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "服务器开小差了，请联系系统管理员"
        });
        return;
    });
}

function getMonthReports(request, response) {

    //  Check identify.
    if (!LibsCommon.isGunsmithIdentify(request)) {

        //  REPLY: identify error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录。"
        });
        return;
    }

    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;

    LibsModels.Commission.findAll({
        where: {
            year: year,
            month: month
        }
    }).then(function(projects) {

        var result = [];
        for (var i = 0; i < projects.length; i++) {

            var commission = projects[i];
            
            var data = {
                date: Util.format("%d-%d", year, month),
                username: commission.username,
                locksSales: commission.locksSales,
                stocksSales: commission.stocksSales,
                barrelsSales: commission.barrelsSales,
                commission: commission.commission
            };

            result.push(data);
        }

        response.json({
            response: 1,
            message: "查询成功",
            commission: result
        });
        return;
    }).catch(function(error) {

        console.log(Util.format(
            "Gunsmith moule getMonthReports() : Models findall function error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "服务器开小差了，请联系系统管理员"
        });
        return;
    })
}

//  Export putlic APIs.
module.exports = {
    addSalesperson: addSalesperson,
    editSalespersonPassword: editSalespersonPassword,
    deleteSalesperson: deleteSalesperson,
    getSalespersonData: getSalespersonData,
    getHistoryReports: getHistoryReports,
    getMonthReports: getMonthReports
};
