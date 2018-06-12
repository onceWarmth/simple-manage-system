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
//  Public functions.
//

/**
 *  Check the type of an object.
 *
 *  @param {*} instance - The object instance.
 *  @param {*} constructor - The object constructor (type).
 *  @return {Boolean} - True if type matches.
 */
function IsInstanceOf(instance, constructor) {
    if (constructor == Number || constructor == Boolean || constructor == String) {
        return instance.constructor == constructor;
    } else {
        return (instance instanceof constructor);
    }
}

/**
 *  Get whether two objects are the same type.
 *
 *  @param {*} instance1 - The first instance.
 *  @param {*} instance2 - The second instance.
 *  @return {Boolean} - True if types are the same.
 */
function IsSameType(instance1, instance2) {
    var t1 = typeof(instance1);
    var t2 = typeof(instance2);
    if ((instance1 === null && instance2 !== null) || (instance2 === null && instance1 !== null)) {
        return false;
    }
    if ((t1 == "undefined" && t2 != "undefined") || (t2 == "undefined" && t1 != "undefined")) {
        return false;
    }
    return t1 == t2 && IsInstanceOf(instance1, instance2.constructor);
}

//  Export public APIs.
module.exports = {
    "IsInstanceOf": IsInstanceOf,
    "IsSameType": IsSameType
};