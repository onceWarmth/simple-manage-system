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
var LibsModels = require("../libs/models");
var LibsTravser = require("../libs/traverse");
var Util = require("util");
var Uuid = require("uuid");

//
//  Constant.
//
var MAX_LOCKS_SALES = 70;
var MAX_STOCKS_SALES = 80;
var MAX_BARRELS_SALES = 90;

var LOCKS_COST = 45;
var STOCKS_COST = 30;
var BARRELS_COST = 25;

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
function addReport(request, response) {

    //  Check permission.
    if (!LibsCommon.isSalesmanIdentify(request)) {

        //  REPLY: Permission error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录尝试"
        });
    }

    var username = request.cookies.username;

    //   Check parameter.
    console.log(request.body);
    try {
        var root = LibsTravser.WrapObject(request.body).notNull().typeOf(Object);
        var city = root.sub("city").notNull().typeOf(String).isCity().inner();
        var locksSales = parseInt(root.sub("locksSales").notNull().typeOf(String).isLocksSales().inner());
        var stocksSales = parseInt(root.sub("stocksSales").notNull().typeOf(String).isPositiveIntegerString().inner());
        var barrelsSales = parseInt(root.sub("barrelsSales").notNull().typeOf(String).isPositiveIntegerString().inner());
    } catch (error) {

        console.log(Util.format(
            "Salesman module addReport() : parameter error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "参数错误，请检查输入"
        });
        return;
    }

    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    
    LibsModels.Reports.findAll({
        where: {
            username: username,
            year: year,
            month: month
        }
    }).then(function(projects) {

        var locksSalesSum = 0;
        var stocksSalesSum = 0;
        var barrelsSalesSum = 0;
        for (var i = 0; i < projects.length; i++) {

            var report = projects[i];
            locksSalesSum += report.locksSales;
            stocksSalesSum += report.stocksSales;
            barrelsSalesSum += report.barrelsSales;

            if (report.locksSales == -1) {
                response.json({
                    response: 0,
                    message: "本月已完成销售，无法再次进行报告提交"
                });
                return;
            }
        }

        if (locksSalesSum + locksSales > MAX_LOCKS_SALES) {

            response.json({
                response: 0,
                message: "枪锁销售额已经达到本月最高。"
            });
            return;
        }

        if (stocksSalesSum + stocksSales > MAX_STOCKS_SALES) {
            response.json({
                response: 0,
                message: "枪托销售额已经达到本月最高。"
            });
            return;
        }

        if (barrelsSalesSum + barrelsSales > MAX_BARRELS_SALES) {
            response.json({
                response: 0,
                message: "枪管销售额已经达到本月最高。"
            });
            return;
        }


        var reportId = Uuid.v1();
        var timestamp = new Date().getTime();

        LibsModels.Reports.findOrCreate({
            where: {
                id: reportId
            },
            defaults: {
                id: reportId,
                city: city,
                year: year,
                month: month,
                username: username,
                locksSales: locksSales,
                stocksSales: stocksSales,
                barrelsSales :barrelsSales,
                timestamp: timestamp
            }
        }).spread(function(report, created) {

            console.log("Reports models.");
    
            if (created) {

                //  Create commission.
                if (locksSales == -1) {

                    var cost = 0;
                    if (locksSales == 0 || stocksSales == 0 || barrelsSales == 0) {
                        cost = 0;
                    } else {
                        cost = locksSalesSum * LOCKS_COST 
                            + stocksSalesSum * STOCKS_COST
                            + barrelsSalesSum * BARRELS_COST;
                    }

                    var commission = 0;
                    if (cost <= 1000) {
                        commission += 0.10 * commission;
                        commission = Math.floor(commission * 100) / 100;
                    } else if (cost <= 1800) {
                        commission += 0.10 * 1000;
                        commission += 0.15 * (cost - 1000);
                        commission = Math.floor(commission * 100) / 100;
                    } else {
                        commission += 0.10 * 1000;
                        commission += 0.15 * 800;
                        commission += 0.20 * (cost - 1800);
                        commission = Math.floor(commission * 100) / 100;
                    }
                    var commissionId = Uuid.v1();
                    LibsModels.Commission.findOrCreate({
                        where: {
                            username: username,
                            month: month,
                            year: year
                        },
                        defaults: {
                            id: commissionId,
                            username: username,
                            year: year,
                            month: month,
                            locksSales: locksSalesSum,
                            stocksSales: stocksSalesSum,
                            barrelsSales: barrelsSalesSum,
                            commission, commission
                        }
                    }).spread(function(commissionObj, created) {

                        console.log("Commission model.");

                        if (!created) {
                            commissionObj.locksSales = locksSalesSum;
                            commissionObj.stocksSales = stocksSalesSum;
                            commissionObj.barrelsSales = barrelsSalesSum;
                            commissionObj.commission = commission;
                            commissionObj.save();
                        }

                        LibsModels.Users.findById(username).then(function(project) {

                            console.log("Users model.");
                            project.stocksSales += stocksSalesSum;
                            project.locksSales += locksSalesSum;
                            project.barrelsSales += barrelsSalesSum;
                            project.commission += commission;
                            project.save();

                            response.json({
                                response: 1,
                                message: "添加成功"
                            });
                            return;
                        });
                    });
                } else {
                    response.json({
                        response: 1,
                        message: "添加成功"
                    });
                    return;
                }

                return;
            } else {

                response.json({
                    response: 0,
                    message: "添加失败，请重新尝试。"
                });
                return;
            }
        }).catch(function(error) {
    
            console.log(Util.format(
                "Salesman module addReport() : Models find or created error. (error = \"%s\")",
                error.message || "(unknown)"
            ));
    
            response.json({
                response: 0,
                message: "服务器开小差了，请重试或者联系系统管理员"
            });
            return;
        });

    }).catch(function(error) {

        console.log(Util.format(
            "Salesman module addReport() : Models find reports error. (error = \"%s\")",
            error.message || "(unknown)"
        ));

        response.json({
            response: 0,
            message: "服务器开小差了，请重试或者联系系统管理员"
        });

        return;
    });
}

