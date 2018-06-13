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
var CrType = require("./type");
var Util = require("util");

//
//  Classes.
//

/**
 *  Traverse helper.
 *
 *  @param {*} inner - The inner object.
 *  @param {*} path - The path.
 */
function Traverse(inner, path) {
    //
    //  Members.
    //

    //  Self reference.

    /**  @type {Traverse}  */
    var self = this;

    //
    //  Private methods.
    //

    /**
     *  Get the path of specific sub directory.
     *
     *  @param {String} name - The name of sub directory.
     */
    function _GetSubPath(name) {
        if (path.length == 0 || path[path.length - 1] == "/") {
            return path + name;
        } else {
            return path + "/" + name;
        }
    }

    //
    //  Public methods.
    //

    /**
     *  Check the type of inner object.
     *
     *  @param {Function} constructor - The type (constructor).
     *  @return {Traverse} - Self.
     */
    this.typeOf = function(constructor) {
        if (inner !== null && !CrType.IsInstanceOf(inner, constructor)) {
            throw new Error(Util.format(
                "Traverse::typeOf(): Invalid object type (path=\"%s\").",
                path
            ));
        }
        return self;
    };

    /**
     *  Assume that the inner object is a Number.
     *
     *  @return {Traverse} - Self.
     */
    this.numeric = function() {
        self.typeOf(Number);
        return self;
    };

    /**
     *  Assume that the inner object is an integer (also a Number).
     *
     *  @return {Traverse} - Self.
     */
    this.integer = function() {
        if (inner !== null) {
            //  The inner object must be a number first.
            self.numeric();

            //  Check whether the number is an integer.
            if (!Number.isInteger(inner)) {
                throw new Error(Util.format(
                    "Traverse::typeOf(): Value should be an integer (path=\"%s\").",
                    path
                ));
            }
        }

        return self;
    };

    /**
     *  Assume that the inner object is a boolean.
     *
     *  @return {Traverse} - Self.
     */
    this.boolean = function() {
        self.typeOf(Boolean);
        return self;
    };

    /**
     *  Go to sub directory.
     *
     *  @param {String} name - The name of sub directory.
     *  @return {Traverse} - Traverse object of sub directory.
     */
    this.sub = function(name) {
        //  Check type.
        self.notNull().typeOf(Object);

        //  Get the sub path.
        var subPath = _GetSubPath(name);

        if (name in inner) {
            //  Go into inner path.
            return new Traverse(inner[name], subPath);
        } else {
            throw new Error(Util.format(
                "Traverse::sub(): Sub path doesn't exist (path=\"%s\").",
                subPath
            ));
        }
    };

    /**
     *  Go to sub directory which can be non-existed.
     *
     *  @param {String} name - The name of sub directory.
     *  @param {*} defaultValue - The default value if the directory doesn't exist.
     *  @return {Traverse} - Traverse object of sub directory.
     */
    this.optionalSub = function(name, defaultValue) {
        //  Check type.
        self.notNull().typeOf(Object);

        if (name in inner) {
            //  Go into inner path.
            return new Traverse(inner[name], _GetSubPath(name));
        } else {
            //  Use the default value.
            return new Traverse(defaultValue, _GetSubPath(name));
        }
    };

    /**
     *  Assume that the inner object is not null.
     *
     *  @return {Traverse} - Self.
     */
    this.notNull = function() {
        //  Ensure the value is not null.
        if (inner === null) {
            throw new Error(Util.format(
                "Traverse::notNull(): Object is null (path=\"%s\").",
                path
            ));
        }

        return self;
    };

    /**
     *  Assume that the inner object is username.
     * 
     *  @return {Travser} - Self.
     */
    this.isUsername = function() {

        //  Create username pattern.
        var usernamePattern = /^[a-zA-Z0-9_]{3,16}$/;

        //  Ensure the value is username.
        if (!usernamePattern.test(inner)) {
            throw new Error(Util.format(
                "Traverse::isUsername(): Object is not username. (path=\"%s\").",
                path
            ));
        }

        return self;
    };

    /**
     *  Assume that the inner object is password.
     *  
     *  @return {Travser} - Self.
     */
    this.isPassword = function() {

        //  Create password pattern.
        var pattern = /^[a-zA-Z0-9_]{6,128}$/;

        //  Ensurn the value is password.
        if (!pattern.test(inner)) {
            throw new Error(Util.format(
                "Traverse::isPassword(): Object is not password. (path=\"%s\").",
                path
            ));
        }
        
        return self;
    }

    /**
     *  Give minimum value threshold to the inner object (expect: inner >= threshold).
     *
     *  @param {*} threshold - The threshold.
     *  @return {Traverse} - Self.
     */
    this.min = function(threshold) {
        if (inner !== null) {
            //  Check object type.
            if (!CrType.IsSameType(inner, threshold)) {
                throw new Error(Util.format(
                    "Traverse::min(): Uncomparable type (path=\"%s\").",
                    path
                ));
            }

            //  Check value range.
            if (inner < threshold) {
                throw new Error(Util.format(
                    "Traverse::min(): Value is too small (path=\"%s\", require='>=', threshold=%s).",
                    path,
                    JSON.stringify(threshold) || "(unrepresentable)"
                ));
            }
        }

        return self;
    };

    /**
     *  Give exclusive minimum value threshold to the inner object (expect: inner > threshold).
     *
     *  @param {*} threshold - The threshold.
     *  @return {Traverse} - Self.
     */
    this.minExclusive = function(threshold) {
        if (inner !== null) {
            //  Check object type.
            if (!CrType.IsSameType(inner, threshold)) {
                throw new Error(Util.format(
                    "Traverse::minExclusive(): Uncomparable type (path=\"%s\").",
                    path
                ));
            }

            //  Check value range.
            if (inner <= threshold) {
                throw new Error(Util.format(
                    "Traverse::minExclusive(): Value is too small (path=\"%s\", require='>', threshold=%s.",
                    path,
                    JSON.stringify(threshold) || "(unrepresentable)"
                ));
            }
        }

        return self;
    };

    /**
     *  Give maximum value threshold to the inner object (expect: inner <= threshold).
     *
     *  @param {*} threshold - The threshold.
     *  @return {Traverse} - Self.
     */
    this.max = function(threshold) {
        if (inner !== null) {
            //  Check object type.
            if (!CrType.IsSameType(inner, threshold)) {
                throw new Error(Util.format(
                    "Traverse::max(): Uncomparable type (path=\"%s\").",
                    path
                ));
            }

            //  Check value range.
            if (inner > threshold) {
                throw new Error(Util.format(
                    "Traverse::max(): Value is too large (path=\"%s\", require='<=', threshold=%s).",
                    path,
                    JSON.stringify(threshold) || "(unrepresentable)"
                ));
            }
        }

        return self;
    };

    /**
     *  Give exclusive maximum value threshold to the inner object (expect: inner < threshold).
     *
     *  @param {*} threshold - The threshold.
     *  @return {Traverse} - Self.
     */
    this.maxExclusive = function(threshold) {
        if (inner !== null) {
            //  Check object type.
            if (!CrType.IsSameType(inner, threshold)) {
                throw new Error(Util.format(
                    "Traverse::maxExclusive(): Uncomparable type (path=\"%s\").",
                    path
                ));
            }

            //  Check value range.
            if (inner >= threshold) {
                throw new Error(Util.format(
                    "Traverse::maxExclusive(): Value is too large (path=\"%s\", require='<', threshold=%s).",
                    path,
                    JSON.stringify(threshold) || "(unrepresentable)"
                ));
            }
        }

        return self;
    };

    /**
     *  Give value threshold to the inner object (expect: min <= inner <= max).
     *
     *  @param {*} minValue - The minimum threshold.
     *  @param {*} maxValue - The maximum threshold.
     *  @return {Traverse} - Self.
     */
    this.range = function(minValue, maxValue) {
        return self.min(minValue).max(maxValue);
    };

    /**
     *  Select an item from specific array (use inner object as the index).
     *
     *  @param {Array} from - The array.
     *  @return {Traverse} - Traverse object of selected item.
     */
    this.selectFromArray = function(from) {
        //  Check from object.
        if (!Array.isArray(from)) {
            throw new Error("Traverse::selectFromArray(): Expect an array object.");
        }

        //  Check inner type.
        self.notNull().integer().min(0).maxExclusive(from.length);

        //  Wrap new object.
        return new Traverse(from[inner], _GetSubPath(Util.format(
            "[%d]",
            inner
        )));
    };

    /**
     *  Select an item from specific object (use inner object as the key).
     *
     *  @param {Object} from - The object.
     *  @return {Traverse} - Traverse object of selected item.
     */
    this.selectFromObject = function(from) {
        //  Check from object.
        if (!(from instanceof Object)) {
            throw new Error("Traverse::selectFromObject(): Expect an object.");
        }

        //  Check inner type.
        self.notNull().typeOf(String);

        //  Check key existence.
        if (!(inner in from)) {
            throw new Error(Util.format(
                "Traverse::selectFromObject(): \"%s\" doesn't exist (path=\"%s\").",
                inner,
                path
            ));
        }

        //  Wrap new object.
        return new Traverse(from[inner], _GetSubPath(inner));
    };

    /**
     *  Select an optional item from specific object (use inner object as the key).
     *
     *  @param {Object} from - The object.
     *  @param {*} defaultValue - The default value when the key doesn't exist.
     *  @return {Traverse} - Traverse object of selected item.
     */
    this.selectFromObjectOptional = function(from, defaultValue) {
        try {
            return self.selectFromObject(from);
        } catch(error) {
            return new Traverse(defaultValue, _GetSubPath(
                JSON.stringify(inner) || "(unrepresentable)"
            ));
        }
    };

    /**
     *  Select an item from specific map (use inner object as the key).
     *
     *  @param {Map} from - The map.
     *  @return {Traverse} - Traverse object of selected item.
     */
    this.selectFromMap = function(from) {
        //  Check from object.
        if (!(from instanceof Map)) {
            throw new Error("Traverse::selectFromMap(): Expect an object.");
        }

        //  Check inner object.
        self.notNull();

        //  Check key existence.
        if (!from.has(inner)) {
            throw new Error(Util.format(
                "Traverse::selectFromMap(): \"%s\" doesn't exist (path=\"%s\").",
                inner,
                path
            ));
        }

        //  Wrap new object.
        return new Traverse(from.get(inner), _GetSubPath(
            JSON.stringify(inner) || "(unrepresentable)"
        ));
    };

    /**
     *  Select an optional item from specific map (use inner object as the key).
     *
     *  @param {Map} from - The map.
     *  @param {*} defaultValue - The default value when the key doesn't exist.
     *  @return {Traverse} - Traverse object of selected item.
     */
    this.selectFromMapOptional = function(from, defaultValue) {
        try {
            return self.selectFromMap(from);
        } catch(error) {
            return new Traverse(defaultValue, _GetSubPath(
                JSON.stringify(inner) || "(unrepresentable)"
            ));
        }
    };

    /**
     *  Iterate an object.
     *
     *  @param {function(Traverse): void} callback - The map.
     *  @return {Traverse} - Self.
     */
    this.objectForEach = function(callback) {
        //  Check type.
        self.notNull().typeOf(Object);

        //  Scan all keys.
        for (var key in inner) {
            callback.call(self, new Traverse(inner[key], _GetSubPath(key)));
        }

        return self;
    };

    /**
     *  Set a key-value pair within an object.
     *
     *  @param {String} key - The key.
     *  @param {*} value - The value.
     */
    this.objectSet = function(key, value) {
        //  Check type.
        self.notNull().typeOf(Object);

        //  Set the key pair.
        inner[key] = value;

        return self;
    };

    /**
     *  Iterate an array.
     *
     *  @param {function(Traverse): void} callback - The map.
     *  @return {Traverse} - Self.
     */
    this.arrayForEach = function(callback) {
        //  Check type.
        self.notNull().typeOf(Array);

        //  Scan all items.
        for (var i = 0; i < inner.length; ++i) {
            callback.call(self, new Traverse(inner[i], _GetSubPath(Util.format("[%d]", i))));
        }

        return self;
    };

    /**
     *  Iterate an array with deletion.
     *
     *  @param {function(Traverse): Boolean} callback - The map.
     *  @return {Traverse} - Self.
     */
    this.arrayForEachWithDeletion = function(callback) {
        //  Check type.
        self.notNull().typeOf(Array);

        //  Scan all items.
        var cursor = 0;
        while (cursor < inner.length) {
            var isDelete = callback.call(self, new Traverse(inner[cursor], _GetSubPath(Util.format("[%d]", cursor))));
            if (isDelete) {
                inner.splice(cursor, 1);
            } else {
                ++cursor;
            }
        }

        return self;
    };

    /**
     *  Assume the array has a minimum length.
     *
     *  @param {Number} minLength - The minimum length.
     *  @return {Traverse} - Self.
     */
    this.arrayMinLength = function(minLength) {
        //  Check type.
        self.notNull().typeOf(Array);

        //  Check array length.
        var currentLength = inner.length;
        if (currentLength < minLength) {
            throw new Error(Util.format(
                "Traverse::arrayMinLength(): Array should have at least %d item(s) (path=\"%s\", current=%d).",
                minLength,
                path,
                currentLength
            ));
        }

        return self;
    };

    /**
     *  Assume the array has a maximum length.
     *
     *  @param {Number} maxLength - The maximum length.
     *  @return {Traverse} - Self.
     */
    this.arrayMaxLength = function(maxLength) {
        //  Check type.
        self.notNull().typeOf(Array);

        //  Check array length.
        var currentLength = inner.length;
        if (currentLength > maxLength) {
            throw new Error(Util.format(
                "Traverse::arrayMaxLength(): Array should have at most %d item(s) (path=\"%s\", current=%d).",
                maxLength,
                path,
                currentLength
            ));
        }

        return self;
    };

    /**
     *  Get whether the inner object is NULL.
     *
     *  @return {Boolean} - True if so.
     */
    this.isNull = function() {
        return inner === null;
    };

    /**
     *  Assume that the inner object is in specific selections.
     *
     *  @param {Set | Map | Array | Object} selections - The selections.
     *  @return {Traverse} - Self.
     */
    this.oneOf = function(selections) {
        if (inner !== null) {
            var has = false;
            if (selections instanceof Set) {
                has = selections.has(inner);
            } else if (selections instanceof Map) {
                has = selections.has(inner);
            } else if (selections instanceof Array) {
                has = (selections.indexOf(inner) >= 0);
            } else if (selections instanceof Object) {
                has = (inner in selections);
            } else {
                throw new Error("Traverse::oneOf(): Unsupported selections type (only Map/Set/Array/Object is valid).");
            }
            if (!has) {
                throw new Error(Util.format(
                    "Traverse::oneOf(): \"%s\" is not available.",
                    JSON.stringify(inner) || "(unrepresentable)"
                ));
            }
        }

        return self;
    }

    /**
     *  Get the inner object.
     *
     *  @return {*} - The inner object.
     */
    this.inner = function() {
        return inner;
    };
}

//
//  Public functions.
//

/**
 *  Wrap an object with Traverse.
 *
 *  @param {*} inner - The inner object.
 *  @param {Boolean} force - Still wrap the object when the inner object is a Traverse.
 *  @return {Traverse} - The traverse object.
 */
function WrapObject(inner, force) {
    if ((inner instanceof Traverse) && !force) {
        return inner;
    } else {
        return new Traverse(inner, "/");
    }
}

//  Export public APIs.
module.exports = {
    "Traverse": Traverse,
    "WrapObject": WrapObject
};