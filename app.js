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
//  Imports
//
var RoutesGunsmith = require("./routes/gunsmith");
var RoutesLogin = require("./routes/login");
var RoutesSalesperson = require("./routes/salesman");
var BodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var Express = require("express");
var Util = require("util");

//
//  Constant.
//
var PORT = 3000;

//  Create app.
var app = Express();

app.use(cookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({
    extended: true
}));

app.get("/", function(request, response) {
    response.redirect("/login.html");
});

//  Login module.
app.use("/login/", RoutesLogin);

//  Gunsmith module.
app.use("/gunsmith/", RoutesGunsmith);

//  Salesman module.
app.use("/salesman/", RoutesSalesperson);

//  Set static dir.
app.use(Express.static("static"));

//  Bind port.
app.listen(PORT, function() {
    console.log(Util.format(
        "Server listening on port %d!",
        PORT
    ));
});