function deleteReport(request, response) {

    //  Check permission.
    if (!LibsCommon.isSalesmanIdentify(request)) {

        //  REPLY: Permission error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录尝试"
        });
    }

    var username = request.cookies.username;

    //   Check parameter.
    try {
        var root = LibsTravser.WrapObject(request.body).notNull().typeOf(Object);
        var reportId = root.sub("reportId").notNull().typeOf(String).inner();
    } catch (error) {

        console.log(Util.format(
            "Salesman module deleteReport() : Parameter error. (error = \"%s\")",
            error.message || "(unknown)"
        ));
        response.json({
            response: 0,
            message: "参数错误，请检查输入"
        });
        return;
    }

    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;

    LibsModels.Reports.findById(reportId).then(function(project) {

        if (project === null) {
            response.json({
                response: 0,
                message: "该报告不存在，请刷新页面后重试"
            });
            return;
        }


        if (project.username != username) {
            response.json({
                response: 0,
                message: "您无权删除该报告"
            });
            return;
        }

        if (project.month != month || project.year != year) {
            response.json({
                response: 0,
                message: "您无权删除该报告"
            });
            return;
        }

        project.destroy();
        response.json({
            response: 1,
            message: "删除成功"
        });
        return;
    }).catch(function(error) {

        console.log(Util.format(
            "Salesman module deleteReport() : Models find reports error. (error = \"%s\")",
            error.message || "(unknown)"
        ));

        response.json({
            response: 0,
            message: "服务器开小差了，请重试或者联系系统管理员"
        });
        
    })
}

