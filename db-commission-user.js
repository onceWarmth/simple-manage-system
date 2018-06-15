var LibsModels = require("./libs/models");
var Util = require("util");

for (var i = 0; i < 10; i++) {

    var username = "user" + i.toString();

    LibsModels.Commission.findAll({
        where: {
            username: username
        }
    }).then(function(projects) {

        if (projects.length == 0) {
            return;
        }
        var locksSalesSum = 0;
        var stocksSalesSum = 0;
        var barrelsSalesSum = 0;

        var commission= 0;

        for (var j = 0; j < projects.length; j++) {

            var commissionObj = projects[j];
            locksSalesSum += commissionObj.locksSales;
            stocksSalesSum += commissionObj.stocksSales;
            barrelsSalesSum += commissionObj.barrelsSales;
            commission += commissionObj.commission;

        }

        LibsModels.Users.findById(projects[0].username).then(function(project) {

            project.locksSales = locksSalesSum;
            project.stocksSales = stocksSalesSum;
            project.barrelsSales = barrelsSalesSum;
            project.commission = commission;
            project.save();
            console.log(Util.format(
                "%s save success. Commision : %d, LocksSales : %d, StocksSales : %d, BarrelsSales : %d",
                project.id,
                commission,
                locksSalesSum,
                stocksSalesSum,
                barrelsSalesSum
            ));
        });
    });
}