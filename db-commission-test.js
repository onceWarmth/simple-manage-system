var LibsModels = require("./libs/models");
var Util = require("util");
var Uuid = require("uuid");

var LOCKS_COST = 45;
var STOCKS_COST = 30;
var BARRELS_COST = 25;

var year = 2018;

for (var month = 0; month < 6; month++) {

    for (var i = 0; i < 10; i++) {

        var username = "user" + i.toString();
        
        LibsModels.Reports.findAll({
            where: {
                username: username,
                year: year,
                month: month + 1
            }
        }).then(function(projects) {


            if (projects.length == 0) {
                return;
            }

            var locksSalesSum = 0;
            var stocksSalesSum = 0;
            var barrelsSalesSum = 0;

            for (var j = 0; j < projects.length; j++) {

                var report = projects[j]

                if (report.locksSales == -1) {
                    continue;
                }

                locksSalesSum += report.locksSales;
                stocksSalesSum += report.stocksSales;
                barrelsSalesSum += report.barrelsSales;

            }

            var cost = 0;
            if (locksSalesSum == 0 || stocksSalesSum == 0 || barrelsSalesSum == 0) {
                cost = 0;
            } else {
                cost = locksSalesSum * LOCKS_COST 
                    + stocksSalesSum * STOCKS_COST
                    + barrelsSalesSum * BARRELS_COST;
            }

            var commission = 0;
            if (cost <= 1000) {
                commission += 0.10 * cost;
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

            console.log(projects[0].username);
            console.log(projects[0].month);
            console.log(projects[0].year);
            
            var commissionId = Uuid.v1();
            LibsModels.Commission.findOrCreate({
                where: {
                    username: projects[0].username,
                    month: projects[0].month,
                    year: projects[0].year
                },
                defaults: {
                    id: commissionId,
                    username: projects[0].username,
                    year: projects[0].year,
                    month: projects[0].month,
                    locksSales: locksSalesSum,
                    stocksSales: stocksSalesSum,
                    barrelsSales: barrelsSalesSum,
                    commission: commission
                }
            }).spread(function(commissionObj, created) {

                if (!created) {
                    commissionObj.locksSales = locksSalesSum;
                    commissionObj.stocksSales = stocksSalesSum;
                    commissionObj.barrelsSales = barrelsSalesSum;
                    commissionObj.commission = commission;
                    commissionObj.save();

                    console.log(Util.format(
                        "%d-%d %s commission save success",
                        commissionObj.year, commissionObj.month, commissionObj.username
                    ));
                } else {
                    console.log(Util.format(
                        "%d-%d %s commission create success.",
                        commissionObj.year, commissionObj.month, commissionObj.username
                    ));
                }

                
            });
        });
    }
}