function getCurrentMonthReport(request, response) {

    //  Check permission.
    if (!LibsCommon.isSalesmanIdentify(request)) {

        //  REPLY: Permission error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录尝试"
        });
    }

    var username = request.cookies.username;

    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;

    LibsModels.Reports.findAll({
        where: {
            username: username,
            year: year,
            month: month
        }
    }).then(function(projects) {
        
        var result = [];
        for (var i = 0; i < projects.length; i++) {
            
            var report = projects[i];
            var reportId = report.id;
            var date = getDateFromTimestamp(report.timestamp);
            var city = report.city;
            var locksSales = report.locksSales;
            var stocksSales =  report.stocksSales;
            var barrelsSales = report.barrelsSales;

            if (locksSales == -1) {
                response.json({
                    response: 1,
                    isFinished: 1,
                    message: "该月已经结算"
                });
                return;
            }
            var data = {
                reportId: reportId,
                date: date,
                city: city,
                locksSales: locksSales,
                stocksSales: stocksSales,
                barrelsSales: barrelsSales
            };

            result.push(data);
        }

        response.json({
            response: 1,
            isFinished: 0,
            reports: result
        });
        return;
    }).catch(function(error) {

        console.log(Util.format(
            "Salesman module getCurrentMonthReport() : Models find reports error. (error = \"%s\")",
            error.message || "(unknown)"
        ));

        response.json({
            response: 0,
            message: "服务器开小差了，请重试或者联系系统管理员"
        });
    });
}

function getHistoryCommission(request, response) {

    //  Check permission.
    if (!LibsCommon.isSalesmanIdentify(request)) {

        //  REPLY: Permission error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录尝试"
        });
    }

    var username = request.cookies.username;

    LibsModels.Commission.findAll({
        where: {
            username: username
        }
    }).then(function(projects) {

        var result = [];
        for (var i = 0; i < projects.length; i++) {

            var commission = projects[i];
            var data = {}
            var year = commission.year;
            var month = commission.month;
            data["date"] = Util.format(
                "%d-%d",
                year,
                month
            );
            data["locksSales"] = commission.locksSales;
            data["stocksSales"] = commission.stocksSales;
            data["barrelsSales"] = commission.barrelsSales;
            data["commission"] = commission.commission;
            result.push(data);
        }

        response.json({
            response: 1,
            commission: result,
            message: "查询成功"
        });
        return;

    }).catch(function(error) {

        console.log(Util.format(
            "Salesman module getHistoryCommission() : Models find reports error. (error = \"%s\")",
            error.message || "(unknown)"
        ));

        response.json({
            response: 0,
            message: "服务器开小差了，请重试或者联系系统管理员"
        });
        return;
    });
}

function getHistoryReports(request, response) {

    //  Check permission.
    if (!LibsCommon.isSalesmanIdentify(request)) {

        //  REPLY: Permission error.
        response.json({
            response: 0,
            message: "您的登录凭证已经过期，请注销后重新登录尝试"
        });
    }

    var username = request.cookies.username;
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    
    LibsModels.Reports.findAll({
        where: {
            username: username
        }
    }).then(function(projects) {

        var result = [];
        var isCurrentMonthFinished = false;

        for (var i = 0; i < projects.length; i++) {
            
            var report = projects[i];
            if (report.year == year && report.month == month && report.locksSales == -1) {
                isCurrentMonthFinished = true;
                break;
            }
        }

        for (var i = 0; i < projects.length; i++) {
            var report = projects[i];
            if (report.year == year && report.month == month && !isCurrentMonthFinished) {
                continue;
            }

            if (report.locksSales == -1) {
                continue;
            }

            var data = {
                date: getDateFromTimestamp(report.timestamp),
                city: report.city,
                locksSales: report.locksSales,
                stocksSales: report.stocksSales,
                barrelsSales: report.barrelsSales
            }
            
            result.push(data);
        }

        response.json({
            response: 1,
            message: "查询成功",
            reports: result
        });

        return;

    }).catch(function(error) {

        console.log(Util.format(
            "Salesman module getHistoryReports() : Models find reports error. (error = \"%s\")",
            error.message || "(unknown)"
        ));

        response.json({
            response: 0,
            message: "服务器开小差了，请重试或者联系系统管理员"
        });
        return;
    })
}

//  Export public APIs.
module.exports = {
    addReport: addReport,
    deleteReport: deleteReport,
    getCurrentMonthReport: getCurrentMonthReport,
    getHistoryCommission: getHistoryCommission,
    getHistoryReports: getHistoryReports
}
