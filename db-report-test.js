var LibsModels = require("./libs/models");
var Util = require("util");
var Uuid = require("uuid");

var year = 2018;

var cityValue = [
    "华盛顿州",
    "蒙大拿州",
    "佛罗里达州",
    "科罗拉多州",
    "夏威夷州",
    "印第安纳州",
    "爱荷华州",
    "肯塔基州",
    "缅因州",
    "密歇根州",
    "明尼苏达州",
    "密西西比州",
    "内布拉斯加州",
]

var LOCKS_MAX_NUM = 70;
var STOCKS_MAX_NUM = 80;
var BARRELS_MAX_NUM = 90;

for (var month = 0; month < 6; month++) {
    var firstDayDate = new Date();
    firstDayDate.setFullYear(year, month, 1);

    var lastDayDate = new Date();
    lastDayDate.setFullYear(year, month, 27);

    var internal = lastDayDate.getTime() - firstDayDate.getTime();

    for (var i = 0; i < 10; i++) {

        var username = "user" + i.toString();
        var reportNum = Math.ceil(Math.random() * 3);

        for (var j = 0; j < reportNum; j++) {

            var timestamp = firstDayDate.getTime() + Math.floor(Math.random() * internal);

            var reportId = Uuid.v1();

            var cityIndex = Math.floor(Math.random() * cityValue.length);
            var city = cityValue[cityIndex];

            LibsModels.Reports.findOrCreate({
                where: {
                    id: reportId
                },
                defaults: {
                    id: reportId,
                    username: username,
                    year: year,
                    month: month + 1,
                    timestamp: timestamp,
                    city: city,
                    locksSales: Math.floor(20 * Math.random()),
                    stocksSales: Math.floor(20 * Math.random()),
                    barrelsSales: Math.floor(30 * Math.random())
                }
            }).spread(function(report, created) {

                if (created) {
                    console.log(Util.format(
                        "%d-%d %s report%d created success.",
                        report.year,
                        report.month,
                        report.username,
                        j
                    ));
                } else {
                    console.log(Util.format(
                        "%d-%d %s report%d created failed.",
                        report.year,
                        report.month,
                        report.username,
                        j
                    ));
                }
            });
            
        }
    }
}


