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

function ModelInitial() {
}

(function() {
    //
    //  Imports.
    //
    var Sequelize = require("sequelize");

    //  Create sequelize.
    var sequelize = new Sequelize("gundb", "root", "root", {
        host: "127.0.0.1",
        dialect: "mysql",
        logging: false,
        define: {
            charset: "utf8",
        }
    });


    /**
     * Users table 
     * 
     * identify: 0 is admin. 1 is salesman.
     */
    var Users = sequelize.define("users", {
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        passwordSalt: {
            type: Sequelize.STRING,
            allowNULL: false
        },
        passwordHash: {
            type: Sequelize.STRING,
            allowNULL: false
        },
        identify: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        locksSales: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        stocksSales: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        barrelsSales: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        commission: {
            type: Sequelize.DOUBLE,
            allowNull: false
        }
    });

    var Reports = sequelize.define("reports", {
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        year: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        month: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        timestamp: {
            type: Sequelize.BIGINT,
            allowNULL: false
        },
        city: {
            type: Sequelize.STRING,
            allowNULL: false
        },
        locksSales: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        stocksSales: {
            type: Sequelize.INTEGER,
            allowNULL: false
        },
        barrelsSales: {
            type: Sequelize.INTEGER,
            allowNULL: false
        }
    });

    var Commission = sequelize.define("commission", {
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        month: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        locksSales: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        stocksSales: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        barrelsSales: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        commission: {
            type: Sequelize.DOUBLE,
            allowNull: false
        }
    });

    //  DB sync.
    sequelize.sync();

    //  Export public APIs.
    module.exports = {
        Users: Users,
        Reports: Reports,
        Commission: Commission,
        Op: Sequelize.Op
    };
})();