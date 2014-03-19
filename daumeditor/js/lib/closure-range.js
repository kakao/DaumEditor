// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 */

/**
 * Base namespace for the Closure library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 *
 * @const
 */
var goog = _WIN.goog = _WIN.goog || {};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = _WIN;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.LOCALE = 'en';  // default to en


/**
 * Creates object stubs for a namespace. When present in a file, goog.provide
 * also indicates that the file defines the indicated object. Calls to
 * goog.provide are resolved by the compiler if --closure_pass is set.
 * @param {string} name name of the object that this file defines.
 */
goog.provide = function(name) {
  goog.exportPath_(name);
};


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return _FALSE for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return _FALSE and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case
           typeof value.length == 'number' &&
           typeof value.splice != _UNDEFINED+'' &&
           typeof value.propertyIsEnumerable != _UNDEFINED+'' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != _UNDEFINED+'' &&
          typeof value.propertyIsEnumerable != _UNDEFINED+'' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }


    } else {
      return _NULL+'';
    }

  } else if (s == 'function' && typeof value.call == _UNDEFINED+'') {
    // In Safari typeof nodeList returns 'function', and on Firefox
    // typeof behaves similarly for HTML{Applet,Embed,Object}Elements
    // and RegExps.  We would like to return object for those and we can
    // detect an invalid function by making sure that the function
    // object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== _UNDEFINED;
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === _NULL;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != _NULL;
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == 'object' || type == 'array' || type == 'function';
};


/**
 * Gets a unique ID for an object. This mutates the object so that further
 * calls with the same object as a parameter returns the same value. The unique
 * ID is guaranteed to be unique across the current session amongst objects that
 * are passed into {@code getUid}. There is no guarantee that the ID is unique
 * or consistent across sessions. It is unsafe to generate unique ID for
 * function prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(user): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns _FALSE so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure javascript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Forward declaration for the clone method. This is necessary until the
 * compiler can better support duck-typing constructs as used in
 * goog.cloneObject.
 *
 * TODO(user): Remove once the JSCompiler can infer that the check for
 * proto.clone is safe in goog.cloneObject.
 *
 * @type {Function}
 */
Object.prototype.clone;


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run. If the value is null or undefined, it
 *     will default to the global object.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind
 *     is deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run. If the value is null or undefined, it
 *     will default to the global object.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  var context = selfObj || goog.global;

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(context, newArgs);
    };

  } else {
    return function() {
      return fn.apply(context, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run. If the value is null or undefined, it
 *     will default to the global object.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default
      // Chrome extension environment. This means that for Chrome extensions,
      // they get the implementation of Function.prototype.bind that
      // calls goog.bind instead of the native one. Even worse, we don't want
      // to introduce a circular dependency between goog.bind and
      // Function.prototype.bind, so we have to hack this to make sure it
      // works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(_NULL, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = Date.now || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   ParentClass.call(this, a, b);
 * }
 *
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = _FALSE;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = _TRUE;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};

/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};

/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} True if {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
// FTDUEDTR-1183
goog.string.stripNewlines = function(str) {
  return str.replace(/ ?(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};

/**
 * Escape double quote '"' characters in addition to '&', '<', and '>' so that a
 * string can be included in an HTML tag attribute value within double quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave _FALSE if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, '&amp;')
          .replace(goog.string.ltRe_, '&lt;')
          .replace(goog.string.gtRe_, '&gt;')
          .replace(goog.string.quotRe_, '&quot;');

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.allRe_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.amperRe_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.ltRe_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.gtRe_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, '&quot;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.amperRe_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.ltRe_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.gtRe_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.quotRe_ = /\"/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @type {RegExp}
 * @private
 */
goog.string.allRe_ = /[&<>\"]/;


/**
 * Checks whether a string contains a given character.
 * @param {string} s The string to test.
 * @param {string} ss The substring to test for.
 * @return {boolean} True if {@code s} contains {@code ss}.
 */
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};

/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

//goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.userAgent.ASSUME_IE = _FALSE;


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.userAgent.ASSUME_GECKO = _FALSE;


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.userAgent.ASSUME_WEBKIT = _FALSE;


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.userAgent.ASSUME_MOBILE_WEBKIT = _FALSE;


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.userAgent.ASSUME_OPERA = _FALSE;


/**
 * @define {boolean} Whether the
 *     {@code goog.userAgent.isVersionOrHigher}
 *     function will return true for any version.
 */
goog.userAgent.ASSUME_ANY_VERSION = _FALSE;


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 * Some user agents (I'm thinking of you, Gears WorkerPool) do not expose a
 * navigator object off the global scope.  In that case we return null.
 *
 * @return {?string} The userAgent string or null if there is none.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : _NULL;
};


/**
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (goog.gears.FakeWorkerPool, for example).
  return goog.global['navigator'];
};


/**
 * Initializer for goog.userAgent.
 *
 * This is a named function so that it can be stripped via the jscompiler
 * option for stripping types.
 * @private
 */
goog.userAgent.init_ = function() {
  /**
   * Whether the user agent string denotes Opera.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedOpera_ = _FALSE;

  /**
   * Whether the user agent string denotes Internet Explorer. This includes
   * other browsers using Trident as its rendering engine. For example AOL
   * and Netscape 8
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIe_ = _FALSE;

  /**
   * Whether the user agent string denotes WebKit. WebKit is the rendering
   * engine that Safari, Android and others use.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWebkit_ = _FALSE;

  /**
   * Whether the user agent string denotes a mobile device.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMobile_ = _FALSE;

  /**
   * Whether the user agent string denotes Gecko. Gecko is the rendering
   * engine used by Mozilla, Mozilla Firefox, Camino and many more.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedGecko_ = _FALSE;

  var ua;
  if (!goog.userAgent.BROWSER_KNOWN_ &&
      (ua = goog.userAgent.getUserAgentString())) {
      var navigator = goog.userAgent.getNavigator();
      goog.userAgent.detectedOpera_ = goog.string.startsWith(ua, 'Opera');
      goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ &&
          (goog.string.contains(ua, 'MSIE') ||
              goog.string.contains(ua, 'Trident'));
      goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ &&
          goog.string.contains(ua, 'WebKit');
      // WebKit also gives navigator.product string equal to 'Gecko'.
      goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ &&
          goog.string.contains(ua, 'Mobile');
      goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ &&
          !goog.userAgent.detectedWebkit_ && !goog.userAgent.detectedIe_ &&
          navigator.product == 'Gecko';
  }
};


if (!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_();
}


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;


/**
 * Whether the user agent is Internet Explorer. This includes other browsers
 * using Trident as its rendering engine. For example AOL and Netscape 8
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Mozilla Firefox, Camino and many more.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.userAgent.detectedGecko_;


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.userAgent.detectedWebkit_;


/**
 * Whether the user agent is running on a mobile device.
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.detectedMobile_;


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.userAgent.ASSUME_MAC = _FALSE;


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.userAgent.ASSUME_WINDOWS = _FALSE;


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.userAgent.ASSUME_LINUX = _FALSE;


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.userAgent.ASSUME_X11 = _FALSE;


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11;


/**
 * Initialize the goog.userAgent constants that define which platform the user
 * agent is running on.
 * @private
 */
goog.userAgent.initPlatform_ = function() {
  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMac_ =goog.string.contains(goog.userAgent.PLATFORM,
      'Mac');

  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWindows_ = goog.string.contains(
      goog.userAgent.PLATFORM, 'Win');

  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Linux');

  /**
   * Whether the user agent is running on a X11 windowing system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() &&
      goog.string.contains(goog.userAgent.getNavigator()['appVersion'] || '',
          'X11');
};


if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;


/**
 * Whether the user agent is running on a Linux operating system.
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re;

  if (goog.userAgent.OPERA && goog.global['opera']) {
    var operaVersion = goog.global['opera'].version;
    version = typeof operaVersion == 'function' ? operaVersion() : operaVersion;
  } else {
    if (goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/;
    } else if (goog.userAgent.IE) {
      re = /MSIE\s+([^\);]+)(\)|;)/;
    } else if (goog.userAgent.WEBKIT) {
      // WebKit/125.4
      re = /WebKit\/(\S+)/;
    }
    if (re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : '';
    }
  }
  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : _UNDEFINED;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
    return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersion}. Calls to compareVersions are
 * surprisingly expensive and as a browsers version number is unlikely to change
 * during a session we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isVersionOrHigherCache_ = {};

/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersionOrHigher = function(version) {
    return goog.userAgent.ASSUME_ANY_VERSION ||
        goog.userAgent.isVersionOrHigherCache_[version] ||
        (goog.userAgent.isVersionOrHigherCache_[version] =
            goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Deprecated alias to {@code goog.userAgent.isVersionOrHigher}.
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 * @deprecated Use goog.userAgent.isVersionOrHigher().
 */
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;

/**
 * Cache for {@link goog.userAgent.isDocumentMode}.
 * Browsers document mode version number is unlikely to change during a session
 * we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isDocumentModeCache_ = {};


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
    return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode;
};


/**
 * Deprecated alias to {@code goog.userAgent.isDocumentModeOrHigher}.
 * @param {number} version The version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *      same as the given version.
 * @deprecated Use goog.userAgent.isDocumentModeOrHigher().
 */
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;


/**
 * For IE version < 7, documentMode is undefined, so attempt to use the
 * CSS1Compat property to see if we are in standards mode. If we are in
 * standards mode, treat the browser version as the document mode. Otherwise,
 * IE is emulating version 5.
 * @type {number|undefined}
 * @const
 */
goog.userAgent.DOCUMENT_MODE = (function() {
    var doc = goog.global['document'];
    if (!doc || !goog.userAgent.IE) {
        return undefined;
    }
    var mode = goog.userAgent.getDocumentMode_();
    return mode || (doc['compatMode'] == 'CSS1Compat' ?
        parseInt(goog.userAgent.VERSION, 10) : 5);
})();

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating arrays.
 *
 */


goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');

/**
 * @define {boolean} NATIVE_ARRAY_PROTOTYPES indicates whether the code should
 * rely on Array.prototype functions, if available.
 *
 * The Array.prototype functions can be defined by external libraries like
 * Prototype and setting this flag to _FALSE forces closure to use its own
 * goog.array implementation.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on the prototype functions, specify
 * "--define goog.NATIVE_ARRAY_PROTOTYPES=_FALSE" to the JSCompiler.
 */
goog.NATIVE_ARRAY_PROTOTYPES = _TRUE;


/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
goog.array.ArrayLike;


/**
 * Returns the last element in an array without removing it.
 * @param {goog.array.ArrayLike} array The array.
 * @return {*} Last item in array.
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Reference to the original {@code Array.prototype}.
 * @private
 */
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;


// NOTE(user): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified
 * value, or -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 */
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.indexOf ?
    function(arr, obj, opt_fromIndex) {
      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == _NULL ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };

/**
 * Calls a function for each element in an array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored. The function is called only for indexes of the array
 *     which have assigned values; it is not called for indexes which have
 *     been deleted or which have never been assigned values.
 *
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.forEach ?
    function(arr, f, opt_obj) {
      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is _FALSE the element is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 */
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    goog.array.ARRAY_PROTOTYPE_.filter ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return something. The result will be inserted into a new array.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array with the results from f.
 */
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 goog.array.ARRAY_PROTOTYPE_.map ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return _FALSE, some() returns _FALSE.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 */
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  goog.array.ARRAY_PROTOTYPE_.some ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return _TRUE;
        }
      }
      return _FALSE;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns _FALSE, every() returns _FALSE and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} _FALSE if any element fails the test.
 */
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   goog.array.ARRAY_PROTOTYPE_.every ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return _FALSE;
        }
      }
      return _TRUE;
    };


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Does a shallow copy of an array.
 * @param {goog.array.ArrayLike} arr  Array or array-like object to clone.
 * @return {!Array} Clone of the input array.
 */
goog.array.clone = function(arr) {
  if (goog.isArray(arr)) {
    return goog.array.concat(/** @type {!Array} */ (arr));
  } else { // array like
    // Concat does not work with non arrays.
    var rv = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      rv[i] = arr[i];
    }
    return rv;
  }
};


/**
 * Converts an object to an array.
 * @param {goog.array.ArrayLike} object  The object to convert to an array.
 * @return {!Array} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 */
goog.array.toArray = function(object) {
  if (goog.isArray(object)) {
    // This fixes the JS compiler warning and forces the Object to an Array type
    return goog.array.concat(/** @type {!Array} */ (object));
  }
  // Clone what we hope to be an array-like object to an array.
  // We could check isArrayLike() first, but no check we perform would be as
  // reliable as simply making the call.
  return goog.array.clone(/** @type {Array} */ (object));
};


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...*} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array} the removed elements.
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array from which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array} A new array containing the specified segment of the original
 *     array.
 */
goog.array.slice = function(arr, start, opt_end) {
  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
 * but will give unpredictable results for heterogenous lists of strings and
 * numbers with different numbers of digits.
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array} arr The array to be sorted.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(user): Update type annotation since null is not accepted.
  goog.array.ARRAY_PROTOTYPE_.sort.call(
      arr, opt_compareFn || goog.array.defaultCompare);
};


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
    return _FALSE;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return _FALSE;
    }
  }
  return _TRUE;
};


/**
 * @deprecated Use {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr1 See {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr2 See {@link goog.array.equals}.
 * @param {Function=} opt_equalsFn See {@link goog.array.equals}.
 * @return {boolean} See {@link goog.array.equals}.
 */
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn);
};


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {*} a The first object to be compared.
 * @param {*} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second.
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, _FALSE otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {*} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array.<*>} An array with the repeated value.
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for adding, removing and setting classes.
 *
 */


goog.provide('goog.dom.classes');

//goog.require('goog.array');
/**
 * Gets an array of class names on an element
 * @param {Node} element DOM node to get class of.
 * @return {Array} Class names on {@code element}.
 */
goog.dom.classes.get = function(element) {
  var className = element.className;
  // Some types of elements don't have a className in IE (e.g. iframes).
  // Furthermore, in Firefox, className is not a string when the element is
  // an SVG element.
  return className && typeof className.split == 'function' ?
      className.split(/\s+/) : [];
};


/**
 * Adds a class or classes to an element. Does not add multiples of class names.
 * @param {Node} element DOM node to add class to.
 * @param {...string} var_args Class names to add.
 * @return {boolean} Whether class was added (or all classes were added).
 */
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);

  var b = goog.dom.classes.add_(classes, args);
  element.className = classes.join(' ');

  return b;
};


/**
 * Helper method for {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.addRemove}. Adds one or more classes to the supplied
 * classes array.
 * @param {Array.<string>} classes All class names for the element, will be
 *     updated to have the classes supplied in {@code args} added.
 * @param {Array.<string>} args Class names to add.
 * @return {boolean} Whether all classes in were added.
 * @private
 */
goog.dom.classes.add_ = function(classes, args) {
  var rv = 0;
  for (var i = 0; i < args.length; i++) {
    if (!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
      rv++;
    }
  }
  return rv == args.length;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and the return value is irrelevant.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This
 *     function takes 3 arguments (the element, the index and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is _FALSE the
 *     element is not included.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object in which only elements that passed the test
 *     are present.
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object with the results from f.
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns _FALSE, returns
 * _FALSE at this point and does not continue to check the remaining elements.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} _FALSE if any element fails the test.
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return _FALSE;
    }
  }
  return _TRUE;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The object for which to check.
 * @return {boolean} true if val is present.
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the values.
 * @return {!Array} The values in the object/map/hash.
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array.<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return _TRUE;
    }
  }
  return _FALSE;
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return _FALSE;
  }
  return _TRUE;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} val The value to add.
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {*} The value for the given key.
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add.
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object} obj Object to clone.
 * @return {!Object} Clone of the input object.
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array.<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {c: 2});
 * o; // {a: 0, b: 1, c: 2}
 *
 * @param {Object} target  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(_NULL, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the goog.dom.TagName enum.  This enumerates
 * all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html.
 */
goog.provide('goog.dom.TagName');


/**
 * Enum of all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html
 * @enum {string}
 */
goog.dom.TagName = {
  A: 'A',
  ABBR: 'ABBR',
  ACRONYM: 'ACRONYM',
  ADDRESS: 'ADDRESS',
  APPLET: 'APPLET',
  AREA: 'AREA',
  B: 'B',
  BASE: 'BASE',
  BASEFONT: 'BASEFONT',
  BDO: 'BDO',
  BIG: 'BIG',
  BLOCKQUOTE: 'BLOCKQUOTE',
  BODY: 'BODY',
  BR: 'BR',
  BUTTON: 'BUTTON',
  CANVAS: 'CANVAS',
  CAPTION: 'CAPTION',
  CENTER: 'CENTER',
  CITE: 'CITE',
  CODE: 'CODE',
  COL: 'COL',
  COLGROUP: 'COLGROUP',
  DD: 'DD',
  DEL: 'DEL',
  DFN: 'DFN',
  DIR: 'DIR',
  DIV: 'DIV',
  DL: 'DL',
  DT: 'DT',
  EM: 'EM',
  FIELDSET: 'FIELDSET',
  FONT: 'FONT',
  FORM: 'FORM',
  FRAME: 'FRAME',
  FRAMESET: 'FRAMESET',
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  HEAD: 'HEAD',
  HR: 'HR',
  HTML: 'HTML',
  I: 'I',
  IFRAME: 'IFRAME',
  IMG: 'IMG',
  INPUT: 'INPUT',
  INS: 'INS',
  ISINDEX: 'ISINDEX',
  KBD: 'KBD',
  LABEL: 'LABEL',
  LEGEND: 'LEGEND',
  LI: 'LI',
  LINK: 'LINK',
  MAP: 'MAP',
  MENU: 'MENU',
  META: 'META',
  NOFRAMES: 'NOFRAMES',
  NOSCRIPT: 'NOSCRIPT',
  OBJECT: 'OBJECT',
  OL: 'OL',
  OPTGROUP: 'OPTGROUP',
  OPTION: 'OPTION',
  P: 'P',
  PARAM: 'PARAM',
  PRE: 'PRE',
  Q: 'Q',
  S: 'S',
  SAMP: 'SAMP',
  SCRIPT: 'SCRIPT',
  SELECT: 'SELECT',
  SMALL: 'SMALL',
  SPAN: 'SPAN',
  STRIKE: 'STRIKE',
  STRONG: 'STRONG',
  STYLE: 'STYLE',
  SUB: 'SUB',
  SUP: 'SUP',
  TABLE: 'TABLE',
  TBODY: 'TBODY',
  TD: 'TD',
  TEXTAREA: 'TEXTAREA',
  TFOOT: 'TFOOT',
  TH: 'TH',
  THEAD: 'THEAD',
  TITLE: 'TITLE',
  TR: 'TR',
  TT: 'TT',
  U: 'U',
  UL: 'UL',
  VAR: 'VAR'
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional sizes.
 */


goog.provide('goog.math.Size');



/**
 * Class for representing sizes consisting of a width and height. Undefined
 * width and height support is deprecated and results in compiler warning.
 * @param {number} width Width.
 * @param {number} height Height.
 * @constructor
 */
goog.math.Size = function(width, height) {
  /**
   * Width
   * @type {number}
   */
  this.width = width;

  /**
   * Height
   * @type {number}
   */
  this.height = height;
};


/**
 * Compares sizes for equality.
 * @param {goog.math.Size} a A Size.
 * @param {goog.math.Size} b A Size.
 * @return {boolean} True iff the sizes have equal widths and equal
 *     heights, or if both are null.
 */
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return _TRUE;
  }
  if (!a || !b) {
    return _FALSE;
  }
  return a.width == b.width && a.height == b.height;
};


/**
 * @return {!goog.math.Size} A new copy of the Size.
 */
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};


/**
 * @return {number} The area of the size (width * height).
 */
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};


/**
 * @return {boolean} True if the size has zero area, _FALSE if both dimensions
 *     are non-zero numbers.
 */
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the dom package.
 *
 */


goog.provide('goog.dom.BrowserFeature');

//goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.dom.BrowserFeature = {
  /**
   * Whether attributes 'name' and 'type' can be added to an element after it's
   * created. _FALSE in Internet Explorer prior to version 9.
   */
  CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: !goog.userAgent.IE ||
      goog.userAgent.isVersion('9'),

  /**
   * Whether we can use element.children to access an element's Element
   * children. Available since Gecko 1.9.1, IE 9. (IE<9 also includes comment
   * nodes in the collection.)
   */
  CAN_USE_CHILDREN_ATTRIBUTE: !goog.userAgent.GECKO && !goog.userAgent.IE ||
      goog.userAgent.IE && goog.userAgent.isVersion('9') ||
      goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1'),

  /**
   * Opera, Safari 3, and Internet Explorer 9 all support innerText but they
   * include text nodes in script and style tags.
   */
  CAN_USE_INNER_TEXT: goog.userAgent.IE && !goog.userAgent.isVersion('9'),

  /**
   * Whether NoScope elements need a scoped element written before them in
   * innerHTML.
   * MSDN: http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx#1
   */
  INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional positions.
 */


goog.provide('goog.math.Coordinate');



/**
 * Class for representing coordinates and positions.
 * @param {number=} opt_x Left, defaults to 0.
 * @param {number=} opt_y Top, defaults to 0.
 * @constructor
 */
goog.math.Coordinate = function(opt_x, opt_y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = goog.isDef(opt_x) ? opt_x : 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};


/**
 * Returns a new copy of the coordinate.
 * @return {!goog.math.Coordinate} A clone of this coordinate.
 */
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};


/**
 * Compares coordinates for equality.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return _TRUE;
  }
  if (!a || !b) {
    return _FALSE;
  }
  return a.x == b.x && a.y == b.y;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating the browser's Document Object Model
 * Inspiration taken *heavily* from mochikit (http://mochikit.com/).
 *
 * You can use {@link goog.dom.DomHelper} to create new dom helpers that refer
 * to a different document object.  This is useful if you are working with
 * frames or multiple windows.
 *
 */


// TODO(user): Rename/refactor getTextContent and getRawTextContent. The problem
// is that getTextContent should mimic the DOM3 textContent. We should add a
// getInnerText (or getText) which tries to return the visible text, innerText.


goog.provide('goog.dom');
goog.provide('goog.dom.DomHelper');
goog.provide('goog.dom.NodeType');

//goog.require('goog.array');
//goog.require('goog.dom.BrowserFeature');
//goog.require('goog.dom.TagName');
//goog.require('goog.dom.classes');
//goog.require('goog.math.Coordinate');
//goog.require('goog.math.Size');
//goog.require('goog.object');
//goog.require('goog.string');
//goog.require('goog.userAgent');


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * quirks mode.
 */
goog.dom.ASSUME_QUIRKS_MODE = _FALSE;


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * standards compliance mode.
 */
goog.dom.ASSUME_STANDARDS_MODE = _FALSE;


/**
 * Whether we know the compatibility mode at compile time.
 * @type {boolean}
 * @private
 */
goog.dom.COMPAT_MODE_KNOWN_ =
    goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;


/**
 * Enumeration for DOM node types (for reference)
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};


/**
 * Gets the DomHelper object for the document where the element resides.
 * @param {Node|Window=} opt_element If present, gets the DomHelper for this
 *     element.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ?
      new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) :
      (goog.dom.defaultDomHelper_ ||
          (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper()));
};


/**
 * Cached default DOM helper.
 * @type {goog.dom.DomHelper}
 * @private
 */
goog.dom.defaultDomHelper_;


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.getDocument = function() {
  return document;
};


/**
 * Alias for getElementById. If a DOM node is passed in then we just return
 * that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.getElement = function(element) {
  return goog.isString(element) ?
      _DOC.getElementById(element) : element;
};


/**
 * Alias for getElement.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.getElement} instead.
 */
goog.dom.$ = goog.dom.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. This function
 * is a useful, if limited, way of collecting a list of DOM elements
 * with certain characteristics.  {@code goog.dom.query} offers a
 * more powerful and general solution which allows matching on CSS3
 * selector expressions, but at increased cost in code size. If all you
 * need is particular tags belonging to a single class, this function
 * is fast and sleek.
 *
 * @see {goog.dom.query}
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Document|Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class,
                                                opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {!string} className the name of the class to look for.
 * @param {Document|Element=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if (goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll('.' + className);
  } else if (parent.getElementsByClassName) {
    return parent.getElementsByClassName(className);
  }
  return goog.dom.getElementsByTagNameAndClass_(
      document, '*', className, opt_el);
};


/**
 * Returns the first element with the provided className.
 * @see {goog.dom.query}
 * @param {!string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return {Element} The first item with the class name provided.
 */
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = _NULL;
  if (goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector('.' + className);
  } else {
    retVal = goog.dom.getElementsByClass(className, opt_el)[0];
  }
  return retVal || _NULL;
};


/**
 * Prefer the standardized (http://www.w3.org/TR/selectors-api/), native and
 * fast W3C Selectors API. However, the version of WebKit that shipped with
 * Safari 3.1 and Chrome has a bug where it will not correctly match mixed-
 * case class name selectors in quirks mode.
 * @param {!Element|Document} parent The parent document object.
 * @return {boolean} whether or not we can use parent.querySelector* APIs.
 * @private
 */
goog.dom.canUseQuerySelector_ = function(parent) {
  return parent.querySelectorAll &&
         parent.querySelector &&
         (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) ||
          goog.userAgent.isVersion('528'));
};


/**
 * Helper for {@code getElementsByTagNameAndClass}.
 * @param {!Document} doc The document to get the elements in.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Document|Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @private
 */
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class,
                                                  opt_el) {
  var parent = opt_el || doc;
  var tagName = (opt_tag && opt_tag != '*') ? opt_tag.toUpperCase() : '';

  if (goog.dom.canUseQuerySelector_(parent) &&
      (tagName || opt_class)) {
    var query = tagName + (opt_class ? '.' + opt_class : '');
    return parent.querySelectorAll(query);
  }

  // Use the native getElementsByClassName if available, under the assumption
  // that even when the tag name is specified, there will be fewer elements to
  // filter through when going by class than by tag name
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);

    if (tagName) {
      var arrayLike = {};
      var len = 0;

      // Filter for specific tags if requested.
      for (var i = 0, el; el = els[i]; i++) {
        if (tagName == el.nodeName) {
          arrayLike[len++] = el;
        }
      }
      arrayLike.length = len;

      return arrayLike;
    } else {
      return els;
    }
  }

  var els = parent.getElementsByTagName(tagName || '*');

  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el; el = els[i]; i++) {
      var className = el.className;
      // Check if className has a split function since SVG className does not.
      if (typeof className.split == 'function' &&
          goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @deprecated Use {@link goog.dom.getElementsByTagNameAndClass} instead.
 */
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;


/**
 * Sets multiple properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == 'style') {
      element.style.cssText = val;
    } else if (key == 'class') {
      element.className = val;
    } else if (key == 'for') {
      element.htmlFor = val;
    } else if (key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
    } else {
      element[key] = val;
    }
  });
};


/**
 * Map of attributes that should be set using
 * element.setAttribute(key, val) instead of element[key] = val.  Used
 * by goog.dom.setProperties.
 *
 * @type {Object}
 * @private
 */
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'colspan': 'colSpan',
  'rowspan': 'rowSpan',
  'valign': 'vAlign',
  'height': 'height',
  'width': 'width',
  'usemap': 'useMap',
  'frameborder': 'frameBorder',
  'maxlength': 'maxLength',
  'type': 'type'
};


/**
 * Gets the dimensions of the viewport.
 *
 * Gecko Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of document.
 *
 * Gecko Backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * IE6/7 Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of document element.
 *
 * IE5 + IE6/7 Backwards compatible mode:
 * docEl.clientWidth  0.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight 0.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * Opera 9 Standards and backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * WebKit:
 * Safari 2
 * docEl.clientHeight Same as scrollHeight.
 * docEl.clientWidth  Same as innerWidth.
 * win.innerWidth     Width of viewport excluding scrollbar.
 * win.innerHeight    Height of the viewport including scrollbar.
 * frame.innerHeight  Height of the viewport exluding scrollbar.
 *
 * Safari 3 (tested in 522)
 *
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * docEl.clientHeight Height of viewport excluding scrollbar in strict mode.
 * body.clientHeight  Height of viewport excluding scrollbar in quirks mode.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.getViewportSize = function(opt_window) {
  // TODO(user): This should not take an argument
  return goog.dom.getViewportSize_(opt_window || window);
};


/**
 * Helper for {@code getViewportSize}.
 * @param {Window} win The window to get the view port size for.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 * @private
 */
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;

  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersion('500') &&
      !goog.userAgent.MOBILE) {
    // TODO(user): Sometimes we get something that isn't a valid window
    // object. In this case we just revert to the current window. We need to
    // figure out when this happens and find a real fix for it.
    // See the comments on goog.dom.getWindow.
    if (typeof win.innerHeight == _UNDEFINED+'') {
      win = window;
    }
    var innerHeight = win.innerHeight;
    var scrollHeight = win.document.documentElement.scrollHeight;

    if (win == win.top) {
      if (scrollHeight < innerHeight) {
        innerHeight -= 15; // Scrollbars are 15px wide on Mac
      }
    }
    return new goog.math.Size(win.innerWidth, innerHeight);
  }

  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;

  return new goog.math.Size(el.clientWidth, el.clientHeight);
};


/**
 * Gets the window object associated with the given document.
 *
 * @param {Document=} opt_doc  Document object to get window for.
 * @return {Window} The window associated with the given document.
 */
goog.dom.getWindow = function(opt_doc) {
  // TODO(user): This should not take an argument.
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};


/**
 * Helper for {@code getWindow}.
 *
 * @param {!Document} doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 * @private
 */
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {string} tagName Tag to create.
 * @param {Object|Array.<string>|string=} opt_attributes If object, then a map
 *     of name-value pairs for attributes. If a string, then this is the
 *     className of the new element. If an array, the elements will be joined
 *     together as the className of the new element.
 * @param {...Object|string|Array|NodeList} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or NodeList,i
 *     its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};


/**
 * Helper for {@code createDom}.
 * @param {!Document} doc The document to create the DOM in.
 * @param {!Arguments} args Argument object passed from the callers. See
 *     {@code goog.dom.createDom} for details.
 * @return {!Element} Reference to a DOM node.
 * @private
 */
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];

  // Internet Explorer is dumb: http://msdn.microsoft.com/workshop/author/
  //                            dhtml/reference/properties/name_2.asp
  // Also does not allow setting of 'type' attribute on 'input' or 'button'.
  if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes &&
      (attributes.name || attributes.type)) {
    var tagNameArr = ['<', tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name),
                      '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type),
                      '"');

      // Clone attributes map to remove 'type' without mutating the input.
      var clone = {};
      goog.object.extend(clone, attributes);
      attributes = clone;
      delete attributes.type;
    }
    tagNameArr.push('>');
    tagName = tagNameArr.join('');
  }

  var element = doc.createElement(tagName);

  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else if (goog.isArray(attributes)) {
      goog.dom.classes.add.apply(_NULL, [element].concat(attributes));
    } else {
      goog.dom.setProperties(element, attributes);
    }
  }

  if (args.length > 2) {
    goog.dom.append_(doc, element, args, 2);
  }

  return element;
};


/**
 * Appends a node with text or other nodes.
 * @param {!Document} doc The document to create new nodes in.
 * @param {!Node} parent The node to append nodes to.
 * @param {!Arguments} args The values to add. See {@code goog.dom.append}.
 * @param {number} startIndex The index of the array to start from.
 * @private
 */
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    // TODO(user): More coercion, ala MochiKit?
    if (child) {
      parent.appendChild(goog.isString(child) ?
          doc.createTextNode(child) : child);
    }
  }

  for (var i = startIndex; i < args.length; i++) {
    var arg = args[i];
    // TODO(user): Fix isArrayLike to return _FALSE for a text node.
    if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      // If the argument is a node list, not a real array, use a clone,
      // because forEach can't be used to mutate a NodeList.
      goog.array.forEach(goog.dom.isNodeList(arg) ?
          goog.array.clone(arg) : arg,
          childHandler);
    } else {
      childHandler(arg);
    }
  }
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {string|Object=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...Object|string|Array|NodeList} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array, its
 *     children will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.createDom} instead.
 */
goog.dom.$dom = goog.dom.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.createElement = function(name) {
  return _DOC.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.createTextNode = function(content) {
  return _DOC.createTextNode(content);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, _FALSE otherwise.
 * @param {Document} doc The document to check.
 * @return {boolean} True if in CSS1-compatible mode.
 * @private
 */
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }

  return doc.compatMode == 'CSS1Compat';
};


/**
 * Determines if the given node can contain children, intended to be used for
 * HTML generation.
 *
 * IE natively supports node.canHaveChildren but has inconsistent behavior.
 * Prior to IE8 the base tag allows children and in IE9 all nodes return true
 * for canHaveChildren.
 *
 * In practice all non-IE browsers allow you to add children to any node, but
 * the behavior is inconsistent:
 *
 * <pre>
 *   var a = document.createElement('br');
 *   a.appendChild(document.createTextNode('foo'));
 *   a.appendChild(document.createTextNode('bar'));
 *   console.log(a.childNodes.length);  // 2
 *   console.log(a.innerHTML);  // Chrome: "", IE9: "foobar", FF3.5: "foobar"
 * </pre>
 *
 * TODO(user): Rename shouldAllowChildren() ?
 *
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.canHaveChildren_OLD = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return _FALSE;
  }
  switch (node.tagName) {
    case goog.dom.TagName.APPLET:
    case goog.dom.TagName.AREA:
    case goog.dom.TagName.BASE:
    case goog.dom.TagName.BR:
    case goog.dom.TagName.COL:
    case goog.dom.TagName.FRAME:
    case goog.dom.TagName.HR:
    case goog.dom.TagName.IMG:
    case goog.dom.TagName.INPUT:
    case goog.dom.TagName.IFRAME:
    case goog.dom.TagName.ISINDEX:
    case goog.dom.TagName.LINK:
    case goog.dom.TagName.NOFRAMES:
    case goog.dom.TagName.NOSCRIPT:
    case goog.dom.TagName.META:
    case goog.dom.TagName.OBJECT:
    case goog.dom.TagName.PARAM:
    case goog.dom.TagName.SCRIPT:
    case goog.dom.TagName.STYLE:
      return _FALSE;
  }
  return _TRUE;
};

goog.dom.TAGS_CANT_HAVE_CHILDREN = {
		APPLET: _TRUE,
		AREA: _TRUE,
		BASE: _TRUE,
		BR: _TRUE,
		COL: _TRUE,
		FRAME: _TRUE,
		HR: _TRUE,
		IMG: _TRUE,
		INPUT: _TRUE,
		IFRAME: _TRUE,
		ISINDEX: _TRUE,
		LINK: _TRUE,
		NOFRAMES: _TRUE,
		NOSCRIPT: _TRUE,
		META: _TRUE,
		OBJECT: _TRUE,
		PARAM: _TRUE,
		SCRIPT: _TRUE,
		STYLE: _TRUE
};
goog.dom.canHaveChildren = function(node) {
  return node.nodeType == goog.dom.NodeType.ELEMENT &&
      !goog.dom.TAGS_CANT_HAVE_CHILDREN[node.tagName];
};

/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.removeChildren = function(node) {
  // Note: Iterations over live collections can be slow, this is the fastest
  // we could find. The double parenthesis are used to prevent JsCompiler and
  // strict warnings.
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};


/**
 * Inserts a new node before an existing reference node (i.e. as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};


/**
 * Inserts a new node after an existing reference node (i.e. as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : _NULL;
};


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * Does nothing if the element is not in the document.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children; or undefined, if the element was not in the
 *     document to begin with.
 */
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    // Use IE DOM method (supported by Opera too) if available
    if (element.removeNode) {
      return /** @type {Element} */ (element.removeNode(_FALSE));
    } else {
      // Move all children of the original node up one level.
      while ((child = element.firstChild)) {
        parent.insertBefore(child, element);
      }

      // Detach the original element.
      return /** @type {Element} */ (goog.dom.removeNode(element));
    }
  }
};


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE DOM
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != _UNDEFINED+'') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.compareNodeOrder = function(node1, node2) {
  // Fall out quickly for equality.
  if (node1 == node2) {
    return 0;
  }

  // Use compareDocumentPosition where available
  if (node1.compareDocumentPosition) {
    // 4 is the bitmask for FOLLOWS.
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }

  // Process in IE using sourceIndex - we check to see if the first node has
  // a source index or if its parent has one.
  if ('sourceIndex' in node1 ||
      (node1.parentNode && 'sourceIndex' in node1.parentNode)) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;

    if (isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex;
    } else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;

      if (parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2);
      }

      if (!isElement1 && goog.dom.contains(parent1, node2)) {
        return -1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
      }


      if (!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
      }

      return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) -
             (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }

  // For Safari, we compare ranges.
  var doc = goog.dom.getOwnerDocument(node1);

  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(_TRUE);

  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(_TRUE);

  return range1.compareBoundaryPoints(goog.global['Range'].START_TO_END,
      range2);
};


/**
 * Utility function to compare the position of two nodes, when
 * {@code textNode}'s parent is an ancestor of {@code node}.  If this entry
 * condition is not met, this function will attempt to reference a null object.
 * @param {Node} textNode The textNode to compare.
 * @param {Node} node The node to compare.
 * @return {number} -1 if node is before textNode, +1 otherwise.
 * @private
 */
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    // If textNode is a child of node, then node comes first.
    return -1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};


/**
 * Utility function to compare the position of two nodes known to be non-equal
 * siblings.
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} -1 if node1 is before node2, +1 otherwise.
 * @private
 */
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while ((s = s.previousSibling)) {
    if (s == node1) {
      // We just found node1 before node2.
      return -1;
    }
  }

  // Since we didn't find it, node1 must be after node2.
  return 1;
};


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if (!count) {
    return _NULL;
  } else if (count == 1) {
    return arguments[0];
  }

  var paths = [];
  var minLength = Infinity;
  for (i = 0; i < count; i++) {
    // Compute the list of ancestors.
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }

    // Save the list for comparison.
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length);
  }
  var output = _NULL;
  for (i = 0; i < minLength; i++) {
    var first = paths[0][i];
    for (var j = 1; j < count; j++) {
      if (first != paths[j][i]) {
        return output;
      }
    }
    output = first;
  }
  return output;
};


/**
 * Returns the owner document for a node.
 * @param {Node|Window} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.getOwnerDocument = function(node) {
  // TODO(user): Remove IE5 code.
  // IE5 uses document instead of ownerDocument
  return /** @type {!Document} */ (
      node.nodeType == goog.dom.NodeType.DOCUMENT ? node :
      node.ownerDocument || node.document);
};

/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.getOuterHtml = function(element) {
  // IE, Opera and WebKit all have outerHTML.
  if ('outerHTML' in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement('div');
    div.appendChild(element.cloneNode(_TRUE));
    return div.innerHTML;
  }
};


/**
 * Map of tags whose content to ignore when calculating text length.
 * @type {Object}
 * @private
 */
goog.dom.TAGS_TO_IGNORE_ = {
  'SCRIPT': 1,
  'STYLE': 1,
  'HEAD': 1,
  'IFRAME': 1,
  'OBJECT': 1
};


/**
 * Map of tags which have predefined values with regard to whitespace.
 * @type {Object}
 * @private
 */
goog.dom.PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};


/**
 * Returns the text content of the current node, without markup and invisible
 * symbols. New lines are stripped and whitespace is collapsed,
 * such that each character would be visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.getTextContent = function(node) {
  var textContent;
  // Note(user): IE9, Opera, and Safara 3 support innerText but they include
  // text nodes in script tags. So we revert to use a user agent test here.
  if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && ('innerText' in node)) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
    // Unfortunately .innerText() returns text with &shy; symbols
    // We need to filter it out and then remove duplicate whitespaces
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, _TRUE);
    textContent = buf.join('');
  }

  // Strip &shy; entities. goog.format.insertWordBreaks inserts them in Opera.
  textContent = textContent.replace(/ \xAD /g, ' ').replace(/\xAD/g, '');
  // Strip &#8203; entities. goog.format.insertWordBreaks inserts them in IE8.
  textContent = textContent.replace(/\u200B/g, '');

  // Skip this replacement on IE, which automatically turns &nbsp; into ' '
  // and / +/ into ' ' when reading innerText.
  if (!goog.userAgent.IE) {
    textContent = textContent.replace(/ +/g, ' ');
  }
  if (textContent != ' ') {
    textContent = textContent.replace(/^\s*/, '');
  }

  return textContent;
};


/**
 * Returns the text content of the current node, without markup.
 *
 * Unlike {@code getTextContent} this method does not collapse whitespaces
 * or normalize lines breaks.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The raw text content.
 */
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, _FALSE);

  return buf.join('');
};


/**
 * Recursive support function for text content retrieval.
 *
 * @param {Node} node The node from which we are getting content.
 * @param {Array} buf string buffer.
 * @param {boolean} normalizeWhitespace Whether to normalize whitespace.
 * @private
 */
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    // ignore certain tags
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    if (normalizeWhitespace) {
      buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
    } else {
      buf.push(node.nodeValue);
    }
  } else if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
    buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
  } else {
    var child = node.firstChild;
    while (child) {
      goog.dom.getTextContent_(child, buf, normalizeWhitespace);
      child = child.nextSibling;
    }
  }
};


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.isNodeList = function(val) {
  // TODO(user): Now the isNodeList is part of goog.dom we can use
  // goog.userAgent to make this simpler.
  // A NodeList must have a length property of type 'number' on all platforms.
  if (val && typeof val.length == 'number') {
    // A NodeList is an object everywhere except Safari, where it's a function.
    if (goog.isObject(val)) {
      // A NodeList must have an item function (on non-IE platforms) or an item
      // property of type 'string' (on IE).
      return typeof val.item == 'function' || typeof val.item == 'string';
    } else if (goog.isFunction(val)) {
      // On Safari, a NodeList is a function with an item property that is also
      // a function.
      return typeof val.item == 'function';
    }
  }

  // Not a NodeList.
  return _FALSE;
};



/**
 * Create an instance of a DOM helper with a new document object.
 * @param {Document=} opt_document Document object to associate with this
 *     DOM helper.
 * @constructor
 */
goog.dom.DomHelper = function(opt_document) {
  /**
   * Reference to the document object to use
   * @type {!Document}
   * @private
   */
  this.document_ = opt_document || goog.global.document || document;
};


/**
 * Gets the dom helper object for the document where the element resides.
 * @param {Node=} opt_node If present, gets the DomHelper for this node.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;


/**
 * Sets the document object.
 * @param {!Document} document Document object.
 */
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};


/**
 * Alias for {@code getElementById}. If a DOM node is passed in then we just
 * return that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.DomHelper.prototype.getElement = function(element) {
  if (goog.isString(element)) {
    return this.document_.getElementById(element);
  } else {
    return element;
  }
};


/**
 * Alias for {@code getElement}.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.getElement} instead.
 */
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. The returned array is a live
 * NodeList or a static list depending on the code path taken.
 *
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name or * for all tags.
 * @param {?string=} opt_class Optional class name.
 * @param {Document|Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag,
                                                                     opt_class,
                                                                     opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag,
                                                opt_class, opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {!string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc);
};


/**
 * Returns the first element we find matching the provided class name.
 * @see {goog.dom.query}
 * @param {!string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return {Element} The first item found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc);
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @deprecated Use DomHelper getElementsByTagNameAndClass.
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.$$ =
    goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;


/**
 * Sets a number of properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;


/**
 * Gets the dimensions of the viewport.
 * @param {Window=} opt_window Optional window element to test. Defaults to
 *     the window of the Dom Helper.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  // TODO(user): This should not take an argument. That breaks the rule of a
  // a DomHelper representing a single frame/window/document.
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};


/**
 * Typedef for use with goog.dom.createDom and goog.dom.append.
 * @typedef {Object|string|Array|NodeList}
 */
goog.dom.Appendable;


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * An easy way to move all child nodes of an existing element to a new parent
 * element is:
 * <code>createDom('div', null, oldElement.childNodes);</code>
 * which will remove all child nodes from the old element and add them as
 * child nodes of the new DIV.
 *
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or
 *     NodeList, its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.DomHelper.prototype.createDom = function(tagName,
                                                  opt_attributes,
                                                  var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or strings for
 *     text nodes.  If one of the var_args is an array, its children will be
 *     added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.createDom} instead.
 */
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(content);
};


/**
 * Gets the window object associated with the document.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.DomHelper.prototype.append = goog.dom.append;


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;


/**
 * Inserts a new node before an existing reference node (i.e., as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;


/**
 * Inserts a new node after an existing reference node (i.e., as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children, or undefined if the element was already not in the
 *     document.
 */
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.DomHelper.prototype.contains = goog.dom.contains;


/**
 * Returns the owner document for a node.
 * @param {Node} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;


/**
 * Returns the text contents of the current node, without markup. New lines are
 * stripped and whitespace is collapsed, such that each character would be
 * visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Python style iteration utilities.
 */


goog.provide('goog.iter');
goog.provide('goog.iter.Iterator');
goog.provide('goog.iter.StopIteration');

//goog.require('goog.array');


// TODO(user): Add more functions from Python's itertools.
// http://docs.python.org/library/itertools.html


/**
 * @typedef {goog.iter.Iterator|{length:number}|{__iterator__}}
 */
goog.iter.Iterable;


// For script engines that already support iterators.
if ('StopIteration' in goog.global) {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   */
  goog.iter.StopIteration = goog.global['StopIteration'];
} else {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   * @suppress {duplicate}
   */
  goog.iter.StopIteration = Error('StopIteration');
}



/**
 * Class/interface for iterators.  An iterator needs to implement a {@code next}
 * method and it needs to throw a {@code goog.iter.StopIteration} when the
 * iteration passes beyond the end.  Iterators have no {@code hasNext} method.
 * It is recommended to always use the helper functions to iterate over the
 * iterator or in case you are only targeting JavaScript 1.7 for in loops.
 * @constructor
 */
goog.iter.Iterator = function() {};


/**
 * Returns the next value of the iteration.  This will throw the object
 * {@see goog.iter#StopIteration} when the iteration passes the end.
 * @return {*} Any object or value.
 */
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};


/**
 * Returns the {@code Iterator} object itself.  This is used to implement
 * the iterator protocol in JavaScript 1.7
 * @param {boolean=} opt_keys  Whether to return the keys or values. Default is
 *     to only return the values.  This is being used by the for-in loop (true)
 *     and the for-each-in loop (_FALSE).  Even though the param gives a hint
 *     about what the iterator will return there is no guarantee that it will
 *     return the keys when true is passed.
 * @return {!goog.iter.Iterator} The object itself.
 */
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};


/**
 * Returns an iterator that knows how to iterate over the values in the object.
 * @param {goog.iter.Iterable} iterable  If the object is an iterator it
 *     will be returned as is.  If the object has a {@code __iterator__} method
 *     that will be called to get the value iterator.  If the object is an
 *     array-like object we create an iterator for that.
 * @return {!goog.iter.Iterator} An iterator that knows how to iterate over the
 *     values in {@code iterable}.
 */
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == 'function') {
    return iterable.__iterator__(_FALSE);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (_TRUE) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        // Don't include deleted elements.
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }


  // TODO(user): Should we fall back on goog.structs.getValues()?
  throw Error('Not implemented');
};


/**
 * Calls a function for each element in the iterator with the element of the
 * iterator passed as argument.
 *
 * @param {goog.iter.Iterable} iterable  The iterator to iterate
 *     over.  If the iterable is an object {@code toIterator} will be called on
 *     it.
 * @param {Function} f  The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and the
 *     return value is irrelevant.  The reason for passing undefined as the
 *     second argument is so that the same function can be used in
 *     {@see goog.array#forEach} as well as others.
 * @param {Object=} opt_obj  The object to be used as the value of 'this' within
 *     {@code f}.
 */
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    /** @preserveTry */
    try {
      goog.array.forEach((/** @type {goog.array.ArrayLike} */ iterable), f,
                         opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    /** @preserveTry */
    try {
      while (_TRUE) {
        f.call(opt_obj, iterable.next(), _UNDEFINED, iterable);
      }
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};


/**
 * Calls a function for every element in the iterator, and if the function
 * returns true adds the element to a new iterator.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a boolean.  If the return value is true the element will be
 *     included  in the returned iteror.  If it is _FALSE the element is not
 *     included.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator in which only elements that
 *     passed the test are present.
 */
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (_TRUE) {
      var val = iterable.next();
      if (f.call(opt_obj, val, _UNDEFINED, iterable)) {
        return val;
      }
    }
  };
  return newIter;
};


/**
 * Joins the values in a iterator with a delimiter.
 * @param {goog.iter.Iterable} iterable  The iterator to get the values from.
 * @param {string} deliminator  The text to put between the values.
 * @return {string} The joined value string.
 */
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};


/**
 * For every element in the iterator call a function and return a new iterator
 * with that value.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a new value.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that returns the results of
 *     applying the function to each element in the original iterator.
 */
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (_TRUE) {
      var val = iterable.next();
      return f.call(opt_obj, val, _UNDEFINED, iterable);
    }
  };
  return newIter;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns true, this returns true (without checking the rest). If all
 * return _FALSE this will return _FALSE.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if any value passes the test.
 */
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (_TRUE) {
      if (f.call(opt_obj, iterable.next(), _UNDEFINED, iterable)) {
        return _TRUE;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return _FALSE;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns _FALSE this returns _FALSE (without checking the rest). If all
 * return true this will return true.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if every value passes the test.
 */
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (_TRUE) {
      if (!f.call(opt_obj, iterable.next(), _UNDEFINED, iterable)) {
        return _FALSE;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return _TRUE;
};


/**
 * Converts the iterator to an array
 * @param {goog.iter.Iterable} iterable  The iterator to convert to an array.
 * @return {!Array} An array of the elements the iterator iterates over.
 */
goog.iter.toArray = function(iterable) {
  // Fast path for array-like.
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray((/** @type {!goog.array.ArrayLike} */ iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};


/**
 * Iterates over 2 iterators and returns true if they contain the same sequence
 * of elements and have the same length.
 * @param {goog.iter.Iterable} iterable1  The first iterable object.
 * @param {goog.iter.Iterable} iterable2  The second iterable object.
 * @return {boolean} true if the iterators contain the same sequence of
 *     elements and have the same length.
 */
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  /** @preserveTry */
  try {
    while (_TRUE) {
      b1 = b2 = _FALSE;
      var val1 = iterable1.next();
      b1 = _TRUE;
      var val2 = iterable2.next();
      b2 = _TRUE;
      if (val1 != val2) {
        return _FALSE;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    } else {
      if (b1 && !b2) {
        // iterable1 done but iterable2 is not done.
        return _FALSE;
      }
      if (!b2) {
        /** @preserveTry */
        try {
          // iterable2 not done?
          val2 = iterable2.next();
          // iterable2 not done but iterable1 is done
          return _FALSE;
        } catch (ex1) {
          if (ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          // iterable2 done as well... They are equal
          return _TRUE;
        }
      }
    }
  }
  return _FALSE;
};
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Iterator subclass for DOM tree traversal.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.TagIterator');
goog.provide('goog.dom.TagWalkType');

//goog.require('goog.dom.NodeType');
//goog.require('goog.iter.Iterator');
//goog.require('goog.iter.StopIteration');


/**
 * There are three types of token:
 *  <ol>
 *    <li>{@code START_TAG} - The beginning of a tag.
 *    <li>{@code OTHER} - Any non-element node position.
 *    <li>{@code END_TAG} - The end of a tag.
 *  </ol>
 * Users of this enumeration can rely on {@code START_TAG + END_TAG = 0} and
 * that {@code OTHER = 0}.
 *
 * @enum {number}
 */
goog.dom.TagWalkType = {
  START_TAG: 1,
  OTHER: 0,
  END_TAG: -1
};



/**
 * A DOM tree traversal iterator.
 *
 * Starting with the given node, the iterator walks the DOM in order, reporting
 * events for the start and end of Elements, and the presence of text nodes. For
 * example:
 *
 * <pre>
 * &lt;div&gt;1&lt;span&gt;2&lt;/span&gt;3&lt;/div&gt;
 * </pre>
 *
 * Will return the following nodes:
 *
 * <code>[div, 1, span, 2, span, 3, div]</code>
 *
 * With the following states:
 *
 * <code>[START, OTHER, START, OTHER, END, OTHER, END]</code>
 *
 * And the following depths
 *
 * <code>[1, 1, 2, 2, 1, 1, 0]</code>
 *
 * Imagining <code>|</code> represents iterator position, the traversal stops at
 * each of the following locations:
 *
 * <pre>
 * &lt;div&gt;|1|&lt;span&gt;|2|&lt;/span&gt;|3|&lt;/div&gt;|
 * </pre>
 *
 * The iterator can also be used in reverse mode, which will return the nodes
 * and states in the opposite order.  The depths will be slightly different
 * since, like in normal mode, the depth is computed *after* the given node.
 *
 * Lastly, it is possible to create an iterator that is unconstrained, meaning
 * that it will continue iterating until the end of the document instead of
 * until exiting the start node.
 *
 * @param {Node=} opt_node The start node.  If unspecified or null, defaults to
 *     an empty iterator.
 * @param {boolean=} opt_reversed Whether to traverse the tree in reverse.
 * @param {boolean=} opt_unconstrained Whether the iterator is not constrained
 *     to the starting node and its children.
 * @param {goog.dom.TagWalkType?=} opt_tagType The type of the position.
 *     Defaults to the start of the given node for forward iterators, and
 *     the end of the node for reverse iterators.
 * @param {number=} opt_depth The starting tree depth.
 * @constructor
 * @extends {goog.iter.Iterator}
 */
goog.dom.TagIterator = function(opt_node, opt_reversed,
    opt_unconstrained, opt_tagType, opt_depth) {
  this.reversed = !!opt_reversed;
  if (opt_node) {
    this.setPosition(opt_node, opt_tagType);
  }
  this.depth = opt_depth != _UNDEFINED ? opt_depth : this.tagType || 0;
  if (this.reversed) {
    this.depth *= -1;
  }
  this.constrained = !opt_unconstrained;
};
goog.inherits(goog.dom.TagIterator, goog.iter.Iterator);


/**
 * The node this position is located on.
 * @type {Node}
 */
goog.dom.TagIterator.prototype.node = _NULL;


/**
 * The type of this position.
 * @type {goog.dom.TagWalkType}
 */
goog.dom.TagIterator.prototype.tagType = goog.dom.TagWalkType.OTHER;


/**
 * The tree depth of this position relative to where the iterator started.  The
 * depth is considered to be the tree depth just past the current node, so if an
 * iterator is at position <pre>
 *     <div>|</div>
 * </pre>
 * (i.e. the node is the div and the type is START_TAG) its depth will be 1.
 * @type {number}
 */
goog.dom.TagIterator.prototype.depth;


/**
 * Whether the node iterator is moving in reverse.
 * @type {boolean}
 */
goog.dom.TagIterator.prototype.reversed;


/**
 * Whether the iterator is constrained to the starting node and its children.
 * @type {boolean}
 */
goog.dom.TagIterator.prototype.constrained;


/**
 * Whether iteration has started.
 * @type {boolean}
 * @private
 */
goog.dom.TagIterator.prototype.started_ = _FALSE;


/**
 * Set the position of the iterator.  Overwrite the tree node and the position
 * type which can be one of the {@link goog.dom.TagWalkType} token types.
 * Only overwrites the tree depth when the parameter is specified.
 * @param {Node} node The node to set the position to.
 * @param {goog.dom.TagWalkType?=} opt_tagType The type of the position
 *     Defaults to the start of the given node.
 * @param {number=} opt_depth The tree depth.
 */
goog.dom.TagIterator.prototype.setPosition = function(node,
    opt_tagType, opt_depth) {
  this.node = node;

  if (node) {
    if (goog.isNumber(opt_tagType)) {
      this.tagType = opt_tagType;
    } else {
      // Auto-determine the proper type
      this.tagType = this.node.nodeType != goog.dom.NodeType.ELEMENT ?
          goog.dom.TagWalkType.OTHER :
          this.reversed ? goog.dom.TagWalkType.END_TAG :
          goog.dom.TagWalkType.START_TAG;
    }
  }

  if (goog.isNumber(opt_depth)) {
    this.depth = opt_depth;
  }
};


/**
 * Replace this iterator's values with values from another.
 * @param {goog.dom.TagIterator} other The iterator to copy.
 * @protected
 */
goog.dom.TagIterator.prototype.copyFrom = function(other) {
  this.node = other.node;
  this.tagType = other.tagType;
  this.depth = other.depth;
  this.reversed = other.reversed;
  this.constrained = other.constrained;
};


/**
 * @return {goog.dom.TagIterator} A copy of this iterator.
 */
goog.dom.TagIterator.prototype.clone = function() {
  return new goog.dom.TagIterator(this.node, this.reversed,
      !this.constrained, this.tagType, this.depth);
};


/**
 * Skip the current tag.
 */
goog.dom.TagIterator.prototype.skipTag = function() {
  var check = this.reversed ? goog.dom.TagWalkType.END_TAG :
              goog.dom.TagWalkType.START_TAG;
  if (this.tagType == check) {
    this.tagType = /** @type {goog.dom.TagWalkType} */ (check * -1);
    this.depth += this.tagType * (this.reversed ? -1 : 1);
  }
};


/**
 * Restart the current tag.
 */
goog.dom.TagIterator.prototype.restartTag = function() {
  var check = this.reversed ? goog.dom.TagWalkType.START_TAG :
              goog.dom.TagWalkType.END_TAG;
  if (this.tagType == check) {
    this.tagType = /** @type {goog.dom.TagWalkType} */ (check * -1);
    this.depth += this.tagType * (this.reversed ? -1 : 1);
  }
};


/**
 * Move to the next position in the DOM tree.
 * @return {Node} Returns the next node, or throws a goog.iter.StopIteration
 *     exception if the end of the iterator's range has been reached.
 */
goog.dom.TagIterator.prototype.next = function() {
  var node;

  if (this.started_) {
    if (!this.node || this.constrained && this.depth == 0) {
      throw goog.iter.StopIteration;
    }
    node = this.node;

    var startType = this.reversed ? goog.dom.TagWalkType.END_TAG :
        goog.dom.TagWalkType.START_TAG;

    if (this.tagType == startType) {
      // If we have entered the tag, test if there are any children to move to.
      var child = this.reversed ? node.lastChild : node.firstChild;
      if (child) {
        this.setPosition(child);
      } else {
        // If not, move on to exiting this tag.
        this.setPosition(node,
            /** @type {goog.dom.TagWalkType} */ (startType * -1));
      }
    } else {
      var sibling = this.reversed ? node.previousSibling : node.nextSibling;
      // by simonz
      // <span><div></span><strong></strong></div> 인 경우에 IE에서 무한 loop가 발생한다.
      // strong을 iteration하지 않고 빠져나가도록 수정을 했다.
      if (sibling && node.parentNode == sibling.parentNode) {
//      if (sibling) {
        // Try to move to the next node.
        this.setPosition(sibling);
      } else {
        // If no such node exists, exit our parent.
        this.setPosition(node.parentNode,
            /** @type {goog.dom.TagWalkType} */ (startType * -1));
      }
    }

    this.depth += this.tagType * (this.reversed ? -1 : 1);
  } else {
    this.started_ = _TRUE;
  }

  // Check the new position for being last, and return it if it's not.
  node = this.node;
  if (!this.node) {
    throw goog.iter.StopIteration;
  }
  return node;
};


/**
 * @return {boolean} Whether next has ever been called on this iterator.
 * @protected
 */
goog.dom.TagIterator.prototype.isStarted = function() {
  return this.started_;
};


/**
 * @return {boolean} Whether this iterator's position is a start tag position.
 */
goog.dom.TagIterator.prototype.isStartTag = function() {
  return this.tagType == goog.dom.TagWalkType.START_TAG;
};


/**
 * @return {boolean} Whether this iterator's position is an end tag position.
 */
goog.dom.TagIterator.prototype.isEndTag = function() {
  return this.tagType == goog.dom.TagWalkType.END_TAG;
};


/**
 * Test if two iterators are at the same position - i.e. if the node and tagType
 * is the same.  This will still return true if the two iterators are moving in
 * opposite directions or have different constraints.
 * @param {goog.dom.TagIterator} other The iterator to compare to.
 * @return {boolean} Whether the two iterators are at the same position.
 */
goog.dom.TagIterator.prototype.equals = function(other) {
  // Nodes must be equal, and we must either have reached the end of our tree
  // or be at the same position.
  return other.node == this.node && (!this.node ||
      other.tagType == this.tagType);
};


/**
 * Replace the current node with the list of nodes. Reset the iterator so that
 * it visits the first of the nodes next.
 * @param {...Object} var_args A list of nodes to replace the current node with.
 *     If the first argument is array-like, it will be used, otherwise all the
 *     arguments are assumed to be nodes.
 */
goog.dom.TagIterator.prototype.splice = function(var_args) {
  // Reset the iterator so that it iterates over the first replacement node in
  // the arguments on the next iteration.
  var node = this.node;
  this.restartTag();
  this.reversed = !this.reversed;
  goog.dom.TagIterator.prototype.next.call(this);
  this.reversed = !this.reversed;

  // Replace the node with the arguments.
  var arr = goog.isArrayLike(arguments[0]) ? arguments[0] : arguments;
  for (var i = arr.length - 1; i >= 0; i--) {
    goog.dom.insertSiblingAfter(arr[i], node);
  }
  goog.dom.removeNode(node);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Generics method for collection-like classes and objects.
 *
 *
 * This file contains functions to work with collections. It supports using
 * Map, Set, Array and Object and other classes that implement collection-like
 * methods.
 */


goog.provide('goog.structs');

//goog.require('goog.array');
//goog.require('goog.object');


// We treat an object as a dictionary if it has getKeys or it is an object that
// isn't arrayLike.


/**
 * Returns the number of values in the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {number} The number of values in the collection-like object.
 */
goog.structs.getCount = function(col) {
  if (typeof col.getCount == 'function') {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};


/**
 * Returns the values of the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {!Array} The values in the collection-like object.
 */
goog.structs.getValues = function(col) {
  if (typeof col.getValues == 'function') {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split('');
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};


/**
 * Returns the keys of the collection. Some collections have no notion of
 * keys/indexes and this function will return undefined in those cases.
 * @param {Object} col The collection-like object.
 * @return {!Array|undefined} The keys in the collection.
 */
goog.structs.getKeys = function(col) {
  if (typeof col.getKeys == 'function') {
    return col.getKeys();
  }
  // if we have getValues but no getKeys we know this is a key-less collection
  if (typeof col.getValues == 'function') {
    return _UNDEFINED;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(i);
    }
    return rv;
  }

  return goog.object.getKeys(col);
};


/**
 * Whether the collection contains the given value. This is O(n) and uses
 * equals (==) to test the existence.
 * @param {Object} col The collection-like object.
 * @param {*} val The value to check for.
 * @return {boolean} True if the map contains the value.
 */
goog.structs.contains = function(col, val) {
  if (typeof col.contains == 'function') {
    return col.contains(val);
  }
  if (typeof col.containsValue == 'function') {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(/** @type {Array} */ (col), val);
  }
  return goog.object.containsValue(col, val);
};


/**
 * Whether the collection is empty.
 * @param {Object} col The collection-like object.
 * @return {boolean} True if empty.
 */
goog.structs.isEmpty = function(col) {
  if (typeof col.isEmpty == 'function') {
    return col.isEmpty();
  }

  // We do not use goog.string.isEmpty because here we treat the string as
  // collection and as such even whitespace matters

  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(/** @type {Array} */ (col));
  }
  return goog.object.isEmpty(col);
};


/**
 * Removes all the elements from the collection.
 * @param {Object} col The collection-like object.
 */
goog.structs.clear = function(col) {
  // NOTE(user): This should not contain strings because strings are immutable
  if (typeof col.clear == 'function') {
    col.clear();
  } else if (goog.isArrayLike(col)) {
    goog.array.clear((/** @type {goog.array.ArrayLike} */ col));
  } else {
    goog.object.clear(col);
  }
};


/**
 * Calls a function for each value in a collection. The function takes
 * three arguments; the value, the key and the collection.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and the return value is irrelevant.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 */
goog.structs.forEach = function(col, f, opt_obj) {
  if (typeof col.forEach == 'function') {
    col.forEach(f, opt_obj);
  } else if (goog.isArrayLike(col) || goog.isString(col)) {
    goog.array.forEach(/** @type {Array} */ (col), f, opt_obj);
  } else {
    var keys = goog.structs.getKeys(col);
    var values = goog.structs.getValues(col);
    var l = values.length;
    for (var i = 0; i < l; i++) {
      f.call(opt_obj, values[i], keys && keys[i], col);
    }
  }
};


/**
 * Calls a function for every value in the collection. When a call returns true,
 * adds the value to a new collection (Array is returned by default).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean. If the
 *     return value is true the value is added to the result collection. If it
 *     is _FALSE the value is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection where the passed values are
 *     present. If col is a key-less collection an array is returned.  If col
 *     has keys and values a plain old JS object is returned.
 */
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == 'function') {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    // We should not use goog.array.filter here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], _UNDEFINED, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};


/**
 * Calls a function for every value in the collection and adds the result into a
 * new collection (defaults to creating a new Array).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function
 *     takes 3 arguments (the value, the key or undefined if the collection has
 *     no notion of keys, and the collection) and should return something. The
 *     result will be used as the value in the new collection.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection with the new values.  If col is a
 *     key-less collection an array is returned.  If col has keys and values a
 *     plain old JS object is returned.
 */
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == 'function') {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    // We should not use goog.array.map here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      rv[i] = f.call(opt_obj, values[i], _UNDEFINED, col);
    }
  }
  return rv;
};


/**
 * Calls f for each value in a collection. If any call returns true this returns
 * true (without checking the rest). If all returns _FALSE this returns _FALSE.
 *
 * @param {Object|Array|string} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if any value passes the test.
 */
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == 'function') {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return _TRUE;
    }
  }
  return _FALSE;
};


/**
 * Calls f for each value in a collection. If all calls return true this return
 * true this returns true. If any returns _FALSE this returns _FALSE at this point
 *  and does not continue to check the remaining values.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if all key-value pairs pass the test.
 */
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == 'function') {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return _FALSE;
    }
  }
  return _TRUE;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Hash Map.
 *
 *
 * This file contains an implementation of a Map structure. It implements a lot
 * of the methods used in goog.structs so those functions work on hashes.  For
 * convenience with common usage the methods accept any type for the key, though
 * internally they will be cast to strings.
 */


goog.provide('goog.structs.Map');

//goog.require('goog.iter.Iterator');
//goog.require('goog.iter.StopIteration');
//goog.require('goog.object');
//goog.require('goog.structs');



/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 */
goog.structs.Map = function(opt_map, var_args) {

  /**
   * Underlying JS object used to implement the map.
   * @type {!Object}
   * @private
   */
  this.map_ = {};

  /**
   * An array of keys. This is necessary for two reasons:
   *   1. Iterating the keys using for (var key in this.map_) allocates an
   *      object for every key in IE which is really bad for IE6 GC perf.
   *   2. Without a side data structure, we would need to escape all the keys
   *      as that would be the only way we could tell during iteration if the
   *      key was an internal key or a property of the object.
   *
   * This array can contain deleted keys so it's necessary to check the map
   * as well to see if the key is still in the map (this doesn't require a
   * memory allocation in IE).
   * @type {!Array.<string>}
   * @private
   */
  this.keys_ = [];

  var argLength = arguments.length;

  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll(/** @type {Object} */ (opt_map));
  }
};


/**
 * The number of key value pairs in the map.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.count_ = 0;


/**
 * Version used to detect changes while iterating.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.version_ = 0;


/**
 * @return {number} The number of key-value pairs in the map.
 */
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns the values of the map.
 * @return {!Array} The values in the map.
 */
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();

  var rv = [];
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};


/**
 * Returns the keys of the map.
 * @return {!Array.<string>} Array of string values.
 */
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return /** @type {!Array.<string>} */ (this.keys_.concat());
};


/**
 * Whether the map contains the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};


/**
 * Whether the map contains the given value. This is O(n).
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return _TRUE;
    }
  }
  return _FALSE;
};


/**
 * Whether this map is equal to the argument map.
 * @param {goog.structs.Map} otherMap The map against which to test equality.
 * @param {function(*, *) : boolean=} opt_equalityFn Optional equality function
 *     to test equality of values. If not specified, this will test whether
 *     the values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return _TRUE;
  }

  if (this.count_ != otherMap.getCount()) {
    return _FALSE;
  }

  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;

  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return _FALSE;
    }
  }

  return _TRUE;
};


/**
 * Default equality test for values.
 * @param {*} a The first value.
 * @param {*} b The second value.
 * @return {boolean} Whether a and b reference the same object.
 */
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};


/**
 * @return {boolean} Whether the map is empty.
 */
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};


/**
 * Removes all key-value pairs from the map.
 */
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};


/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * @param {*} key  The key to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;

    // clean up the keys array if the threshhold is hit
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }

    return _TRUE;
  }
  return _FALSE;
};


/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 * @private
 */
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    // First remove keys that are no longer in the map.
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }

  if (this.count_ != this.keys_.length) {
    // If the count still isn't correct, that means we have duplicates. This can
    // happen when the same key is added and removed multiple times. Now we have
    // to allocate one extra Object to remove the duplicates. This could have
    // been done in the first pass, but in the common case, we can avoid
    // allocating an extra object by only doing this when necessary.
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!(goog.structs.Map.hasKey_(seen, key))) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};


/**
 * Returns the value for the given key.  If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * @param {*} key The key to get the value for.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key, defaults to undefined.
 * @return {*} The value for the given key.
 */
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the map.
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
goog.structs.Map.prototype.set = function(key, value) {
  if (!(goog.structs.Map.hasKey_(this.map_, key))) {
    this.count_++;
    this.keys_.push(key);
    // Only change the version if we add a new key.
    this.version_++;
  }
  this.map_[key] = value;
};


/**
 * Adds multiple key-value pairs from another goog.structs.Map or Object.
 * @param {Object} map  Object containing the data to add.
 */
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  // we could use goog.array.forEach here but I don't want to introduce that
  // dependency just for this.
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Clones a map and returns a new map.
 * @return {!goog.structs.Map} A new map with the same key-value pairs.
 */
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};


/**
 * @return {!Object} Object representation of the map.
 */
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};


/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * @param {boolean=} opt_keys True to iterate over the keys. _FALSE to iterate
 *     over the values.  The default value is _FALSE.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  // Clean up keys to minimize the risk of iterating over dead keys.
  this.cleanupKeysArray_();

  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (_TRUE) {
      if (version != selfObj.version_) {
        throw Error('The map has changed since the iterator was created');
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};


/**
 * Safe way to test for hasOwnProperty.  It even allows testing for
 * 'hasOwnProperty'.
 * @param {Object} obj The object to test for presence of the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Set.
 *
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), because these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */


goog.provide('goog.structs.Set');

//goog.require('goog.structs');
//goog.require('goog.structs.Map');



/**
 * A set that can contain both primitives and objects.  Adding and removing
 * elements is O(1).  Primitives are treated as identical if they have the same
 * type and convert to the same string.  Objects are treated as identical only
 * if they are references to the same object.  WARNING: A goog.structs.Set can
 * contain both 1 and (new Number(1)), because they are not the same.  WARNING:
 * Adding (new Number(1)) twice will yield two distinct elements, because they
 * are two different objects.  WARNING: Any object that is added to a
 * goog.structs.Set will be modified!  Because goog.getUid() is used to
 * identify objects, every object in the set will be mutated.
 * @param {Array|Object=} opt_values Initial values to start with.
 * @constructor
 */
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};


/**
 * Obtains a unique key for an element of the set.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.getUid(/** @type {Object} */ (val));
  } else {
    return type.substr(0, 1) + val;
  }
};


/**
 * @return {number} The number of elements in the set.
 */
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * Add a primitive or an object to the set.
 * @param {*} element The primitive or object to add.
 */
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};


/**
 * Adds all the values in the given collection to this set.
 * @param {Array|Object} col A collection containing the elements to add.
 */
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};


/**
 * Removes the given element from this set.
 * @param {*} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 */
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};


/**
 * Removes all elements from this set.
 */
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Tests whether this set is empty.
 * @return {boolean} True if there are no elements in this set.
 */
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Tests whether this set contains the given element.
 * @param {*} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 */
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};


/**
 * Tests whether this set contains all the values in a given collection.
 * Repeated elements in the collection are ignored, e.g.  (new
 * goog.structs.Set([1, 2])).containsAll([1, 1]) is True.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set contains all elements.
 */
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};


/**
 * Returns an array containing all the elements in this set.
 * @return {Array} An array containing all the elements in this set.
 */
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};


/**
 * Creates a shallow clone of this set.
 * @return {goog.structs.Set} A new set containing all the same elements as
 *     this set.
 */
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};


/**
 * Tests whether the given collection consists of the same elements as this set,
 * regardless of order, without repetition.  Primitives are treated as equal if
 * they have the same type and convert to the same string; objects are treated
 * as equal if they are references to the same object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if the given collection consists of the same elements
 *     as this set, regardless of order, without repetition.
 */
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};


/**
 * Tests whether the given collection contains all the elements in this set.
 * Primitives are treated as equal if they have the same type and convert to the
 * same string; objects are treated as equal if they are references to the same
 * object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if this set is a subset of the given collection.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return _FALSE;
  }
  // TODO(user) Find the minimal collection size where the conversion makes
  // the contains() method faster.
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    // Convert to a goog.structs.Set so that goog.structs.contains runs in
    // O(1) time instead of O(n) time.
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};


/**
 * Returns an iterator that iterates over the elements in this set.
 * @param {boolean=} opt_keys This argument is ignored.
 * @return {goog.iter.Iterator} An iterator over the elements in this set.
 */
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(_FALSE);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//goog.require('goog.array');
//goog.require('goog.string');
//goog.require('goog.structs.Set');



// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the disposable interface.  A disposable object
 * has a dispose method to to clean up references and resources.
 */


goog.provide('goog.disposable.IDisposable');



/**
 * Interface for a disposable object.  If a instance requires cleanup
 * (references COM objects, DOM notes, or other disposable objects), it should
 * implement this interface (it may subclass goog.Disposable).
 * @interface
 */
goog.disposable.IDisposable = function() {};


/**
 * Disposes of the object and its resources.
 * @return {void} Nothing.
 */
goog.disposable.IDisposable.prototype.dispose;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.disposable.IDisposable.prototype.isDisposed;
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implements the disposable interface. The dispose method is used
 * to clean up references and resources.
 */


goog.provide('goog.Disposable');
goog.provide('goog.dispose');

//goog.require('goog.disposable.IDisposable');



/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface (defined in goog.disposable.IDisposable).
 * @constructor
 * @implements {goog.disposable.IDisposable}
 */
goog.Disposable = function() {
  if (goog.Disposable.ENABLE_MONITORING) {
    goog.Disposable.instances_[goog.getUid(this)] = this;
  }
};


/**
 * @define {boolean} Whether to enable the monitoring of the goog.Disposable
 *     instances. Switching on the monitoring is only recommended for debugging
 *     because it has a significant impact on performance and memory usage.
 *     If switched off, the monitoring code compiles down to 0 bytes.
 *     The monitoring expects that all disposable objects call the
 *     {@code goog.Disposable} base constructor.
 */
goog.Disposable.ENABLE_MONITORING = _FALSE;


/**
 * Maps the unique ID of every undisposed {@code goog.Disposable} object to
 * the object itself.
 * @type {!Object.<number, !goog.Disposable>}
 * @private
 */
goog.Disposable.instances_ = {};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
goog.Disposable.prototype.disposed_ = _FALSE;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend {@code goog.Disposable} should
 * override {@link #disposeInternal} in order to delete references to COM
 * objects, DOM nodes, and other disposable objects.
 *
 * @return {void} Nothing.
 */
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = _TRUE;
    this.disposeInternal();
    if (goog.Disposable.ENABLE_MONITORING) {
      var uid = goog.getUid(this);
      if (!goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + ' did not call the goog.Disposable base ' +
            'constructor or was disposed of after a clearUndisposedObjects ' +
            'call');
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code goog.Disposable} should
 * override this method.  For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     goog.Disposable.call(this);
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   goog.inherits(mypackage.MyClass, goog.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     mypackage.MyClass.superClass_.disposeInternal.call(this);
 *     // Dispose logic specific to MyClass.
 *     ...
 *   };
 * </pre>
 * @protected
 */
goog.Disposable.prototype.disposeInternal = function() {
  // No-op in the base class.
};


/**
 * Calls {@code dispose} on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == 'function') {
    obj.dispose();
  }
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A generic interface for saving and restoring ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.SavedRange');

//goog.require('goog.Disposable');



/**
 * Abstract interface for a saved range.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.dom.SavedRange = function() {
  goog.Disposable.call(this);
};
goog.inherits(goog.dom.SavedRange, goog.Disposable);


/**
 * Restores the range and by default disposes of the saved copy.  Take note:
 * this means the by default SavedRange objects are single use objects.
 * @param {boolean=} opt_stayAlive Whether this SavedRange should stay alive
 *     (not be disposed) after restoring the range. Defaults to _FALSE (dispose).
 * @return {goog.dom.AbstractRange} The restored range.
 */
goog.dom.SavedRange.prototype.restore = function(opt_stayAlive) {
  var range = this.restoreInternal();
  if (!opt_stayAlive) {
    this.dispose();
  }
  return range;
};


/**
 * Internal method to restore the saved range.
 * @return {goog.dom.AbstractRange} The restored range.
 */
goog.dom.SavedRange.prototype.restoreInternal = goog.abstractMethod;
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview An API for saving and restoring ranges as HTML carets.
 *
 * @author nicksantos@google.com (Nick Santos)
 */


goog.provide('goog.dom.SavedCaretRange');

//goog.require('goog.array');
//goog.require('goog.dom');
//goog.require('goog.dom.SavedRange');
//goog.require('goog.dom.TagName');
//goog.require('goog.string');



/**
 * A struct for holding context about saved selections.
 * This can be used to preserve the selection and restore while the DOM is
 * manipulated, or through an asynchronous call. Use goog.dom.Range factory
 * methods to obtain an {@see goog.dom.AbstractRange} instance, and use
 * {@see goog.dom.AbstractRange#saveUsingCarets} to obtain a SavedCaretRange.
 * For editor ranges under content-editable elements or design-mode iframes,
 * prefer using {@see goog.editor.range.saveUsingNormalizedCarets}.
 * @param {goog.dom.AbstractRange} range The range being saved.
 * @constructor
 * @extends {goog.dom.SavedRange}
 */
goog.dom.SavedCaretRange = function(range) {
  goog.dom.SavedRange.call(this);

  /**
   * The DOM id of the caret at the start of the range.
   * @type {string}
   * @private
   */
  this.startCaretId_ = goog.string.createUniqueString();

  /**
   * The DOM id of the caret at the end of the range.
   * @type {string}
   * @private
   */
  this.endCaretId_ = goog.string.createUniqueString();

  /**
   * A DOM helper for storing the current document context.
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = goog.dom.getDomHelper(range.getDocument());

  range.surroundWithNodes(this.createCaret_(_TRUE), this.createCaret_(_FALSE));
  this.removeIncidentalTextNode_();
};
goog.inherits(goog.dom.SavedCaretRange, goog.dom.SavedRange);


/**
 * Gets carets.
 * @param {boolean} start If true, returns the start caret. Otherwise, get the
 *     end caret.
 * @return {Element} The start or end caret in the given document.
 */
goog.dom.SavedCaretRange.prototype.getCaret = function(start) {
  return this.dom_.getElement(start ? this.startCaretId_ : this.endCaretId_);
};

goog.dom.SavedCaretRange.prototype.removeIncidentalTextNode_ = function() {
    var startCaret = this.getCaret(_TRUE);
    this.removeIfEmptyText_(startCaret.previousSibling);
    this.removeIfEmptyText_(startCaret.nextSibling);

    var endCaret = this.getCaret(_FALSE);
    this.removeIfEmptyText_(endCaret.previousSibling);
    this.removeIfEmptyText_(endCaret.nextSibling);
};

goog.dom.SavedCaretRange.prototype.removeIfEmptyText_ = function(node) {
	if (node && node.nodeType === goog.dom.NodeType.TEXT && !node.nodeValue) {
		goog.dom.removeNode(node);
	}
}

/**
 * Removes the carets from the current restoration document.
 * @param {goog.dom.AbstractRange=} opt_range A range whose offsets have already
 *     been adjusted for caret removal; it will be adjusted if it is also
 *     affected by post-removal operations, such as text node normalization.
 * @return {goog.dom.AbstractRange|undefined} The adjusted range, if opt_range
 *     was provided.
 */
goog.dom.SavedCaretRange.prototype.removeCarets = function(opt_range) {
  goog.dom.removeNode(this.getCaret(_TRUE));
  goog.dom.removeNode(this.getCaret(_FALSE));
  return opt_range;
};


/**
 * Reconstruct the selection from the given saved range. Removes carets after
 * restoring the selection. If restore does not dispose this saved range, it may
 * only be restored a second time if innerHTML or some other mechanism is used
 * to restore the carets to the dom.
 * @return {goog.dom.AbstractRange?} Restored selection.
 * @override
 * @protected
 */
goog.dom.SavedCaretRange.prototype.restoreInternal = function() {
  var range = _NULL;
  var startCaret = this.getCaret(_TRUE);
  var endCaret = this.getCaret(_FALSE);
  if (startCaret && endCaret) {
    var startNode = startCaret.parentNode;
    var startOffset = goog.array.indexOf(startNode.childNodes, startCaret);
    var endNode = endCaret.parentNode;
    var endOffset = goog.array.indexOf(endNode.childNodes, endCaret);
    range = goog.dom.Range.createFromNodes(startNode, startOffset + 1,
                                           endNode, endOffset);
    range.select();
  }
  return range;
};
//goog.dom.SavedCaretRange.prototype.restoreInternal = function() {
//  var range = null;
//  var startCaret = this.getCaret(true);
//  var endCaret = this.getCaret(false);
//  if (startCaret && endCaret) {
//    var startNode = startCaret.parentNode;
//    var startOffset = goog.array.indexOf(startNode.childNodes, startCaret);
//    var endNode = endCaret.parentNode;
//    var endOffset = goog.array.indexOf(endNode.childNodes, endCaret);
//    if (endNode == startNode) {
//      // Compensate for the start caret being removed.
//      endOffset -= 1;
//    }
//    range = goog.dom.Range.createFromNodes(startNode, startOffset,
//                                           endNode, endOffset);
//    range = this.removeCarets(range);
////    range.select();
//  } else {
//    // If only one caret was found, remove it.
//    this.removeCarets();
//  }
//  return range;
//};

/**
 * Dispose the saved range and remove the carets from the DOM.
 * @override
 * @protected
 */
goog.dom.SavedCaretRange.prototype.disposeInternal = function() {
  this.removeCarets();
  this.dom_ = _NULL;
};


/**
 * Creates a caret element.
 * @param {boolean} start If true, creates the start caret. Otherwise,
 *     creates the end caret.
 * @return {Element} The new caret element.
 * @private
 */
goog.dom.SavedCaretRange.prototype.createCaret_ = function(start) {
  return this.dom_.createDom(goog.dom.TagName.SPAN,
      {'id': start ? this.startCaretId_ : this.endCaretId_});
};


/**
 * A regex that will match all saved range carets in a string.
 * @type {RegExp}
 */
goog.dom.SavedCaretRange.CARET_REGEX = /<span\s+id="?goog_\d+"?><\/span>/ig;


// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Interface definitions for working with ranges
 * in HTML documents.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.AbstractRange');
goog.provide('goog.dom.RangeIterator');
goog.provide('goog.dom.RangeType');

//goog.require('goog.dom');
//goog.require('goog.dom.NodeType');
//goog.require('goog.dom.SavedCaretRange');
//goog.require('goog.dom.TagIterator');
//goog.require('goog.userAgent');


/**
 * Types of ranges.
 * @enum {string}
 */
goog.dom.RangeType = {
  TEXT: 'text',
  CONTROL: 'control',
  MULTI: 'mutli'
};



/**
 * Creates a new selection with no properties.  Do not use this constructor -
 * use one of the goog.dom.Range.from* methods instead.
 * @constructor
 */
goog.dom.AbstractRange = function() {
};


/**
 * Gets the browser native selection object from the given window.
 * @param {Window} win The window to get the selection object from.
 * @return {Object} The browser native selection object, or null if it could
 *     not be retrieved.
 */
goog.dom.AbstractRange.getBrowserSelectionForWindow = function(win) {
  if (win.getSelection) {
    // W3C
    return win.getSelection();
  } else {
    // IE
    var doc = win.document;
    var sel = doc.selection;
    if (sel) {
      // IE has a bug where it sometimes returns a selection from the wrong
      // document. Catching these cases now helps us avoid problems later.
      try {
        var range = sel.createRange();
        // Only TextRanges have a parentElement method.
        if (range.parentElement) {
          if (range.parentElement().document != doc) {
            return _NULL;
          }
        } else if (!range.length || range.item(0).document != doc) {
          // For ControlRanges, check that the range has items, and that
          // the first item in the range is in the correct document.
          return _NULL;
        }
      } catch (e) {
        // If the selection is in the wrong document, and the wrong document is
        // in a different domain, IE will throw an exception.
        return _NULL;
      }
      // TODO(user|robbyw) Sometimes IE 6 returns a selection instance
      // when there is no selection.  This object has a 'type' property equals
      // to 'None' and a typeDetail property bound to undefined. Ideally this
      // function should not return this instance.
      return sel;
    }
    return _NULL;
  }
};


/**
 * Tests if the given Object is a controlRange.
 * @param {Object} range The range object to test.
 * @return {boolean} Whether the given Object is a controlRange.
 */
goog.dom.AbstractRange.isNativeControlRange = function(range) {
  // For now, tests for presence of a control range function.
  return !!range && !!range.addElement;
};


/**
 * @return {goog.dom.AbstractRange} A clone of this range.
 */
goog.dom.AbstractRange.prototype.clone = goog.abstractMethod;


/**
 * @return {goog.dom.RangeType} The type of range represented by this object.
 */
goog.dom.AbstractRange.prototype.getType = goog.abstractMethod;


/**
 * @return {Range|TextRange} The native browser range object.
 */
goog.dom.AbstractRange.prototype.getBrowserRangeObject = goog.abstractMethod;


/**
 * Sets the native browser range object, overwriting any state this range was
 * storing.
 * @param {Range|TextRange} nativeRange The native browser range object.
 * @return {boolean} Whether the given range was accepted.  If not, the caller
 *     will need to call goog.dom.Range.createFromBrowserRange to create a new
 *     range object.
 */
goog.dom.AbstractRange.prototype.setBrowserRangeObject = function(nativeRange) {
  return _FALSE;
};


/**
 * @return {number} The number of text ranges in this range.
 */
goog.dom.AbstractRange.prototype.getTextRangeCount = goog.abstractMethod;


/**
 * Get the i-th text range in this range.  The behavior is undefined if
 * i >= getTextRangeCount or i < 0.
 * @param {number} i The range number to retrieve.
 * @return {goog.dom.TextRange} The i-th text range.
 */
goog.dom.AbstractRange.prototype.getTextRange = goog.abstractMethod;


/**
 * Gets an array of all text ranges this range is comprised of.  For non-multi
 * ranges, returns a single element array containing this.
 * @return {Array.<goog.dom.TextRange>} Array of text ranges.
 */
goog.dom.AbstractRange.prototype.getTextRanges = function() {
  var output = [];
  for (var i = 0, len = this.getTextRangeCount(); i < len; i++) {
    output.push(this.getTextRange(i));
  }
  return output;
};


/**
 * @return {Node} The deepest node that contains the entire range.
 */
goog.dom.AbstractRange.prototype.getContainer = goog.abstractMethod;



/**
 * @return {Node} The element or text node the range starts in.  For text
 *     ranges, the range comprises all text between the start and end position.
 *     For other types of range, start and end give bounds of the range but
 *     do not imply all nodes in those bounds are selected.
 */
goog.dom.AbstractRange.prototype.getStartNode = goog.abstractMethod;


/**
 * @return {number} The offset into the node the range starts in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getStartOffset = goog.abstractMethod;


/**
 * @return {Node} The element or text node the range ends in.
 */
goog.dom.AbstractRange.prototype.getEndNode = goog.abstractMethod;


/**
 * @return {number} The offset into the node the range ends in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getEndOffset = goog.abstractMethod;


/**
 * @return {Node} The element or text node the range is anchored at.
 */
goog.dom.AbstractRange.prototype.getAnchorNode = function() {
  return this.isReversed() ? this.getEndNode() : this.getStartNode();
};


/**
 * @return {number} The offset into the node the range is anchored at.  For
 *     text nodes, this is an offset into the node value.  For elements, this
 *     is an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getAnchorOffset = function() {
  return this.isReversed() ? this.getEndOffset() : this.getStartOffset();
};


/**
 * @return {Node} The element or text node the range is focused at - i.e. where
 *     the cursor is.
 */
goog.dom.AbstractRange.prototype.getFocusNode = function() {
  return this.isReversed() ? this.getStartNode() : this.getEndNode();
};


/**
 * @return {number} The offset into the node the range is focused at - i.e.
 *     where the cursor is.  For text nodes, this is an offset into the node
 *     value.  For elements, this is an offset into the childNodes array.
 */
goog.dom.AbstractRange.prototype.getFocusOffset = function() {
  return this.isReversed() ? this.getStartOffset() : this.getEndOffset();
};


/**
 * @return {boolean} Whether the selection is reversed.
 */
goog.dom.AbstractRange.prototype.isReversed = function() {
  return _FALSE;
};


/**
 * @return {Document} The document this selection is a part of.
 */
goog.dom.AbstractRange.prototype.getDocument = function() {
  // Using start node in IE was crashing the browser in some cases so use
  // getContainer for that browser. It's also faster for IE, but still slower
  // than start node for other browsers so we continue to use getStartNode when
  // it is not problematic. See bug 1687309.
  return goog.dom.getOwnerDocument(goog.userAgent.IE ?
      this.getContainer() : this.getStartNode());
};


/**
 * @return {Window} The window this selection is a part of.
 */
goog.dom.AbstractRange.prototype.getWindow = function() {
  return goog.dom.getWindow(this.getDocument());
};


/**
 * Tests if this range contains the given range.
 * @param {goog.dom.AbstractRange} range The range to test.
 * @param {boolean=} opt_allowPartial If true, the range can be partially
 *     contained in the selection, otherwise the range must be entirely
 *     contained.
 * @return {boolean} Whether this range contains the given range.
 */
goog.dom.AbstractRange.prototype.containsRange = goog.abstractMethod;


/**
 * Tests if this range contains the given node.
 * @param {Node} node The node to test for.
 * @param {boolean=} opt_allowPartial If not set or _FALSE, the node must be
 *     entirely contained in the selection for this function to return true.
 * @return {boolean} Whether this range contains the given node.
 */
goog.dom.AbstractRange.prototype.containsNode = function(node,
    opt_allowPartial) {
  return this.containsRange(goog.dom.Range.createFromNodeContents(node),
      opt_allowPartial);
};


/**
 * Tests whether this range is valid (i.e. whether its endpoints are still in
 * the document).  A range becomes invalid when, after this object was created,
 * either one or both of its endpoints are removed from the document.  Use of
 * an invalid range can lead to runtime errors, particularly in IE.
 * @return {boolean} Whether the range is valid.
 */
goog.dom.AbstractRange.prototype.isRangeInDocument = goog.abstractMethod;


/**
 * @return {boolean} Whether the range is collapsed.
 */
goog.dom.AbstractRange.prototype.isCollapsed = goog.abstractMethod;


/**
 * @return {string} The text content of the range.
 */
goog.dom.AbstractRange.prototype.getText = goog.abstractMethod;


/**
 * Returns the HTML fragment this range selects.  This is slow on all browsers.
 * The HTML fragment may not be valid HTML, for instance if the user selects
 * from a to b inclusively in the following html:
 *
 * &gt;div&lt;a&gt;/div&lt;b
 *
 * This method will return
 *
 * a&lt;/div&gt;b
 *
 * If you need valid HTML, use {@link #getValidHtml} instead.
 *
 * @return {string} HTML fragment of the range, does not include context
 *     containing elements.
 */
goog.dom.AbstractRange.prototype.getHtmlFragment = goog.abstractMethod;


/**
 * Returns valid HTML for this range.  This is fast on IE, and semi-fast on
 * other browsers.
 * @return {string} Valid HTML of the range, including context containing
 *     elements.
 */
goog.dom.AbstractRange.prototype.getValidHtml = goog.abstractMethod;


/**
 * Returns pastable HTML for this range.  This guarantees that any child items
 * that must have specific ancestors will have them, for instance all TDs will
 * be contained in a TR in a TBODY in a TABLE and all LIs will be contained in
 * a UL or OL as appropriate.  This is semi-fast on all browsers.
 * @return {string} Pastable HTML of the range, including context containing
 *     elements.
 */
goog.dom.AbstractRange.prototype.getPastableHtml = goog.abstractMethod;


/**
 * Returns a RangeIterator over the contents of the range.  Regardless of the
 * direction of the range, the iterator will move in document order.
 * @param {boolean=} opt_keys Unused for this iterator.
 * @return {goog.dom.RangeIterator} An iterator over tags in the range.
 */
goog.dom.AbstractRange.prototype.__iterator__ = goog.abstractMethod;


// RANGE ACTIONS


/**
 * Sets this range as the selection in its window.
 */
goog.dom.AbstractRange.prototype.select = goog.abstractMethod;


/**
 * Removes the contents of the range from the document.
 */
goog.dom.AbstractRange.prototype.removeContents = goog.abstractMethod;


/**
 * Inserts a node before (or after) the range.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Node} node The node to insert.
 * @param {boolean} before True to insert before, _FALSE to insert after.
 * @return {Node} The node added to the document.  This may be different
 *     than the node parameter because on IE we have to clone it.
 */
goog.dom.AbstractRange.prototype.insertNode = goog.abstractMethod;


/**
 * Surrounds this range with the two given nodes.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Element} startNode The node to insert at the start.
 * @param {Element} endNode The node to insert at the end.
 */
goog.dom.AbstractRange.prototype.surroundWithNodes = goog.abstractMethod;


// SAVE/RESTORE


/**
 * Saves the range so that if the start and end nodes are left alone, it can
 * be restored.
 * @return {goog.dom.SavedRange} A range representation that can be restored
 *     as long as the endpoint nodes of the selection are not modified.
 */
goog.dom.AbstractRange.prototype.saveUsingDom = goog.abstractMethod;


/**
 * Saves the range using HTML carets. As long as the carets remained in the
 * HTML, the range can be restored...even when the HTML is copied across
 * documents.
 * @return {goog.dom.SavedCaretRange?} A range representation that can be
 *     restored as long as carets are not removed. Returns null if carets
 *     could not be created.
 */
goog.dom.AbstractRange.prototype.saveUsingCarets = function() {
  return (this.getStartNode() && this.getEndNode()) ?
      new goog.dom.SavedCaretRange(this) : _NULL;
};


// RANGE MODIFICATION


/**
 * Collapses the range to one of its boundary points.
 * @param {boolean} toAnchor Whether to collapse to the anchor of the range.
 */
goog.dom.AbstractRange.prototype.collapse = goog.abstractMethod;

// RANGE ITERATION



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 * @param {Node} node The node to start traversal at.  When null, creates an
 *     empty iterator.
 * @param {boolean=} opt_reverse Whether to traverse nodes in reverse.
 * @constructor
 * @extends {goog.dom.TagIterator}
 */
goog.dom.RangeIterator = function(node, opt_reverse) {
  goog.dom.TagIterator.call(this, node, opt_reverse, _TRUE);
};
goog.inherits(goog.dom.RangeIterator, goog.dom.TagIterator);


/**
 * @return {number} The offset into the current node, or -1 if the current node
 *     is not a text node.
 */
goog.dom.RangeIterator.prototype.getStartTextOffset = goog.abstractMethod;


/**
 * @return {number} The end offset into the current node, or -1 if the current
 *     node is not a text node.
 */
goog.dom.RangeIterator.prototype.getEndTextOffset = goog.abstractMethod;


/**
 * @return {Node} node The iterator's start node.
 */
goog.dom.RangeIterator.prototype.getStartNode = goog.abstractMethod;


/**
 * @return {Node} The iterator's end node.
 */
goog.dom.RangeIterator.prototype.getEndNode = goog.abstractMethod;


/**
 * @return {boolean} Whether a call to next will fail.
 */
goog.dom.RangeIterator.prototype.isLast = goog.abstractMethod;
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with ranges comprised of multiple
 * sub-ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.AbstractMultiRange');

//goog.require('goog.array');
//goog.require('goog.dom');
//goog.require('goog.dom.AbstractRange');



/**
 * Creates a new multi range with no properties.  Do not use this
 * constructor: use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractRange}
 */
goog.dom.AbstractMultiRange = function() {
};
goog.inherits(goog.dom.AbstractMultiRange, goog.dom.AbstractRange);


/** @inheritDoc */
goog.dom.AbstractMultiRange.prototype.containsRange = function(
    otherRange, opt_allowPartial) {
  // TODO(user): This will incorrectly return _FALSE if two (or more) adjacent
  // elements are both in the control range, and are also in the text range
  // being compared to.
  var ranges = this.getTextRanges();
  var otherRanges = otherRange.getTextRanges();

  var fn = opt_allowPartial ? goog.array.some : goog.array.every;
  return fn(otherRanges, function(otherRange) {
    return goog.array.some(ranges, function(range) {
      return range.containsRange(otherRange, opt_allowPartial);
    });
  });
};


/** @inheritDoc */
goog.dom.AbstractMultiRange.prototype.insertNode = function(node, before) {
  if (before) {
    goog.dom.insertSiblingBefore(node, this.getStartNode());
  } else {
    goog.dom.insertSiblingAfter(node, this.getEndNode());
  }
  return node;
};


/** @inheritDoc */
goog.dom.AbstractMultiRange.prototype.surroundWithNodes = function(startNode,
    endNode) {
  this.insertNode(startNode, _TRUE);
  this.insertNode(endNode, _FALSE);
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Iterator between two DOM text range positions.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.TextRangeIterator');

//goog.require('goog.array');
//goog.require('goog.dom.NodeType');
//goog.require('goog.dom.RangeIterator');
//goog.require('goog.dom.TagName');
//goog.require('goog.iter.StopIteration');



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 *
 * @param {Node} startNode The starting node position.
 * @param {number} startOffset The offset in to startNode.  If startNode is
 *     an element, indicates an offset in to childNodes.  If startNode is a
 *     text node, indicates an offset in to nodeValue.
 * @param {Node} endNode The ending node position.
 * @param {number} endOffset The offset in to endNode.  If endNode is
 *     an element, indicates an offset in to childNodes.  If endNode is a
 *     text node, indicates an offset in to nodeValue.
 * @param {boolean=} opt_reverse Whether to traverse nodes in reverse.
 * @constructor
 * @extends {goog.dom.RangeIterator}
 */
goog.dom.TextRangeIterator = function(startNode, startOffset, endNode,
    endOffset, opt_reverse) {
  var goNext;

  if (startNode) {
    this.startNode_ = startNode;
    this.startOffset_ = startOffset;
    this.endNode_ = endNode;
    this.endOffset_ = endOffset;

    // Skip to the offset nodes - being careful to special case BRs since these
    // have no children but still can appear as the startContainer of a range.
    if (startNode.nodeType == goog.dom.NodeType.ELEMENT &&
        startNode.tagName != goog.dom.TagName.BR) {
      var startChildren = startNode.childNodes;
      var candidate = startChildren[startOffset];
      if (candidate) {
        this.startNode_ = candidate;
        this.startOffset_ = 0;
      } else {
        if (startChildren.length) {
          this.startNode_ =
              /** @type {Node} */ (goog.array.peek(startChildren));
        }
        goNext = _TRUE;
      }
    }

    if (endNode.nodeType == goog.dom.NodeType.ELEMENT) {
      this.endNode_ = endNode.childNodes[endOffset];
      if (this.endNode_) {
        this.endOffset_ = 0;
      } else {
        // The offset was past the last element.
        this.endNode_ = endNode;
      }
    }
  }

  goog.dom.RangeIterator.call(this, opt_reverse ? this.endNode_ :
      this.startNode_, opt_reverse);

  if (goNext) {
    try {
      this.next();
    } catch (e) {
      if (e != goog.iter.StopIteration) {
        throw e;
      }
    }
  }
};
goog.inherits(goog.dom.TextRangeIterator, goog.dom.RangeIterator);


/**
 * The first node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.TextRangeIterator.prototype.startNode_ = _NULL;


/**
 * The last node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.TextRangeIterator.prototype.endNode_ = _NULL;


/**
 * The offset within the first node in the selection.
 * @type {number}
 * @private
 */
goog.dom.TextRangeIterator.prototype.startOffset_ = 0;


/**
 * The offset within the last node in the selection.
 * @type {number}
 * @private
 */
goog.dom.TextRangeIterator.prototype.endOffset_ = 0;


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.getStartTextOffset = function() {
  // Offsets only apply to text nodes.  If our current node is the start node,
  // return the saved offset.  Otherwise, return 0.
  return this.node.nodeType != goog.dom.NodeType.TEXT ? -1 :
         this.node == this.startNode_ ? this.startOffset_ : 0;
};


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.getEndTextOffset = function() {
  // Offsets only apply to text nodes.  If our current node is the end node,
  // return the saved offset.  Otherwise, return the length of the node.
  return this.node.nodeType != goog.dom.NodeType.TEXT ? -1 :
      this.node == this.endNode_ ? this.endOffset_ : this.node.nodeValue.length;
};


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.getStartNode = function() {
  return this.startNode_;
};


/**
 * Change the start node of the iterator.
 * @param {Node} node The new start node.
 */
goog.dom.TextRangeIterator.prototype.setStartNode = function(node) {
  if (!this.isStarted()) {
    this.setPosition(node);
  }

  this.startNode_ = node;
  this.startOffset_ = 0;
};


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.getEndNode = function() {
  return this.endNode_;
};


/**
 * Change the end node of the iterator.
 * @param {Node} node The new end node.
 */
goog.dom.TextRangeIterator.prototype.setEndNode = function(node) {
  this.endNode_ = node;
  this.endOffset_ = 0;
};


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.isLast = function() {
  return this.isStarted() && this.node == this.endNode_ &&
      (!this.endOffset_ || !this.isStartTag());
};


/**
 * Move to the next position in the selection.
 * Throws {@code goog.iter.StopIteration} when it passes the end of the range.
 * @return {Node} The node at the next position.
 */
goog.dom.TextRangeIterator.prototype.next = function() {
  if (this.isLast()) {
    throw goog.iter.StopIteration;
  }

  // Call the super function.
  return goog.dom.TextRangeIterator.superClass_.next.call(this);
};


/** @inheritDoc */
goog.dom.TextRangeIterator.prototype.skipTag = function() {
  goog.dom.TextRangeIterator.superClass_.skipTag.apply(this);

  // If the node we are skipping contains the end node, we just skipped past
  // the end, so we stop the iteration.
  if (goog.dom.contains(this.node, this.endNode_)) {
    throw goog.iter.StopIteration;
  }
};


/**
 * Replace this iterator's values with values from another.
 * @param {goog.dom.TextRangeIterator} other The iterator to copy.
 * @protected
 */
goog.dom.TextRangeIterator.prototype.copyFrom = function(other) {
  this.startNode_ = other.startNode_;
  this.endNode_ = other.endNode_;
  this.startOffset_ = other.startOffset_;
  this.endOffset_ = other.endOffset_;
  this.isReversed_ = other.isReversed_;

  goog.dom.TextRangeIterator.superClass_.copyFrom.call(this, other);
};


/**
 * @return {goog.dom.TextRangeIterator} An identical iterator.
 */
goog.dom.TextRangeIterator.prototype.clone = function() {
  var copy = new goog.dom.TextRangeIterator(this.startNode_,
      this.startOffset_, this.endNode_, this.endOffset_, this.isReversed_);
  copy.copyFrom(this);
  return copy;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Detection of JScript version.
 *
 */


goog.provide('goog.userAgent.jscript');

//goog.require('goog.string');


/**
 * @define {boolean} True if it is known at compile time that the runtime
 *     environment will not be using JScript.
 */
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = _FALSE;


/**
 * Initializer for goog.userAgent.jscript.  Detects if the user agent is using
 * Microsoft JScript and which version of it.
 *
 * This is a named function so that it can be stripped via the jscompiler
 * option for stripping types.
 * @private
 */
goog.userAgent.jscript.init_ = function() {
  var hasScriptEngine = 'ScriptEngine' in goog.global;

  /**
   * @type {boolean}
   * @private
   */
  goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ =
      hasScriptEngine && goog.global['ScriptEngine']() == 'JScript';

  /**
   * @type {string}
   * @private
   */
  goog.userAgent.jscript.DETECTED_VERSION_ =
      goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ?
      (goog.global['ScriptEngineMajorVersion']() + '.' +
       goog.global['ScriptEngineMinorVersion']() + '.' +
       goog.global['ScriptEngineBuildVersion']()) :
      '0';
};

if (!goog.userAgent.jscript.ASSUME_NO_JSCRIPT) {
  goog.userAgent.jscript.init_();
}


/**
 * Whether we detect that the user agent is using Microsoft JScript.
 * @type {boolean}
 */
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ?
    _FALSE : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;


/**
 * The installed version of JScript.
 * @type {string}
 */
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ?
    '0' : goog.userAgent.jscript.DETECTED_VERSION_;


/**
 * Whether the installed version of JScript is as new or newer than a given
 * version.
 * @param {string} version The version to check.
 * @return {boolean} Whether the installed version of JScript is as new or
 *     newer than the given version.
 */
goog.userAgent.jscript.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.jscript.VERSION,
                                     version) >= 0;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility for fast string concatenation.
 */

goog.provide('goog.string.StringBuffer');

//goog.require('goog.userAgent.jscript');



/**
 * Utility class to facilitate much faster string concatenation in IE,
 * using Array.join() rather than the '+' operator.  For other browsers
 * we simply use the '+' operator.
 *
 * @param {Object|number|string|boolean=} opt_a1 Optional first initial item
 *     to append.
 * @param {...Object|number|string|boolean} var_args Other initial items to
 *     append, e.g., new goog.string.StringBuffer('foo', 'bar').
 * @constructor
 */
goog.string.StringBuffer = function(opt_a1, var_args) {
  /**
   * Internal buffer for the string to be concatenated.
   * @type {string|Array}
   * @private
   */
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : '';

  if (opt_a1 != _NULL) {
    this.append.apply(this, arguments);
  }
};


/**
 * Sets the contents of the string buffer object, replacing what's currently
 * there.
 *
 * @param {string} s String to set.
 */
goog.string.StringBuffer.prototype.set = function(s) {
  this.clear();
  this.append(s);
};


if (goog.userAgent.jscript.HAS_JSCRIPT) {
  /**
   * Length of internal buffer (faster than calling buffer_.length).
   * Only used if buffer_ is an array.
   * @type {number}
   * @private
   */
  goog.string.StringBuffer.prototype.bufferLength_ = 0;

  /**
   * Appends one or more items to the buffer.
   *
   * Calling this with null, undefined, or empty arguments is an error.
   *
   * @param {Object|number|string|boolean} a1 Required first string.
   * @param {Object|number|string|boolean=} opt_a2 Optional second string.
   * @param {...Object|number|string|boolean} var_args Other items to append,
   *     e.g., sb.append('foo', 'bar', 'baz').
   * @return {goog.string.StringBuffer} This same StringBuffer object.
   */
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    // IE version.

    if (opt_a2 == _NULL) { // second argument is undefined (null == undefined)
      // Array assignment is 2x faster than Array push.  Also, use a1
      // directly to avoid arguments instantiation, another 2x improvement.
      this.buffer_[this.bufferLength_++] = a1;
    } else {
      this.buffer_.push.apply(/** @type {Array} */ (this.buffer_), arguments);
      this.bufferLength_ = this.buffer_.length;
    }
    return this;
  };
} else {

  /**
   * Appends one or more items to the buffer.
   *
   * Calling this with null, undefined, or empty arguments is an error.
   *
   * @param {Object|number|string|boolean} a1 Required first string.
   * @param {Object|number|string|boolean=} opt_a2 Optional second string.
   * @param {...Object|number|string|boolean} var_args Other items to append,
   *     e.g., sb.append('foo', 'bar', 'baz').
   * @return {goog.string.StringBuffer} This same StringBuffer object.
   * @suppress {duplicate}
   */
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    // W3 version.

    // Use a1 directly to avoid arguments instantiation for single-arg case.
    this.buffer_ += a1;
    if (opt_a2 != _NULL) { // second argument is undefined (null == undefined)
      for (var i = 1; i < arguments.length; i++) {
        this.buffer_ += arguments[i];
      }
    }
    return this;
  };
}


/**
 * Clears the internal buffer.
 */
goog.string.StringBuffer.prototype.clear = function() {
  if (goog.userAgent.jscript.HAS_JSCRIPT) {
     this.buffer_.length = 0;  // Reuse the array to avoid creating new object.
     this.bufferLength_ = 0;
   } else {
     this.buffer_ = '';
   }
};


/**
 * Returns the length of the current contents of the buffer.  In IE, this is
 * O(n) where n = number of appends, so to avoid quadratic behavior, do not call
 * this after every append.
 *
 * @return {number} the length of the current contents of the buffer.
 */
goog.string.StringBuffer.prototype.getLength = function() {
   return this.toString().length;
};


/**
 * Returns the concatenated string.
 *
 * @return {string} The concatenated string.
 */
goog.string.StringBuffer.prototype.toString = function() {
  if (goog.userAgent.jscript.HAS_JSCRIPT) {
    var str = this.buffer_.join('');
    // Given a string with the entire contents, simplify the StringBuffer by
    // setting its contents to only be this string, rather than many fragments.
    this.clear();
    if (str) {
      this.append(str);
    }
    return str;
  } else {
    return /** @type {string} */ (this.buffer_);
  }
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Simple struct for endpoints of a range.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.RangeEndpoint');


/**
 * Constants for selection endpoints.
 * @enum {number}
 */
goog.dom.RangeEndpoint = {
  START: 1,
  END: 0
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the browser range interface.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.browserrange.AbstractRange');

//goog.require('goog.dom');
//goog.require('goog.dom.NodeType');
//goog.require('goog.dom.RangeEndpoint');
//goog.require('goog.dom.TagName');
//goog.require('goog.dom.TextRangeIterator');
//goog.require('goog.iter');
//goog.require('goog.string');
//goog.require('goog.string.StringBuffer');
//goog.require('goog.userAgent');



/**
 * The constructor for abstract ranges.  Don't call this from subclasses.
 * @constructor
 */
goog.dom.browserrange.AbstractRange = function() {
};


/**
 * @return {goog.dom.browserrange.AbstractRange} A clone of this range.
 */
goog.dom.browserrange.AbstractRange.prototype.clone = goog.abstractMethod;


/**
 * Returns the browser native implementation of the range.  Please refrain from
 * using this function - if you find you need the range please add wrappers for
 * the functionality you need rather than just using the native range.
 * @return {Range|TextRange} The browser native range object.
 */
goog.dom.browserrange.AbstractRange.prototype.getBrowserRange =
    goog.abstractMethod;


/**
 * Returns the deepest node in the tree that contains the entire range.
 * @return {Node} The deepest node that contains the entire range.
 */
goog.dom.browserrange.AbstractRange.prototype.getContainer =
    goog.abstractMethod;


/**
 * Returns the node the range starts in.
 * @return {Node} The element or text node the range starts in.
 */
goog.dom.browserrange.AbstractRange.prototype.getStartNode =
    goog.abstractMethod;


/**
 * Returns the offset into the node the range starts in.
 * @return {number} The offset into the node the range starts in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.browserrange.AbstractRange.prototype.getStartOffset =
    goog.abstractMethod;


/**
 * Returns the node the range ends in.
 * @return {Node} The element or text node the range ends in.
 */
goog.dom.browserrange.AbstractRange.prototype.getEndNode =
    goog.abstractMethod;


/**
 * Returns the offset into the node the range ends in.
 * @return {number} The offset into the node the range ends in.  For text
 *     nodes, this is an offset into the node value.  For elements, this is
 *     an offset into the childNodes array.
 */
goog.dom.browserrange.AbstractRange.prototype.getEndOffset =
    goog.abstractMethod;


/**
 * Compares one endpoint of this range with the endpoint of another browser
 * native range object.
 * @param {Range|TextRange} range The browser native range to compare against.
 * @param {goog.dom.RangeEndpoint} thisEndpoint The endpoint of this range
 *     to compare with.
 * @param {goog.dom.RangeEndpoint} otherEndpoint The endpoint of the other
 *     range to compare with.
 * @return {number} 0 if the endpoints are equal, negative if this range
 *     endpoint comes before the other range endpoint, and positive otherwise.
 */
goog.dom.browserrange.AbstractRange.prototype.compareBrowserRangeEndpoints =
    goog.abstractMethod;


/**
 * Tests if this range contains the given range.
 * @param {goog.dom.browserrange.AbstractRange} abstractRange The range to test.
 * @param {boolean=} opt_allowPartial If not set or _FALSE, the range must be
 *     entirely contained in the selection for this function to return true.
 * @return {boolean} Whether this range contains the given range.
 */
goog.dom.browserrange.AbstractRange.prototype.containsRange =
    function(abstractRange, opt_allowPartial) {
  // IE sometimes misreports the boundaries for collapsed ranges. So if the
  // other range is collapsed, make sure the whole range is contained. This is
  // logically equivalent, and works around IE's bug.
  var checkPartial = opt_allowPartial && !abstractRange.isCollapsed();

  var range = abstractRange.getBrowserRange();
  var start = goog.dom.RangeEndpoint.START, end = goog.dom.RangeEndpoint.END;
  /** {@preserveTry} */
  try {
    if (checkPartial) {
      // There are two ways to not overlap.  Being before, and being after.
      // Before is represented by this.end before range.start: comparison < 0.
      // After is represented by this.start after range.end: comparison > 0.
      // The below is the negation of not overlapping.
      return this.compareBrowserRangeEndpoints(range, end, start) >= 0 &&
             this.compareBrowserRangeEndpoints(range, start, end) <= 0;

    } else {
      // Return true if this range bounds the parameter range from both sides.
      return this.compareBrowserRangeEndpoints(range, end, end) >= 0 &&
          this.compareBrowserRangeEndpoints(range, start, start) <= 0;
    }
  } catch (e) {
    if (!goog.userAgent.IE) {
      throw e;
    }
    // IE sometimes throws exceptions when one range is invalid, i.e. points
    // to a node that has been removed from the document.  Return _FALSE in this
    // case.
    return _FALSE;
  }
};


/**
 * Tests if this range contains the given node.
 * @param {Node} node The node to test.
 * @param {boolean=} opt_allowPartial If not set or _FALSE, the node must be
 *     entirely contained in the selection for this function to return true.
 * @return {boolean} Whether this range contains the given node.
 */
goog.dom.browserrange.AbstractRange.prototype.containsNode = function(node,
    opt_allowPartial) {
  return this.containsRange(
      goog.dom.browserrange.createRangeFromNodeContents(node),
      opt_allowPartial);
};


/**
 * Tests if the selection is collapsed - i.e. is just a caret.
 * @return {boolean} Whether the range is collapsed.
 */
goog.dom.browserrange.AbstractRange.prototype.isCollapsed =
    goog.abstractMethod;


/**
 * @return {string} The text content of the range.
 */
goog.dom.browserrange.AbstractRange.prototype.getText =
    goog.abstractMethod;


/**
 * Returns the HTML fragment this range selects.  This is slow on all browsers.
 * @return {string} HTML fragment of the range, does not include context
 *     containing elements.
 */
goog.dom.browserrange.AbstractRange.prototype.getHtmlFragment = function() {
  var output = new goog.string.StringBuffer();
  goog.iter.forEach(this, function(node, ignore, it) {
    if (node.nodeType == goog.dom.NodeType.TEXT) {
      output.append(goog.string.htmlEscape(node.nodeValue.substring(
          it.getStartTextOffset(), it.getEndTextOffset())));
    } else if (node.nodeType == goog.dom.NodeType.ELEMENT) {
      if (it.isEndTag()) {
        if (goog.dom.canHaveChildren(node)) {
          output.append('</' + node.tagName + '>');
        }
      } else {
        var shallow = node.cloneNode(_FALSE);
        var html = goog.dom.getOuterHtml(shallow);
        if (goog.userAgent.IE && node.tagName == goog.dom.TagName.LI) {
          // For an LI, IE just returns "<li>" with no closing tag
          output.append(html);
        } else {
          var index = html.lastIndexOf('<');
          output.append(index ? html.substr(0, index) : html);
        }
      }
    }
  }, this);

  return output.toString();
};


/**
 * Returns valid HTML for this range.  This is fast on IE, and semi-fast on
 * other browsers.
 * @return {string} Valid HTML of the range, including context containing
 *     elements.
 */
goog.dom.browserrange.AbstractRange.prototype.getValidHtml =
    goog.abstractMethod;


/**
 * Returns a RangeIterator over the contents of the range.  Regardless of the
 * direction of the range, the iterator will move in document order.
 * @param {boolean=} opt_keys Unused for this iterator.
 * @return {goog.dom.RangeIterator} An iterator over tags in the range.
 */
goog.dom.browserrange.AbstractRange.prototype.__iterator__ = function(
    opt_keys) {
  return new goog.dom.TextRangeIterator(this.getStartNode(),
      this.getStartOffset(), this.getEndNode(), this.getEndOffset());
};


// SELECTION MODIFICATION


/**
 * Set this range as the selection in its window.
 * @param {boolean=} opt_reverse Whether to select the range in reverse,
 *     if possible.
 */
goog.dom.browserrange.AbstractRange.prototype.select =
    goog.abstractMethod;


/**
 * Removes the contents of the range from the document.  As a side effect, the
 * selection will be collapsed.  The behavior of content removal is normalized
 * across browsers.  For instance, IE sometimes creates extra text nodes that
 * a W3C browser does not.  That behavior is corrected for.
 */
goog.dom.browserrange.AbstractRange.prototype.removeContents =
    goog.abstractMethod;


/**
 * Surrounds the text range with the specified element (on Mozilla) or with a
 * clone of the specified element (on IE).  Returns a reference to the
 * surrounding element if the operation was successful; returns null if the
 * operation failed.
 * @param {Element} element The element with which the selection is to be
 *    surrounded.
 * @return {Element} The surrounding element (same as the argument on Mozilla,
 *    but not on IE), or null if unsuccessful.
 */
goog.dom.browserrange.AbstractRange.prototype.surroundContents =
    goog.abstractMethod;


/**
 * Inserts a node before (or after) the range.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Node} node The node to insert.
 * @param {boolean} before True to insert before, _FALSE to insert after.
 * @return {Node} The node added to the document.  This may be different
 *     than the node parameter because on IE we have to clone it.
 */
goog.dom.browserrange.AbstractRange.prototype.insertNode =
    goog.abstractMethod;


/**
 * Surrounds this range with the two given nodes.  The range may be disrupted
 * beyond recovery because of the way this splits nodes.
 * @param {Element} startNode The node to insert at the start.
 * @param {Element} endNode The node to insert at the end.
 */
goog.dom.browserrange.AbstractRange.prototype.surroundWithNodes =
    goog.abstractMethod;


/**
 * Collapses the range to one of its boundary points.
 * @param {boolean} toStart Whether to collapse to the start of the range.
 */
goog.dom.browserrange.AbstractRange.prototype.collapse =
    goog.abstractMethod;
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the W3C spec following range wrapper.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.browserrange.W3cRange');

//goog.require('goog.dom');
//goog.require('goog.dom.NodeType');
//goog.require('goog.dom.RangeEndpoint');
//goog.require('goog.dom.browserrange.AbstractRange');
//goog.require('goog.string');



/**
 * The constructor for W3C specific browser ranges.
 * @param {Range} range The range object.
 * @constructor
 * @extends {goog.dom.browserrange.AbstractRange}
 */
goog.dom.browserrange.W3cRange = function(range) {
  this.range_ = range;
};
goog.inherits(goog.dom.browserrange.W3cRange,
              goog.dom.browserrange.AbstractRange);


/**
 * Returns a browser range spanning the given node's contents.
 * @param {Node} node The node to select.
 * @return {Range} A browser range spanning the node's contents.
 * @protected
 */
goog.dom.browserrange.W3cRange.getBrowserRangeForNode = function(node) {
  var nodeRange = goog.dom.getOwnerDocument(node).createRange();

  if (node.nodeType == goog.dom.NodeType.TEXT) {
    nodeRange.setStart(node, 0);
    nodeRange.setEnd(node, node.length);
  } else {
    if (!goog.dom.browserrange.canContainRangeEndpoint(node)) {
      var rangeParent = node.parentNode;
      var rangeStartOffset = goog.array.indexOf(rangeParent.childNodes, node);
      nodeRange.setStart(rangeParent, rangeStartOffset);
      nodeRange.setEnd(rangeParent, rangeStartOffset + 1);
    } else {
      var tempNode, leaf = node;
      while ((tempNode = leaf.firstChild) &&
          goog.dom.browserrange.canContainRangeEndpoint(tempNode)) {
        leaf = tempNode;
      }
      nodeRange.setStart(leaf, 0);

      leaf = node;
      while ((tempNode = leaf.lastChild) &&
          goog.dom.browserrange.canContainRangeEndpoint(tempNode)) {
        leaf = tempNode;
      }
      nodeRange.setEnd(leaf, leaf.nodeType == goog.dom.NodeType.ELEMENT ?
          leaf.childNodes.length : leaf.length);
    }
  }

  return nodeRange;
};


/**
 * Returns a browser range spanning the given nodes.
 * @param {Node} startNode The node to start with - should not be a BR.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with - should not be a BR.
 * @param {number} endOffset The offset within the end node.
 * @return {Range} A browser range spanning the node's contents.
 * @protected
 */
goog.dom.browserrange.W3cRange.getBrowserRangeForNodes = function(startNode,
    startOffset, endNode, endOffset) {
  // Create and return the range.
  var nodeRange = goog.dom.getOwnerDocument(startNode).createRange();
  nodeRange.setStart(startNode, startOffset);
  nodeRange.setEnd(endNode, endOffset);
  return nodeRange;
};


/**
 * Creates a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.W3cRange} A Gecko range wrapper object.
 */
goog.dom.browserrange.W3cRange.createFromNodeContents = function(node) {
  return new goog.dom.browserrange.W3cRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node));
};


/**
 * Creates a range object that selects between the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {goog.dom.browserrange.W3cRange} A wrapper object.
 */
goog.dom.browserrange.W3cRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  return new goog.dom.browserrange.W3cRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode,
          startOffset, endNode, endOffset));
};


/**
 * @return {goog.dom.browserrange.W3cRange} A clone of this range.
 */
goog.dom.browserrange.W3cRange.prototype.clone = function() {
  return new this.constructor(this.range_.cloneRange());
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getBrowserRange = function() {
  return this.range_;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getContainer = function() {
  return this.range_.commonAncestorContainer;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getStartNode = function() {
  return this.range_.startContainer;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getStartOffset = function() {
  return this.range_.startOffset;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getEndNode = function() {
  return this.range_.endContainer;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getEndOffset = function() {
  return this.range_.endOffset;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.compareBrowserRangeEndpoints =
    function(range, thisEndpoint, otherEndpoint) {
  return this.range_.compareBoundaryPoints(
      otherEndpoint == goog.dom.RangeEndpoint.START ?
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].START_TO_START :
              goog.global['Range'].START_TO_END) :
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].END_TO_START :
              goog.global['Range'].END_TO_END),
      /** @type {Range} */ (range));
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.isCollapsed = function() {
  return this.range_.collapsed;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getText = function() {
  return this.range_.toString();
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.getValidHtml = function() {
  var div = goog.dom.getDomHelper(this.range_.startContainer).createDom('div');
  div.appendChild(this.range_.cloneContents());
  var result = div.innerHTML;

  if (goog.string.startsWith(result, '<') ||
      !this.isCollapsed() && !goog.string.contains(result, '<')) {
    // We attempt to mimic IE, which returns no containing element when a
    // only text nodes are selected, does return the containing element when
    // the selection is empty, and does return the element when multiple nodes
    // are selected.
    return result;
  }

  var container = this.getContainer();
  container = container.nodeType == goog.dom.NodeType.ELEMENT ? container :
      container.parentNode;

  var html = goog.dom.getOuterHtml(
      /** @type {Element} */ (container.cloneNode(_FALSE)));
  return html.replace('>', '>' + result);
};


// SELECTION MODIFICATION


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.select = function(reverse) {
  var win = goog.dom.getWindow(goog.dom.getOwnerDocument(this.getStartNode()));
  this.selectInternal(win.getSelection(), reverse);
};


/**
 * Select this range.
 * @param {Selection} selection Browser selection object.
 * @param {*} reverse Whether to select this range in reverse.
 * @protected
 */
goog.dom.browserrange.W3cRange.prototype.selectInternal = function(selection,
                                                                   reverse) {
  // Browser-specific tricks are needed to create reversed selections
  // programatically. For this generic W3C codepath, ignore the reverse
  // parameter.
  selection.removeAllRanges();
  selection.addRange(this.range_);
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.removeContents = function() {
  var range = this.range_;
  range.extractContents();

  if (range.startContainer.hasChildNodes()) {
    // Remove any now empty nodes surrounding the extracted contents.
    var rangeStartContainer =
        range.startContainer.childNodes[range.startOffset];
    if (rangeStartContainer) {
      var rangePrevious = rangeStartContainer.previousSibling;

      if (goog.dom.getRawTextContent(rangeStartContainer) == '') {
        goog.dom.removeNode(rangeStartContainer);
      }

      if (rangePrevious && goog.dom.getRawTextContent(rangePrevious) == '') {
        goog.dom.removeNode(rangePrevious);
      }
    }
  }
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.surroundContents = function(element) {
  this.range_.surroundContents(element);
  return element;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.insertNode = function(node, before) {
  var range = this.range_.cloneRange();
  range.collapse(before);
  range.insertNode(node);
  range.detach();

  return node;
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.surroundWithNodes = function(
    startNode, endNode) {
  var win = goog.dom.getWindow(
      goog.dom.getOwnerDocument(this.getStartNode()));
  var selectionRange = goog.dom.Range.createFromWindow(win);
  if (selectionRange) {
    var sNode = selectionRange.getStartNode();
    var eNode = selectionRange.getEndNode();
    var sOffset = selectionRange.getStartOffset();
    var eOffset = selectionRange.getEndOffset();
  }

  var clone1 = this.range_.cloneRange();
  var clone2 = this.range_.cloneRange();

  clone1.collapse(_FALSE);
  clone2.collapse(_TRUE);

  clone1.insertNode(endNode);
  clone2.insertNode(startNode);

  clone1.detach();
  clone2.detach();

  if (selectionRange) {
    // There are 4 ways that surroundWithNodes can wreck the saved
    // selection object. All of them happen when an inserted node splits
    // a text node, and one of the end points of the selection was in the
    // latter half of that text node.
    //
    // Clients of this library should use saveUsingCarets to avoid this
    // problem. Unfortunately, saveUsingCarets uses this method, so that's
    // not really an option for us. :( We just recompute the offsets.
    var isInsertedNode = function(n) {
      return n == startNode || n == endNode;
    };
    if (sNode.nodeType == goog.dom.NodeType.TEXT) {
      while (sOffset > sNode.length) {
        sOffset -= sNode.length;
        do {
          sNode = sNode.nextSibling;
        } while (isInsertedNode(sNode));
      }
    }

    if (eNode.nodeType == goog.dom.NodeType.TEXT) {
      while (eOffset > eNode.length) {
        eOffset -= eNode.length;
        do {
          eNode = eNode.nextSibling;
        } while (isInsertedNode(eNode));
      }
    }

    goog.dom.Range.createFromNodes(
        sNode, /** @type {number} */ (sOffset),
        eNode, /** @type {number} */ (eOffset)).select();
  }
};


/** @inheritDoc */
goog.dom.browserrange.W3cRange.prototype.collapse = function(toStart) {
  this.range_.collapse(toStart);
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the WebKit specific range wrapper.  Inherits most
 * functionality from W3CRange, but adds exceptions as necessary.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.browserrange.WebKitRange');

//goog.require('goog.dom.RangeEndpoint');
//goog.require('goog.dom.browserrange.W3cRange');
//goog.require('goog.userAgent');



/**
 * The constructor for WebKit specific browser ranges.
 * @param {Range} range The range object.
 * @constructor
 * @extends {goog.dom.browserrange.W3cRange}
 */
goog.dom.browserrange.WebKitRange = function(range) {
  goog.dom.browserrange.W3cRange.call(this, range);
};
goog.inherits(goog.dom.browserrange.WebKitRange,
              goog.dom.browserrange.W3cRange);


/**
 * Creates a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.WebKitRange} A WebKit range wrapper object.
 */
goog.dom.browserrange.WebKitRange.createFromNodeContents = function(node) {
  return new goog.dom.browserrange.WebKitRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node));
};


/**
 * Creates a range object that selects between the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {goog.dom.browserrange.WebKitRange} A wrapper object.
 */
goog.dom.browserrange.WebKitRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  return new goog.dom.browserrange.WebKitRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode,
          startOffset, endNode, endOffset));
};


/** @inheritDoc */
goog.dom.browserrange.WebKitRange.prototype.compareBrowserRangeEndpoints =
    function(range, thisEndpoint, otherEndpoint) {
  // Webkit pre-528 has some bugs where compareBoundaryPoints() doesn't work the
  // way it is supposed to, but if we reverse the sense of two comparisons,
  // it works fine.
  // https://bugs.webkit.org/show_bug.cgi?id=20738
  if (goog.userAgent.isVersion('528')) {
    return (goog.dom.browserrange.WebKitRange.superClass_.
                compareBrowserRangeEndpoints.call(
                    this, range, thisEndpoint, otherEndpoint));
  }
  return this.range_.compareBoundaryPoints(
      otherEndpoint == goog.dom.RangeEndpoint.START ?
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].START_TO_START :
              goog.global['Range'].END_TO_START) : // Sense reversed
          (thisEndpoint == goog.dom.RangeEndpoint.START ?
              goog.global['Range'].START_TO_END : // Sense reversed
              goog.global['Range'].END_TO_END),
      /** @type {Range} */ (range));
};


/** @inheritDoc */
goog.dom.browserrange.WebKitRange.prototype.selectInternal = function(
    selection, reversed) {
  // Unselect everything. This addresses a bug in Webkit where it sometimes
  // caches the old selection.
  // https://bugs.webkit.org/show_bug.cgi?id=20117
  selection.removeAllRanges();

  if (reversed) {
    selection.setBaseAndExtent(this.getEndNode(), this.getEndOffset(),
        this.getStartNode(), this.getStartOffset());
  } else {
    selection.setBaseAndExtent(this.getStartNode(), this.getStartOffset(),
        this.getEndNode(), this.getEndOffset());
  }
};
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Iterator subclass for DOM tree traversal.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.dom.NodeIterator');

//goog.require('goog.dom.TagIterator');



/**
 * A DOM tree traversal iterator.
 *
 * Starting with the given node, the iterator walks the DOM in order, reporting
 * events for each node.  The iterator acts as a prefix iterator:
 *
 * <pre>
 * &lt;div&gt;1&lt;span&gt;2&lt;/span&gt;3&lt;/div&gt;
 * </pre>
 *
 * Will return the following nodes:
 *
 * <code>[div, 1, span, 2, 3]</code>
 *
 * With the following depths
 *
 * <code>[1, 1, 2, 2, 1]</code>
 *
 * Imagining <code>|</code> represents iterator position, the traversal stops at
 * each of the following locations:
 *
 * <pre>&lt;div&gt;|1|&lt;span&gt;|2|&lt;/span&gt;3|&lt;/div&gt;</pre>
 *
 * The iterator can also be used in reverse mode, which will return the nodes
 * and states in the opposite order.  The depths will be slightly different
 * since, like in normal mode, the depth is computed *after* the last move.
 *
 * Lastly, it is possible to create an iterator that is unconstrained, meaning
 * that it will continue iterating until the end of the document instead of
 * until exiting the start node.
 *
 * @param {Node=} opt_node The start node.  Defaults to an empty iterator.
 * @param {boolean=} opt_reversed Whether to traverse the tree in reverse.
 * @param {boolean=} opt_unconstrained Whether the iterator is not constrained
 *     to the starting node and its children.
 * @param {number=} opt_depth The starting tree depth.
 * @constructor
 * @extends {goog.dom.TagIterator}
 */
goog.dom.NodeIterator = function(opt_node, opt_reversed,
    opt_unconstrained, opt_depth) {
  goog.dom.TagIterator.call(this, opt_node, opt_reversed, opt_unconstrained,
      _NULL, opt_depth);
};
goog.inherits(goog.dom.NodeIterator, goog.dom.TagIterator);


/**
 * Moves to the next position in the DOM tree.
 * @return {Node} Returns the next node, or throws a goog.iter.StopIteration
 *     exception if the end of the iterator's range has been reached.
 */
goog.dom.NodeIterator.prototype.next = function() {
  do {
    goog.dom.NodeIterator.superClass_.next.call(this);
  } while (this.isEndTag());

  return this.node;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the IE browser specific range wrapper.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.browserrange.IeRange');

//goog.require('goog.array');
//goog.require('goog.dom');
//goog.require('goog.dom.NodeIterator');
//goog.require('goog.dom.NodeType');
//goog.require('goog.dom.RangeEndpoint');
//goog.require('goog.dom.TagName');
//goog.require('goog.dom.browserrange.AbstractRange');
//goog.require('goog.iter');
//goog.require('goog.iter.StopIteration');
//goog.require('goog.string');



/**
 * The constructor for IE specific browser ranges.
 * @param {TextRange} range The range object.
 * @param {Document} doc The document the range exists in.
 * @constructor
 * @extends {goog.dom.browserrange.AbstractRange}
 */
goog.dom.browserrange.IeRange = function(range, doc) {
  /**
   * The browser range object this class wraps.
   * @type {TextRange}
   * @private
   */
  this.range_ = range;

  /**
   * The document the range exists in.
   * @type {Document}
   * @private
   */
  this.doc_ = doc;
};
goog.inherits(goog.dom.browserrange.IeRange,
    goog.dom.browserrange.AbstractRange);


/**
 * Returns a browser range spanning the given node's contents.
 * @param {Node} node The node to select.
 * @return {TextRange} A browser range spanning the node's contents.
 * @private
 */
goog.dom.browserrange.IeRange.getBrowserRangeForNode_ = function(node) {
  var nodeRange = goog.dom.getOwnerDocument(node).body.createTextRange();
  if (node.nodeType == goog.dom.NodeType.ELEMENT) {
    // Elements are easy.
    nodeRange.moveToElementText(node);
    // Note(user) : If there are no child nodes of the element, the
    // range.htmlText includes the element's outerHTML. The range created above
    // is not collapsed, and should be collapsed explicitly.
    // Example : node = <div></div>
    // But if the node is sth like <br>, it shouldnt be collapsed.
    if (goog.dom.browserrange.canContainRangeEndpoint(node) &&
        !node.childNodes.length) {
      nodeRange.collapse(_FALSE);
    }
  } else {
    // Text nodes are hard.
    // Compute the offset from the nearest element related position.
    var offset = 0;
    var sibling = node;
    while (sibling = sibling.previousSibling) {
      var nodeType = sibling.nodeType;
      if (nodeType == goog.dom.NodeType.TEXT) {
        offset += sibling.length;
      } else if (nodeType == goog.dom.NodeType.ELEMENT) {
        // Move to the space after this element.
        nodeRange.moveToElementText(sibling);
        break;
      }
    }

    if (!sibling) {
      nodeRange.moveToElementText(node.parentNode);
    }

    nodeRange.collapse(!sibling);

    if (offset) {
      nodeRange.move('character', offset);
    }

    nodeRange.moveEnd('character', node.length);
  }

  return nodeRange;
};


/**
 * Returns a browser range spanning the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {TextRange} A browser range spanning the node's contents.
 * @private
 */
goog.dom.browserrange.IeRange.getBrowserRangeForNodes_ = function(startNode,
    startOffset, endNode, endOffset) {
  // Create a range starting at the correct start position.
  var child, collapse = _FALSE;
  if (startNode.nodeType == goog.dom.NodeType.ELEMENT) {
    child = startNode.childNodes[startOffset];
    collapse = !child;
    startNode = child || startNode.lastChild || startNode;
    startOffset = 0;
  }
  var leftRange = goog.dom.browserrange.IeRange.
      getBrowserRangeForNode_(startNode);

  // This happens only when startNode is a text node.
  if (startOffset) {
    leftRange.move('character', startOffset);
  }


  // The range movements in IE are still an approximation to the standard W3C
  // behavior, and IE has its trickery when it comes to htmlText and text
  // properties of the range. So we short-circuit computation whenever we can.
  if (startNode == endNode && startOffset == endOffset) {
    leftRange.collapse(_TRUE);
    return leftRange;
  }

  // This can happen only when the startNode is an element, and there is no node
  // at the given offset. We start at the last point inside the startNode in
  // that case.
  if (collapse) {
    leftRange.collapse(_FALSE);
  }

  // Create a range that ends at the right position.
  collapse = _FALSE;
  if (endNode.nodeType == goog.dom.NodeType.ELEMENT) {
    child = endNode.childNodes[endOffset];
    endNode = child || endNode.lastChild || endNode;
    endOffset = 0;
    collapse = !child;
  }
  var rightRange = goog.dom.browserrange.IeRange.
      getBrowserRangeForNode_(endNode);
  rightRange.collapse(!collapse);
  if (endOffset) {
    rightRange.moveEnd('character', endOffset);
  }

  // Merge and return.
  leftRange.setEndPoint('EndToEnd', rightRange);
  return leftRange;
};


/**
 * Create a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.IeRange} An IE range wrapper object.
 */
goog.dom.browserrange.IeRange.createFromNodeContents = function(node) {
  var range = new goog.dom.browserrange.IeRange(
      goog.dom.browserrange.IeRange.getBrowserRangeForNode_(node),
      goog.dom.getOwnerDocument(node));

  if (!goog.dom.browserrange.canContainRangeEndpoint(node)) {
    range.startNode_ = range.endNode_ = range.parentNode_ = node.parentNode;
    range.startOffset_ = goog.array.indexOf(range.parentNode_.childNodes, node);
    range.endOffset_ = range.startOffset_ + 1;
  } else {
    // Note(user) : Emulate the behavior of W3CRange - Go to deepest possible
    // range containers on both edges. It seems W3CRange did this to match the
    // IE behavior, and now it is a circle. Changing W3CRange may break clients
    // in all sorts of ways.
    var tempNode, leaf = node;
    while ((tempNode = leaf.firstChild) &&
           goog.dom.browserrange.canContainRangeEndpoint(tempNode)) {
      leaf = tempNode;
    }
    range.startNode_ = leaf;
    range.startOffset_ = 0;

    leaf = node;
    while ((tempNode = leaf.lastChild) &&
           goog.dom.browserrange.canContainRangeEndpoint(tempNode)) {
      leaf = tempNode;
    }
    range.endNode_ = leaf;
    range.endOffset_ = leaf.nodeType == goog.dom.NodeType.ELEMENT ?
                       leaf.childNodes.length : leaf.length;
    range.parentNode_ = node;
  }
  return range;
};


/**
 * Static method that returns the proper type of browser range.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the start node.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the end node.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.IeRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  var range = new goog.dom.browserrange.IeRange(
      goog.dom.browserrange.IeRange.getBrowserRangeForNodes_(startNode,
          startOffset, endNode, endOffset),
      goog.dom.getOwnerDocument(startNode));
  range.startNode_ = startNode;
  range.startOffset_ = startOffset;
  range.endNode_ = endNode;
  range.endOffset_ = endOffset;
  return range;
};


// Even though goog.dom.TextRange does similar caching to below, keeping these
// caches allows for better performance in the get*Offset methods.


/**
 * Lazy cache of the node containing the entire selection.
 * @type {Node}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.parentNode_ = _NULL;


/**
 * Lazy cache of the node containing the start of the selection.
 * @type {Node}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.startNode_ = _NULL;


/**
 * Lazy cache of the node containing the end of the selection.
 * @type {Node}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.endNode_ = _NULL;


/**
 * Lazy cache of the offset in startNode_ where this range starts.
 * @type {number}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.startOffset_ = -1;


/**
 * Lazy cache of the offset in endNode_ where this range ends.
 * @type {number}
 * @private
 */
goog.dom.browserrange.IeRange.prototype.endOffset_ = -1;


/**
 * @return {goog.dom.browserrange.IeRange} A clone of this range.
 */
goog.dom.browserrange.IeRange.prototype.clone = function() {
  var range = new goog.dom.browserrange.IeRange(
      this.range_.duplicate(), this.doc_);
  range.parentNode_ = this.parentNode_;
  range.startNode_ = this.startNode_;
  range.endNode_ = this.endNode_;
  return range;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getBrowserRange = function() {
  return this.range_;
};


/**
 * Clears the cached values for containers.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.clearCachedValues_ = function() {
  this.parentNode_ = this.startNode_ = this.endNode_ = _NULL;
  this.startOffset_ = this.endOffset_ = -1;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getContainer = function() {
  if (!this.parentNode_) {
    var selectText = this.range_.text;

    // If the selection ends with spaces, we need to remove these to get the
    // parent container of only the real contents.  This is to get around IE's
    // inconsistency where it selects the spaces after a word when you double
    // click, but leaves out the spaces during execCommands.
    var range = this.range_.duplicate();
    // We can't use goog.string.trimRight, as that will remove other whitespace
    // too.
    var rightTrimmedSelectText = selectText.replace(/ +$/, '');
    var numSpacesAtEnd = selectText.length - rightTrimmedSelectText.length;
    if (numSpacesAtEnd) {
      range.moveEnd('character', -numSpacesAtEnd);
    }

    // Get the parent node.  This should be the end, but alas, it is not.
    var parent = range.parentElement();

    var htmlText = range.htmlText;
    var htmlTextLen = goog.string.stripNewlines(htmlText).length;
    if (this.isCollapsed() && htmlTextLen > 0) {
      return (this.parentNode_ = parent);
    }

    // Deal with selection bug where IE thinks one of the selection's children
    // is actually the selection's parent. Relies on the assumption that the
    // HTML text of the parent container is longer than the length of the
    // selection's HTML text.

    // Also note IE will sometimes insert \r and \n whitespace, which should be
    // disregarded. Otherwise the loop may run too long and return wrong parent
    while (htmlTextLen > goog.string.stripNewlines(parent.outerHTML).length) {
      parent = parent.parentNode;
    }

    // Deal with IE's selecting the outer tags when you double click
    // If the innerText is the same, then we just want the inner node
    while (parent.childNodes.length == 1 &&
           parent.firstChild &&     // FTDUEDTR-1212
           parent.innerText == goog.dom.browserrange.IeRange.getNodeText_(
               parent.firstChild)) {
      // A container should be an element which can have children or a text
      // node. Elements like IMG, BR, etc. can not be containers.
      if (!goog.dom.browserrange.canContainRangeEndpoint(parent.firstChild)) {
        break;
      }
      parent = parent.firstChild;
    }

    // If the selection is empty, we may need to do extra work to position it
    // properly.
    if (selectText.length == 0) {
      parent = this.findDeepestContainer_(parent);
    }

    this.parentNode_ = parent;
  }

  return this.parentNode_;
};


/**
 * Helper method to find the deepest parent for this range, starting
 * the search from {@code node}, which must contain the range.
 * @param {Node} node The node to start the search from.
 * @return {Node} The deepest parent for this range.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.findDeepestContainer_ = function(node) {
  var childNodes = node.childNodes;
  for (var i = 0, len = childNodes.length; i < len; i++) {
    var child = childNodes[i];

    if (goog.dom.browserrange.canContainRangeEndpoint(child)) {
      var childRange =
          goog.dom.browserrange.IeRange.getBrowserRangeForNode_(child);
      var start = goog.dom.RangeEndpoint.START;
      var end = goog.dom.RangeEndpoint.END;

      // There are two types of erratic nodes where the range over node has
      // different htmlText than the node's outerHTML.
      // Case 1 - A node with magic &nbsp; child. In this case :
      //    nodeRange.htmlText shows &nbsp; ('<p>&nbsp;</p>), while
      //    node.outerHTML doesn't show the magic node (<p></p>).
      // Case 2 - Empty span. In this case :
      //    node.outerHTML shows '<span></span>'
      //    node.htmlText is just empty string ''.
      var isChildRangeErratic = (childRange.htmlText != child.outerHTML);

      // Moreover the inRange comparison fails only when the
      var isNativeInRangeErratic = this.isCollapsed() && isChildRangeErratic;

      // In case 2 mentioned above, childRange is also collapsed. So we need to
      // compare start of this range with both start and end of child range.
      var inChildRange = isNativeInRangeErratic ?
          (this.compareBrowserRangeEndpoints(childRange, start, start) >= 0 &&
              this.compareBrowserRangeEndpoints(childRange, start, end) <= 0) :
           this.range_.inRange(childRange);
      if (inChildRange) {
        return this.findDeepestContainer_(child);
      }
    }
  }

  return node;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getStartNode = function() {
  if (!this.startNode_) {
    this.startNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.START);
    if (this.isCollapsed()) {
      this.endNode_ = this.startNode_;
    }
  }
  return this.startNode_;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getStartOffset = function() {
  if (this.startOffset_ < 0) {
    this.startOffset_ = this.getOffset_(goog.dom.RangeEndpoint.START);
    if (this.isCollapsed()) {
      this.endOffset_ = this.startOffset_;
    }
  }
  return this.startOffset_;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getEndNode = function() {
  if (this.isCollapsed()) {
    return this.getStartNode();
  }
  if (!this.endNode_) {
    this.endNode_ = this.getEndpointNode_(goog.dom.RangeEndpoint.END);
  }
  return this.endNode_;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getEndOffset = function() {
  if (this.isCollapsed()) {
    return this.getStartOffset();
  }
  if (this.endOffset_ < 0) {
    this.endOffset_ = this.getOffset_(goog.dom.RangeEndpoint.END);
    if (this.isCollapsed()) {
      this.startOffset_ = this.endOffset_;
    }
  }
  return this.endOffset_;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.compareBrowserRangeEndpoints = function(
    range, thisEndpoint, otherEndpoint) {
  return this.range_.compareEndPoints(
      (thisEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End') +
      'To' +
      (otherEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End'),
      range);
};


/**
 * Recurses to find the correct node for the given endpoint.
 * @param {goog.dom.RangeEndpoint} endpoint The endpoint to get the node for.
 * @param {Node=} opt_node Optional node to start the search from.
 * @return {Node} The deepest node containing the endpoint.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.getEndpointNode_ = function(endpoint,
    opt_node) {

  /** @type {Node} */
  var node = opt_node || this.getContainer();

  // If we're at a leaf in the DOM, we're done.
  if (!node || !node.firstChild) {
    return node;
  }

  var start = goog.dom.RangeEndpoint.START, end = goog.dom.RangeEndpoint.END;
  var isStartEndpoint = endpoint == start;

  // Find the first/last child that overlaps the selection.
  // NOTE(user) : One of the children can be the magic &nbsp; node. This
  // node will have only nodeType property as valid and accessible. All other
  // dom related properties like ownerDocument, parentNode, nextSibling etc
  // cause error when accessed. Therefore use the for-loop on childNodes to
  // iterate.
  for (var j = 0, length = node.childNodes.length; j < length; j++) {
    var i = isStartEndpoint ? j : length - j - 1;
    var child = node.childNodes[i];
    var childRange;
    try {
      childRange = goog.dom.browserrange.createRangeFromNodeContents(child);
    } catch (e) {
      // If the child is the magic &nbsp; node, then the above will throw
      // error. The magic node exists only when editing using keyboard, so can
      // not add any unit test.
      continue;
    }
    var ieRange = childRange.getBrowserRange();

    // Case 1 : Finding end points when this range is collapsed.
    // Note that in case of collapsed range, getEnd{Node,Offset} call
    // getStart{Node,Offset}.
    if (this.isCollapsed()) {
      // Handle situations where caret is not in a text node. In such cases,
      // the adjacent child won't be a valid range endpoint container.
      if (!goog.dom.browserrange.canContainRangeEndpoint(child)) {
        // The following handles a scenario like <div><BR>[caret]<BR></div>,
        // where point should be (div, 1).
        if (this.compareBrowserRangeEndpoints(ieRange, start, start) == 0) {
          this.startOffset_ = this.endOffset_ = i;
          return node;
        }
      } else if (childRange.containsRange(this)) {
        // For collapsed range, we should invert the containsRange check with
        // childRange.
        return this.getEndpointNode_(endpoint, child);
      }

    // Case 2 - The first child encountered to have overlap this range is
    // contained entirely in this range.
    } else if (this.containsRange(childRange)) {
      // If it is an element which can not be a range endpoint container, the
      // current child offset can be used to deduce the endpoint offset.
      if (!goog.dom.browserrange.canContainRangeEndpoint(child)) {

        // Container can't be any deeper, so current node is the container.
        if (isStartEndpoint) {
          this.startOffset_ = i;
        } else {
          this.endOffset_ = i + 1;
        }
        return node;
      }

      // If child can contain range endpoints, recurse inside this child.
      while(child.childNodes.length == 1) {
        child = child.firstChild;
      }
      return this.getEndpointNode_(endpoint, child);

    // Case 3 - Partial non-adjacency overlap.
    } else if (this.compareBrowserRangeEndpoints(ieRange, start, end) < 0 &&
               this.compareBrowserRangeEndpoints(ieRange, end, start) > 0) {
      // If this child overlaps the selection partially, recurse down to find
      // the first/last child the next level down that overlaps the selection
      // completely. We do not consider edge-adjacency (== 0) as overlap.
    	
      while(child.childNodes.length == 1 && child.firstChild) {
        child = child.firstChild;
      }
      return this.getEndpointNode_(endpoint, child);
    }

  }

  // None of the children of this node overlapped the selection, that means
  // the selection starts/ends in this node directly.
  return node;
};


/**
 * Compares one endpoint of this range with the endpoint of a node.
 * For internal methods, we should prefer this method to containsNode.
 * containsNode has a lot of _FALSE negatives when we're dealing with
 * {@code <br>} tags.
 *
 * @param {Node} node The node to compare against.
 * @param {goog.dom.RangeEndpoint} thisEndpoint The endpoint of this range
 *     to compare with.
 * @param {goog.dom.RangeEndpoint} otherEndpoint The endpoint of the node
 *     to compare with.
 * @return {number} 0 if the endpoints are equal, negative if this range
 *     endpoint comes before the other node endpoint, and positive otherwise.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.compareNodeEndpoints_ =
    function(node, thisEndpoint, otherEndpoint) {
  return this.range_.compareEndPoints(
      (thisEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End') +
      'To' +
      (otherEndpoint == goog.dom.RangeEndpoint.START ? 'Start' : 'End'),
      goog.dom.browserrange.createRangeFromNodeContents(node).
          getBrowserRange());
};


/**
 * Returns the offset into the start/end container.
 * @param {goog.dom.RangeEndpoint} endpoint The endpoint to get the offset for.
 * @param {Node=} opt_container The container to get the offset relative to.
 *     Defaults to the value returned by getStartNode/getEndNode.
 * @return {number} The offset.
 * @private
 */
goog.dom.browserrange.IeRange.prototype.getOffset_ = function(endpoint,
    opt_container) {
  var isStartEndpoint = endpoint == goog.dom.RangeEndpoint.START;
  var container = opt_container ||
      (isStartEndpoint ? this.getStartNode() : this.getEndNode());

  if (container.nodeType == goog.dom.NodeType.ELEMENT) {
    // Find the first/last child that overlaps the selection
    var children = container.childNodes;
    var len = children.length;
    var edge = isStartEndpoint ? 0 : len - 1;
    var sign = isStartEndpoint ? 1 : - 1;

    // We find the index in the child array of the endpoint of the selection.
    for (var i = edge; i >= 0 && i < len; i += sign) {
      var child = children[i];
      // Ignore the child nodes, which could be end point containers.
      if (goog.dom.browserrange.canContainRangeEndpoint(child)) {
        continue;
      }
      // Stop looping when we reach the edge of the selection.
      var endPointCompare =
          this.compareNodeEndpoints_(child, endpoint, endpoint);
      if (endPointCompare == 0) {
        return isStartEndpoint ? i : i + 1;
      }
    }

    // When starting from the end in an empty container, we erroneously return
    // -1: fix this to return 0.
    return i == -1 ? 0 : i;
  } else {
    // Get a temporary range object.
    var range = this.range_.duplicate();

    // Create a range that selects the entire container.
    var nodeRange = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(
        container);

    // Now, intersect our range with the container range - this should give us
    // the part of our selection that is in the container.
    range.setEndPoint(isStartEndpoint ? 'EndToEnd' : 'StartToStart', nodeRange);

    var rangeLength = range.text.length;
    return isStartEndpoint ? container.length - rangeLength : rangeLength;
  }
};


/**
 * Returns the text of the given node.  Uses IE specific properties.
 * @param {Node} node The node to retrieve the text of.
 * @return {string} The node's text.
 * @private
 */
goog.dom.browserrange.IeRange.getNodeText_ = function(node) {
  return node.nodeType == goog.dom.NodeType.TEXT ?
         node.nodeValue : node.innerText;
};


/**
 * Tests whether this range is valid (i.e. whether its endpoints are still in
 * the document).  A range becomes invalid when, after this object was created,
 * either one or both of its endpoints are removed from the document.  Use of
 * an invalid range can lead to runtime errors, particularly in IE.
 * @return {boolean} Whether the range is valid.
 */
goog.dom.browserrange.IeRange.prototype.isRangeInDocument = function() {
  var range = this.doc_.body.createTextRange();
  range.moveToElementText(this.doc_.body);

  return this.containsRange(
      new goog.dom.browserrange.IeRange(range, this.doc_), _TRUE);
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.isCollapsed = function() {
  // Note(user) : The earlier implementation used (range.text == ''), but this
  // fails when (range.htmlText == '<br>')
  // Alternative: this.range_.htmlText == '';
  return this.range_.compareEndPoints('StartToEnd', this.range_) == 0;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getText = function() {
  return this.range_.text;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.getValidHtml = function() {
  return this.range_.htmlText;
};


// SELECTION MODIFICATION


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.select = function(opt_reverse) {
  // IE doesn't support programmatic reversed selections.
  this.range_.select();
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.removeContents = function() {
  if (this.range_.htmlText) {
    // Store some before-removal state.
    var startNode = this.getStartNode();
    var endNode = this.getEndNode();
    var oldText = this.range_.text;

    // IE sometimes deletes nodes unrelated to the selection.  This trick fixes
    // that problem most of the time.  Even though it looks like a no-op, it is
    // somehow changing IE's internal state such that empty unrelated nodes are
    // no longer deleted.
    var clone = this.range_.duplicate();
    clone.moveStart('character', 1);
    clone.moveStart('character', -1);

    // However, sometimes when the range is empty, moving the start back and
    // forth ends up changing the range.  This indicates a case we need to
    // handle manually.
    if (clone.text != oldText) {
      // Delete all nodes entirely contained in the range.
      var iter = new goog.dom.NodeIterator(startNode, _FALSE, _TRUE);
      var toDelete = [];
      goog.iter.forEach(iter, function(node) {
        // Any text node we encounter here is by definition contained entirely
        // in the range.
        if (node.nodeType != goog.dom.NodeType.TEXT &&
            this.containsNode(node)) {
          toDelete.push(node);
          iter.skipTag();
        }
        if (node == endNode) {
          throw goog.iter.StopIteration;
        }
      });
      this.collapse(_TRUE);
      goog.array.forEach(toDelete, goog.dom.removeNode);

      this.clearCachedValues_();
      return;
    }

    // Outside of the unfortunate cases where we have to handle deletion
    // manually, we can use the browser's native deletion code.
    this.range_ = clone;
    this.range_.text = '';
    this.clearCachedValues_();

    // Unfortunately, when deleting a portion of a single text node, IE creates
    // an extra text node unlike other browsers which just change the text in
    // the node.  We normalize for that behavior here, making IE behave like all
    // the other browsers.
    var newStartNode = this.getStartNode();
    var newStartOffset = this.getStartOffset();
    /** @preserveTry */
    try {
      var sibling = startNode.nextSibling;
      if (startNode == endNode && startNode.parentNode &&
          startNode.nodeType == goog.dom.NodeType.TEXT &&
          sibling && sibling.nodeType == goog.dom.NodeType.TEXT) {
        startNode.nodeValue += sibling.nodeValue;
        goog.dom.removeNode(sibling);

        // Make sure to reselect the appropriate position.
        this.range_ = goog.dom.browserrange.IeRange.getBrowserRangeForNode_(
            newStartNode);
        this.range_.move('character', newStartOffset);
        this.clearCachedValues_();
      }
    } catch (e) {
      // IE throws errors on orphaned nodes.
    }
  }
};


/**
 * @param {TextRange} range The range to get a dom helper for.
 * @return {goog.dom.DomHelper} A dom helper for the document the range
 *     resides in.
 * @private
 */
goog.dom.browserrange.IeRange.getDomHelper_ = function(range) {
  return goog.dom.getDomHelper(range.parentElement());
};


/**
 * Pastes the given element into the given range, returning the resulting
 * element.
 * @param {TextRange} range The range to paste into.
 * @param {Element} element The node to insert a copy of.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper object for the document
 *     the range resides in.
 * @return {Element} The resulting copy of element.
 * @private
 */
goog.dom.browserrange.IeRange.pasteElement_ = function(range, element,
    opt_domHelper) {
  opt_domHelper = opt_domHelper || goog.dom.browserrange.IeRange.getDomHelper_(
      range);

  // Make sure the node has a unique id.
  var id;
  var originalId = id = element.id;
  if (!id) {
    id = element.id = goog.string.createUniqueString();
  }

  // Insert (a clone of) the node.
  range.pasteHTML(element.outerHTML);

  // Pasting the outerHTML of the modified element into the document creates
  // a clone of the element argument.  We want to return a reference to the
  // clone, not the original.  However we need to remove the temporary ID
  // first.
  element = opt_domHelper.getElement(id);

  // If element is null here, we failed.
  if (element) {
    if (!originalId) {
      element.removeAttribute('id');
    }
  }

  return element;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.surroundContents = function(element) {
  // Make sure the element is detached from the document.
  goog.dom.removeNode(element);

  // IE more or less guarantees that range.htmlText is well-formed & valid.
  element.innerHTML = this.range_.htmlText;
  element = goog.dom.browserrange.IeRange.pasteElement_(this.range_, element);

  // If element is null here, we failed.
  if (element) {
    this.range_.moveToElementText(element);
  }

  this.clearCachedValues_();

  return element;
};


/**
 * Internal handler for inserting a node.
 * @param {TextRange} clone A clone of this range's browser range object.
 * @param {Node} node The node to insert.
 * @param {boolean} before Whether to insert the node before or after the range.
 * @param {goog.dom.DomHelper=} opt_domHelper The dom helper to use.
 * @return {Node} The resulting copy of node.
 * @private
 */
goog.dom.browserrange.IeRange.insertNode_ = function(clone, node,
    before, opt_domHelper) {
  // Get a DOM helper.
  opt_domHelper = opt_domHelper || goog.dom.browserrange.IeRange.getDomHelper_(
      clone);

  // If it's not an element, wrap it in one.
  var isNonElement;
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    isNonElement = _TRUE;
    node = opt_domHelper.createDom(goog.dom.TagName.DIV, _NULL, node);
  }

  clone.collapse(before);
  node = goog.dom.browserrange.IeRange.pasteElement_(clone,
      /** @type {Element} */ (node), opt_domHelper);

  // If we didn't want an element, unwrap the element and return the node.
  if (isNonElement) {
    // pasteElement_() may have returned a copy of the wrapper div, and the
    // node it wraps could also be a new copy. So we must extract that new
    // node from the new wrapper.
    var newNonElement = node.firstChild;
    opt_domHelper.flattenElement(node);
    node = newNonElement;
  }

  return node;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.insertNode = function(node, before) {
  var output = goog.dom.browserrange.IeRange.insertNode_(
      this.range_.duplicate(), node, before);
  this.clearCachedValues_();
  return output;
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.surroundWithNodes = function(
    startNode, endNode) {
  var clone1 = this.range_.duplicate();
  var clone2 = this.range_.duplicate();
  goog.dom.browserrange.IeRange.insertNode_(clone1, startNode, _TRUE);
  goog.dom.browserrange.IeRange.insertNode_(clone2, endNode, _FALSE);

  this.clearCachedValues_();
};


/** @inheritDoc */
goog.dom.browserrange.IeRange.prototype.collapse = function(toStart) {
  this.range_.collapse(toStart);

  if (toStart) {
    this.endNode_ = this.startNode_;
    this.endOffset_ = this.startOffset_;
  } else {
    this.startNode_ = this.endNode_;
    this.startOffset_ = this.endOffset_;
  }
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the Gecko specific range wrapper.  Inherits most
 * functionality from W3CRange, but adds exceptions as necessary.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.browserrange.GeckoRange');

//goog.require('goog.dom.browserrange.W3cRange');



/**
 * The constructor for Gecko specific browser ranges.
 * @param {Range} range The range object.
 * @constructor
 * @extends {goog.dom.browserrange.W3cRange}
 */
goog.dom.browserrange.GeckoRange = function(range) {
  goog.dom.browserrange.W3cRange.call(this, range);
};
goog.inherits(goog.dom.browserrange.GeckoRange, goog.dom.browserrange.W3cRange);


/**
 * Creates a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.GeckoRange} A Gecko range wrapper object.
 */
goog.dom.browserrange.GeckoRange.createFromNodeContents = function(node) {
  return new goog.dom.browserrange.GeckoRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node));
};


/**
 * Creates a range object that selects between the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.
 * @return {goog.dom.browserrange.GeckoRange} A wrapper object.
 */
goog.dom.browserrange.GeckoRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  return new goog.dom.browserrange.GeckoRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode,
          startOffset, endNode, endOffset));
};


/** @inheritDoc */
goog.dom.browserrange.GeckoRange.prototype.selectInternal = function(
    selection, reversed) {
  var anchorNode = reversed ? this.getEndNode() : this.getStartNode();
  var anchorOffset = reversed ? this.getEndOffset() : this.getStartOffset();
  var focusNode = reversed ? this.getStartNode() : this.getEndNode();
  var focusOffset = reversed ? this.getStartOffset() : this.getEndOffset();

  selection.collapse(anchorNode, anchorOffset);
  if (anchorNode != focusNode || anchorOffset != focusOffset) {
    selection.extend(focusNode, focusOffset);
  }
};
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the Opera specific range wrapper.  Inherits most
 * functionality from W3CRange, but adds exceptions as necessary.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 */


goog.provide('goog.dom.browserrange.OperaRange');

//goog.require('goog.dom.browserrange.W3cRange');



/**
 * The constructor for Opera specific browser ranges.
 * @param {Range} range The range object.
 * @constructor
 * @extends {goog.dom.browserrange.W3cRange}
 */
goog.dom.browserrange.OperaRange = function(range) {
  goog.dom.browserrange.W3cRange.call(this, range);
};
goog.inherits(goog.dom.browserrange.OperaRange, goog.dom.browserrange.W3cRange);


/**
 * Creates a range object that selects the given node's text.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.OperaRange} A Opera range wrapper object.
 */
goog.dom.browserrange.OperaRange.createFromNodeContents = function(node) {
  return new goog.dom.browserrange.OperaRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNode(node));
};


/**
 * Creates a range object that selects between the given nodes.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.
 * @return {goog.dom.browserrange.OperaRange} A wrapper object.
 */
goog.dom.browserrange.OperaRange.createFromNodes = function(startNode,
    startOffset, endNode, endOffset) {
  return new goog.dom.browserrange.OperaRange(
      goog.dom.browserrange.W3cRange.getBrowserRangeForNodes(startNode,
          startOffset, endNode, endOffset));
};


/** @inheritDoc */
goog.dom.browserrange.OperaRange.prototype.selectInternal = function(
    selection, reversed) {
  // Avoid using addRange as we have to removeAllRanges first, which
  // blurs editable fields in Opera.
  selection.collapse(this.getStartNode(), this.getStartOffset());
  if (this.getEndNode() != this.getStartNode() ||
      this.getEndOffset() != this.getStartOffset()) {
    selection.extend(this.getEndNode(), this.getEndOffset());
  }
  // This can happen if the range isn't in an editable field.
  if (selection.rangeCount == 0) {
    selection.addRange(this.range_);
  }
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the browser range namespace and interface, as
 * well as several useful utility functions.
 *
 * DO NOT USE THIS FILE DIRECTLY.  Use goog.dom.Range instead.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 *
 * @supported IE6, IE7, FF1.5+, Safari.
 */


goog.provide('goog.dom.browserrange');
goog.provide('goog.dom.browserrange.Error');

//goog.require('goog.dom');
//goog.require('goog.dom.browserrange.GeckoRange');
//goog.require('goog.dom.browserrange.IeRange');
//goog.require('goog.dom.browserrange.OperaRange');
//goog.require('goog.dom.browserrange.W3cRange');
//goog.require('goog.dom.browserrange.WebKitRange');
//goog.require('goog.userAgent');


/**
 * Common error constants.
 * @enum {string}
 */
goog.dom.browserrange.Error = {
  NOT_IMPLEMENTED: 'Not Implemented'
};


// NOTE(robbyw): While it would be nice to eliminate the duplicate switches
//               below, doing so uncovers bugs in the JsCompiler in which
//               necessary code is stripped out.


/**
 * Static method that returns the proper type of browser range.
 * @param {Range|TextRange} range A browser range object.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.createRange = function(range) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) {
    return new goog.dom.browserrange.IeRange(
        /** @type {TextRange} */ (range),
        goog.dom.getOwnerDocument(range.parentElement()));
  } else if (goog.userAgent.WEBKIT) {
    return new goog.dom.browserrange.WebKitRange(
        /** @type {Range} */ (range));
  } else if (goog.userAgent.GECKO) {
    return new goog.dom.browserrange.GeckoRange(
        /** @type {Range} */ (range));
  } else if (goog.userAgent.OPERA) {
    return new goog.dom.browserrange.OperaRange(
        /** @type {Range} */ (range));
  } else {
    // Default other browsers, including Opera, to W3c ranges.
    return new goog.dom.browserrange.W3cRange(
        /** @type {Range} */ (range));
  }
};


/**
 * Static method that returns the proper type of browser range.
 * @param {Node} node The node to select.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.createRangeFromNodeContents = function(node) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) {
    return goog.dom.browserrange.IeRange.createFromNodeContents(node);
  } else if (goog.userAgent.WEBKIT) {
    return goog.dom.browserrange.WebKitRange.createFromNodeContents(node);
  } else if (goog.userAgent.GECKO) {
    return goog.dom.browserrange.GeckoRange.createFromNodeContents(node);
  } else if (goog.userAgent.OPERA) {
    return goog.dom.browserrange.OperaRange.createFromNodeContents(node);
  } else {
    // Default other browsers to W3c ranges.
    return goog.dom.browserrange.W3cRange.createFromNodeContents(node);
  }
};


/**
 * Static method that returns the proper type of browser range.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.  This is
 *     either the index into the childNodes array for element startNodes or
 *     the index into the character array for text startNodes.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.  This is
 *     either the index into the childNodes array for element endNodes or
 *     the index into the character array for text endNodes.
 * @return {goog.dom.browserrange.AbstractRange} A wrapper object.
 */
goog.dom.browserrange.createRangeFromNodes = function(startNode, startOffset,
    endNode, endOffset) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) {
    return goog.dom.browserrange.IeRange.createFromNodes(startNode, startOffset,
        endNode, endOffset);
  } else if (goog.userAgent.WEBKIT) {
    return goog.dom.browserrange.WebKitRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  } else if (goog.userAgent.GECKO) {
    return goog.dom.browserrange.GeckoRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  } else if (goog.userAgent.OPERA) {
    return goog.dom.browserrange.OperaRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  } else {
    // Default other browsers to W3c ranges.
    return goog.dom.browserrange.W3cRange.createFromNodes(startNode,
        startOffset, endNode, endOffset);
  }
};


/**
 * Tests whether the given node can contain a range end point.
 * @param {Node} node The node to check.
 * @return {boolean} Whether the given node can contain a range end point.
 */
goog.dom.browserrange.canContainRangeEndpoint = function(node) {
  // NOTE(user, bloom): This is not complete, as divs with style -
  // 'display:inline-block' or 'position:absolute' can also not contain range
  // endpoints. A more complete check is to see if that element can be partially
  // selected (can be container) or not.
  return goog.dom.canHaveChildren(node) ||
      node.nodeType == goog.dom.NodeType.TEXT;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with text ranges in HTML documents.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.TextRange');

//goog.require('goog.array');
//goog.require('goog.dom');
//goog.require('goog.dom.AbstractRange');
//goog.require('goog.dom.RangeType');
//goog.require('goog.dom.SavedRange');
//goog.require('goog.dom.TagName');
//goog.require('goog.dom.TextRangeIterator');
//goog.require('goog.dom.browserrange');
//goog.require('goog.string');
//goog.require('goog.userAgent');



/**
 * Create a new text selection with no properties.  Do not use this constructor:
 * use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractRange}
 */
goog.dom.TextRange = function() {
};
goog.inherits(goog.dom.TextRange, goog.dom.AbstractRange);


/**
 * Create a new range wrapper from the given browser range object.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Range|TextRange} range The browser range object.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {goog.dom.TextRange} A range wrapper object.
 */
goog.dom.TextRange.createFromBrowserRange = function(range, opt_isReversed) {
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(
      goog.dom.browserrange.createRange(range), opt_isReversed);
};


/**
 * Create a new range wrapper from the given browser range wrapper.
 * @param {goog.dom.browserrange.AbstractRange} browserRange The browser range
 *     wrapper.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {goog.dom.TextRange} A range wrapper object.
 * @private
 */
goog.dom.TextRange.createFromBrowserRangeWrapper_ = function(browserRange,
    opt_isReversed) {
  var range = new goog.dom.TextRange();

  // Initialize the range as a browser range wrapper type range.
  range.browserRangeWrapper_ = browserRange;
  range.isReversed_ = !!opt_isReversed;

  return range;
};


/**
 * Create a new range wrapper that selects the given node's text.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Node} node The node to select.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {goog.dom.TextRange} A range wrapper object.
 */
goog.dom.TextRange.createFromNodeContents = function(node, opt_isReversed) {
  return goog.dom.TextRange.createFromBrowserRangeWrapper_(
      goog.dom.browserrange.createRangeFromNodeContents(node),
      opt_isReversed);
};


/**
 * Create a new range wrapper that selects the area between the given nodes,
 * accounting for the given offsets.  Do not use this method directly - please
 * use goog.dom.Range.createFrom* instead.
 * @param {Node} anchorNode The node to start with.
 * @param {number} anchorOffset The offset within the node to start.
 * @param {Node} focusNode The node to end with.
 * @param {number} focusOffset The offset within the node to end.
 * @return {goog.dom.TextRange} A range wrapper object.
 */
goog.dom.TextRange.createFromNodes = function(anchorNode, anchorOffset,
    focusNode, focusOffset) {
  var range = new goog.dom.TextRange();
  range.isReversed_ = goog.dom.Range.isReversed(anchorNode, anchorOffset,
      focusNode, focusOffset);

  // Avoid selecting BRs directly
  if (anchorNode.tagName == 'BR') {
    var parent = anchorNode.parentNode;
    anchorOffset = goog.array.indexOf(parent.childNodes, anchorNode);
    anchorNode = parent;
  }

  if (focusNode.tagName == 'BR') {
    var parent = focusNode.parentNode;
    focusOffset = goog.array.indexOf(parent.childNodes, focusNode);
    focusNode = parent;
  }

  // Initialize the range as a W3C style range.
  if (range.isReversed_) {
    range.startNode_ = focusNode;
    range.startOffset_ = focusOffset;
    range.endNode_ = anchorNode;
    range.endOffset_ = anchorOffset;
  } else {
    range.startNode_ = anchorNode;
    range.startOffset_ = anchorOffset;
    range.endNode_ = focusNode;
    range.endOffset_ = focusOffset;
  }

  return range;
};


// Representation 1: a browser range wrapper.


/**
 * The browser specific range wrapper.  This can be null if one of the other
 * representations of the range is specified.
 * @type {goog.dom.browserrange.AbstractRange?}
 * @private
 */
goog.dom.TextRange.prototype.browserRangeWrapper_ = _NULL;


// Representation 2: two endpoints specified as nodes + offsets


/**
 * The start node of the range.  This can be null if one of the other
 * representations of the range is specified.
 * @type {Node}
 * @private
 */
goog.dom.TextRange.prototype.startNode_ = _NULL;


/**
 * The start offset of the range.  This can be null if one of the other
 * representations of the range is specified.
 * @type {?number}
 * @private
 */
goog.dom.TextRange.prototype.startOffset_ = _NULL;


/**
 * The end node of the range.  This can be null if one of the other
 * representations of the range is specified.
 * @type {Node}
 * @private
 */
goog.dom.TextRange.prototype.endNode_ = _NULL;


/**
 * The end offset of the range.  This can be null if one of the other
 * representations of the range is specified.
 * @type {?number}
 * @private
 */
goog.dom.TextRange.prototype.endOffset_ = _NULL;


/**
 * Whether the focus node is before the anchor node.
 * @type {boolean}
 * @private
 */
goog.dom.TextRange.prototype.isReversed_ = _FALSE;


// Method implementations


/**
 * @return {goog.dom.TextRange} A clone of this range.
 */
goog.dom.TextRange.prototype.clone = function() {
  var range = new goog.dom.TextRange();
  range.browserRangeWrapper_ = this.browserRangeWrapper_;
  range.startNode_ = this.startNode_;
  range.startOffset_ = this.startOffset_;
  range.endNode_ = this.endNode_;
  range.endOffset_ = this.endOffset_;
  range.isReversed_ = this.isReversed_;

  return range;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getType = function() {
  return goog.dom.RangeType.TEXT;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getBrowserRangeObject = function() {
  return this.getBrowserRangeWrapper_().getBrowserRange();
};


/** @inheritDoc */
goog.dom.TextRange.prototype.setBrowserRangeObject = function(nativeRange) {
  // Test if it's a control range by seeing if a control range only method
  // exists.
  if (goog.dom.AbstractRange.isNativeControlRange(nativeRange)) {
    return _FALSE;
  }
  this.browserRangeWrapper_ = goog.dom.browserrange.createRange(
      nativeRange);
  this.clearCachedValues_();
  return _TRUE;
};


/**
 * Clear all cached values.
 * @private
 */
goog.dom.TextRange.prototype.clearCachedValues_ = function() {
  this.startNode_ = this.startOffset_ = this.endNode_ = this.endOffset_ = _NULL;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getTextRangeCount = function() {
  return 1;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getTextRange = function(i) {
  return this;
};


/**
 * @return {goog.dom.browserrange.AbstractRange} The range wrapper object.
 * @private
 */
goog.dom.TextRange.prototype.getBrowserRangeWrapper_ = function() {
  return this.browserRangeWrapper_ ||
      (this.browserRangeWrapper_ = goog.dom.browserrange.createRangeFromNodes(
          this.getStartNode(), this.getStartOffset(),
          this.getEndNode(), this.getEndOffset()));
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getContainer = function() {
  return this.getBrowserRangeWrapper_().getContainer();
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getStartNode = function() {
  return this.startNode_ ||
      (this.startNode_ = this.getBrowserRangeWrapper_().getStartNode());
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getStartOffset = function() {
  return this.startOffset_ != _NULL ? this.startOffset_ :
      (this.startOffset_ = this.getBrowserRangeWrapper_().getStartOffset());
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getEndNode = function() {
  return this.endNode_ ||
      (this.endNode_ = this.getBrowserRangeWrapper_().getEndNode());
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getEndOffset = function() {
  return this.endOffset_ != _NULL ? this.endOffset_ :
      (this.endOffset_ = this.getBrowserRangeWrapper_().getEndOffset());
};


/**
 * Moves a TextRange to the provided nodes and offsets.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.
 * @param {boolean} isReversed Whether the range is reversed.
 */
goog.dom.TextRange.prototype.moveToNodes = function(startNode, startOffset,
                                                    endNode, endOffset,
                                                    isReversed) {
  this.startNode_ = startNode;
  this.startOffset_ = startOffset;
  this.endNode_ = endNode;
  this.endOffset_ = endOffset;
  this.isReversed_ = isReversed;
  this.browserRangeWrapper_ = _NULL;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.isReversed = function() {
  return this.isReversed_;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.containsRange = function(otherRange,
                                                      opt_allowPartial) {
  var otherRangeType = otherRange.getType();
  if (otherRangeType == goog.dom.RangeType.TEXT) {
    return this.getBrowserRangeWrapper_().containsRange(
        otherRange.getBrowserRangeWrapper_(), opt_allowPartial);
  } else if (otherRangeType == goog.dom.RangeType.CONTROL) {
    var elements = otherRange.getElements();
    var fn = opt_allowPartial ? goog.array.some : goog.array.every;
    return fn(elements, function(el) {
      return this.containsNode(el, opt_allowPartial);
    }, this);
  }
  return _FALSE;
};


/**
 * Tests if the given node is in a document.
 * @param {Node} node The node to check.
 * @return {boolean} Whether the given node is in the given document.
 */
goog.dom.TextRange.isAttachedNode = function(node) {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) {
    var returnValue = _FALSE;
    /** @preserveTry */
    try {
      returnValue = node.parentNode;
    } catch (e) {
      // IE sometimes throws Invalid Argument errors when a node is detached.
      // Note: trying to return a value from the above try block can cause IE
      // to crash.  It is necessary to use the local returnValue
    }
    return !!returnValue;
  } else {
    return goog.dom.contains(node.ownerDocument.body, node);
  }
};


/** @inheritDoc */
goog.dom.TextRange.prototype.isRangeInDocument = function() {
  // Ensure any cached nodes are in the document.  IE also allows ranges to
  // become detached, so we check if the range is still in the document as
  // well for IE.
  return (!this.startNode_ ||
          goog.dom.TextRange.isAttachedNode(this.startNode_)) &&
         (!this.endNode_ ||
          goog.dom.TextRange.isAttachedNode(this.endNode_)) &&
         (!(goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) ||
          this.getBrowserRangeWrapper_().isRangeInDocument());
};


/** @inheritDoc */
goog.dom.TextRange.prototype.isCollapsed = function() {
  return this.getBrowserRangeWrapper_().isCollapsed();
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getText = function() {
  return this.getBrowserRangeWrapper_().getText();
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getHtmlFragment = function() {
  // TODO(robbyw): Generalize the code in browserrange so it is static and
  // just takes an iterator.  This would mean we don't always have to create a
  // browser range.
  return this.getBrowserRangeWrapper_().getHtmlFragment();
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getValidHtml = function() {
  return this.getBrowserRangeWrapper_().getValidHtml();
};


/** @inheritDoc */
goog.dom.TextRange.prototype.getPastableHtml = function() {
  // TODO(robbyw): Get any attributes the table or tr has.

  var html = this.getValidHtml();

  if (html.match(/^\s*<td\b/i)) {
    // Match html starting with a TD.
    html = '<table><tbody><tr>' + html + '</tr></tbody></table>';
  } else if (html.match(/^\s*<tr\b/i)) {
    // Match html starting with a TR.
    html = '<table><tbody>' + html + '</tbody></table>';
  } else if (html.match(/^\s*<tbody\b/i)) {
    // Match html starting with a TBODY.
    html = '<table>' + html + '</table>';
  } else if (html.match(/^\s*<li\b/i)) {
    // Match html starting with an LI.
    var container = this.getContainer();
    var tagType = goog.dom.TagName.UL;
    while (container) {
      if (container.tagName == goog.dom.TagName.OL) {
        tagType = goog.dom.TagName.OL;
        break;
      } else if (container.tagName == goog.dom.TagName.UL) {
        break;
      }
      container = container.parentNode;
    }
    html = goog.string.buildString('<', tagType, '>', html, '</', tagType, '>');
  }

  return html;
};


/**
 * Returns a TextRangeIterator over the contents of the range.  Regardless of
 * the direction of the range, the iterator will move in document order.
 * @param {boolean=} opt_keys Unused for this iterator.
 * @return {goog.dom.TextRangeIterator} An iterator over tags in the range.
 */
goog.dom.TextRange.prototype.__iterator__ = function(opt_keys) {
  return new goog.dom.TextRangeIterator(this.getStartNode(),
      this.getStartOffset(), this.getEndNode(), this.getEndOffset());
};


// RANGE ACTIONS


/** @inheritDoc */
goog.dom.TextRange.prototype.select = function() {
  this.getBrowserRangeWrapper_().select(this.isReversed_);
};


/** @inheritDoc */
goog.dom.TextRange.prototype.removeContents = function() {
  this.getBrowserRangeWrapper_().removeContents();
  this.clearCachedValues_();
};


/**
 * Surrounds the text range with the specified element (on Mozilla) or with a
 * clone of the specified element (on IE).  Returns a reference to the
 * surrounding element if the operation was successful; returns null if the
 * operation failed.
 * @param {Element} element The element with which the selection is to be
 *    surrounded.
 * @return {Element} The surrounding element (same as the argument on Mozilla,
 *    but not on IE), or null if unsuccessful.
 */
goog.dom.TextRange.prototype.surroundContents = function(element) {
  var output = this.getBrowserRangeWrapper_().surroundContents(element);
  this.clearCachedValues_();
  return output;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.insertNode = function(node, before) {
  var output = this.getBrowserRangeWrapper_().insertNode(node, before);
  this.clearCachedValues_();
  return output;
};


/** @inheritDoc */
goog.dom.TextRange.prototype.surroundWithNodes = function(startNode, endNode) {
  this.getBrowserRangeWrapper_().surroundWithNodes(startNode, endNode);
  this.clearCachedValues_();
};


// SAVE/RESTORE


/** @inheritDoc */
goog.dom.TextRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedTextRange_(this);
};


// RANGE MODIFICATION


/** @inheritDoc */
goog.dom.TextRange.prototype.collapse = function(toAnchor) {
  var toStart = this.isReversed() ? !toAnchor : toAnchor;

  if (this.browserRangeWrapper_) {
    this.browserRangeWrapper_.collapse(toStart);
  }

  if (toStart) {
    this.endNode_ = this.startNode_;
    this.endOffset_ = this.startOffset_;
  } else {
    this.startNode_ = this.endNode_;
    this.startOffset_ = this.endOffset_;
  }

  // Collapsed ranges can't be reversed
  this.isReversed_ = _FALSE;
};


// SAVED RANGE OBJECTS



/**
 * A SavedRange implementation using DOM endpoints.
 * @param {goog.dom.AbstractRange} range The range to save.
 * @constructor
 * @extends {goog.dom.SavedRange}
 * @private
 */
goog.dom.DomSavedTextRange_ = function(range) {
  /**
   * The anchor node.
   * @type {Node}
   * @private
   */
  this.anchorNode_ = range.getAnchorNode();

  /**
   * The anchor node offset.
   * @type {number}
   * @private
   */
  this.anchorOffset_ = range.getAnchorOffset();

  /**
   * The focus node.
   * @type {Node}
   * @private
   */
  this.focusNode_ = range.getFocusNode();

  /**
   * The focus node offset.
   * @type {number}
   * @private
   */
  this.focusOffset_ = range.getFocusOffset();
};
goog.inherits(goog.dom.DomSavedTextRange_, goog.dom.SavedRange);


/**
 * @return {goog.dom.AbstractRange} The restored range.
 */
goog.dom.DomSavedTextRange_.prototype.restoreInternal = function() {
  return goog.dom.Range.createFromNodes(this.anchorNode_, this.anchorOffset_,
      this.focusNode_, this.focusOffset_);
};


/** @inheritDoc */
goog.dom.DomSavedTextRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedTextRange_.superClass_.disposeInternal.call(this);

  this.anchorNode_ = _NULL;
  this.focusNode_ = _NULL;
};
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with W3C multi-part ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.MultiRange');
goog.provide('goog.dom.MultiRangeIterator');

////goog.require('goog.array');
//goog.require('goog.dom.AbstractMultiRange');
//goog.require('goog.dom.AbstractRange');
//goog.require('goog.dom.RangeIterator');
//goog.require('goog.dom.RangeType');
//goog.require('goog.dom.SavedRange');
//goog.require('goog.dom.TextRange');
//goog.require('goog.iter.StopIteration');



/**
 * Creates a new multi part range with no properties.  Do not use this
 * constructor: use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractMultiRange}
 */
goog.dom.MultiRange = function() {
  /**
   * Array of browser sub-ranges comprising this multi-range.
   * @type {Array.<Range>}
   * @private
   */
  this.browserRanges_ = [];

  /**
   * Lazily initialized array of range objects comprising this multi-range.
   * @type {Array.<goog.dom.TextRange>}
   * @private
   */
  this.ranges_ = [];

  /**
   * Lazily computed sorted version of ranges_, sorted by start point.
   * @type {Array.<goog.dom.TextRange>?}
   * @private
   */
  this.sortedRanges_ = _NULL;

  /**
   * Lazily computed container node.
   * @type {Node}
   * @private
   */
  this.container_ = _NULL;
};
goog.inherits(goog.dom.MultiRange, goog.dom.AbstractMultiRange);


/**
 * Creates a new range wrapper from the given browser selection object.  Do not
 * use this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Selection} selection The browser selection object.
 * @return {goog.dom.MultiRange} A range wrapper object.
 */
goog.dom.MultiRange.createFromBrowserSelection = function(selection) {
  var range = new goog.dom.MultiRange();
  for (var i = 0, len = selection.rangeCount; i < len; i++) {
    range.browserRanges_.push(selection.getRangeAt(i));
  }
  return range;
};


/**
 * Creates a new range wrapper from the given browser ranges.  Do not
 * use this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Array.<Range>} browserRanges The browser ranges.
 * @return {goog.dom.MultiRange} A range wrapper object.
 */
goog.dom.MultiRange.createFromBrowserRanges = function(browserRanges) {
  var range = new goog.dom.MultiRange();
  range.browserRanges_ = goog.array.clone(browserRanges);
  return range;
};


/**
 * Creates a new range wrapper from the given goog.dom.TextRange objects.  Do
 * not use this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Array.<goog.dom.TextRange>} textRanges The text range objects.
 * @return {goog.dom.MultiRange} A range wrapper object.
 */
goog.dom.MultiRange.createFromTextRanges = function(textRanges) {
  var range = new goog.dom.MultiRange();
  range.ranges_ = textRanges;
  range.browserRanges_ = textRanges.map(function(range) {	// modified
    return range.getBrowserRangeObject();
  });
  return range;
};

// Method implementations


/**
 * Clears cached values.  Should be called whenever this.browserRanges_ is
 * modified.
 * @private
 */
goog.dom.MultiRange.prototype.clearCachedValues_ = function() {
  this.ranges_ = [];
  this.sortedRanges_ = _NULL;
  this.container_ = _NULL;
};


/**
 * @return {goog.dom.MultiRange} A clone of this range.
 */
goog.dom.MultiRange.prototype.clone = function() {
  return goog.dom.MultiRange.createFromBrowserRanges(this.browserRanges_);
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getType = function() {
  return goog.dom.RangeType.MULTI;
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getBrowserRangeObject = function() {
  // NOTE(robbyw): This method does not make sense for multi-ranges.
  return this.browserRanges_[0];
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.setBrowserRangeObject = function(nativeRange) {
  // TODO(robbyw): Look in to adding setBrowserSelectionObject.
  return _FALSE;
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getTextRangeCount = function() {
  return this.browserRanges_.length;
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getTextRange = function(i) {
  if (!this.ranges_[i]) {
    this.ranges_[i] = goog.dom.TextRange.createFromBrowserRange(
        this.browserRanges_[i]);
  }
  return this.ranges_[i];
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getContainer = function() {
  if (!this.container_) {
    var nodes = [];
    for (var i = 0, len = this.getTextRangeCount(); i < len; i++) {
      nodes.push(this.getTextRange(i).getContainer());
    }
    this.container_ = goog.dom.findCommonAncestor.apply(_NULL, nodes);
  }
  return this.container_;
};


/**
 * @return {Array.<goog.dom.TextRange>} An array of sub-ranges, sorted by start
 *     point.
 */
goog.dom.MultiRange.prototype.getSortedRanges = function() {
  if (!this.sortedRanges_) {
    this.sortedRanges_ = this.getTextRanges();
    this.sortedRanges_.sort(function(a, b) {
      var aStartNode = a.getStartNode();
      var aStartOffset = a.getStartOffset();
      var bStartNode = b.getStartNode();
      var bStartOffset = b.getStartOffset();

      if (aStartNode == bStartNode && aStartOffset == bStartOffset) {
        return 0;
      }

      return goog.dom.Range.isReversed(aStartNode, aStartOffset, bStartNode,
          bStartOffset) ? 1 : -1;
    });
  }
  return this.sortedRanges_;
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getStartNode = function() {
  return this.getSortedRanges()[0].getStartNode();
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getStartOffset = function() {
  return this.getSortedRanges()[0].getStartOffset();
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getEndNode = function() {
  // NOTE(robbyw): This may return the wrong node if any subranges overlap.
  return this.getSortedRanges().last().getEndNode();	// modified
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getEndOffset = function() {
  // NOTE(robbyw): This may return the wrong value if any subranges overlap.
  return this.getSortedRanges().last().getEndOffset();	// modified
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.isRangeInDocument = function() {
  return this.getTextRanges().every(function(range) {	// modified
    return range.isRangeInDocument();
  });
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.isCollapsed = function() {
  return this.browserRanges_.length == 0 ||
      this.browserRanges_.length == 1 && this.getTextRange(0).isCollapsed();
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getText = function() {
  return this.getTextRanges().map(function(range) {	// modified
    return range.getText();
  }).join('');
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getHtmlFragment = function() {
  return this.getValidHtml();
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getValidHtml = function() {
  // NOTE(robbyw): This does not behave well if the sub-ranges overlap.
  return this.getTextRanges().map(function(range) {	// modified
    return range.getValidHtml();
  }).join('');
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.getPastableHtml = function() {
  // TODO(robbyw): This should probably do something smart like group TR and TD
  // selections in to the same table.
  return this.getValidHtml();
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.__iterator__ = function(opt_keys) {
  return new goog.dom.MultiRangeIterator(this);
};


// RANGE ACTIONS


/** @inheritDoc */
goog.dom.MultiRange.prototype.select = function() {
  var selection = goog.dom.AbstractRange.getBrowserSelectionForWindow(
      this.getWindow());
  selection.removeAllRanges();
  for (var i = 0, len = this.getTextRangeCount(); i < len; i++) {
    selection.addRange(this.getTextRange(i).getBrowserRangeObject());
  }
};


/** @inheritDoc */
goog.dom.MultiRange.prototype.removeContents = function() {
  this.getTextRanges().each(function(range) {	// modified
    range.removeContents();
  });
};


// SAVE/RESTORE


/** @inheritDoc */
goog.dom.MultiRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedMultiRange_(this);
};


// RANGE MODIFICATION


/**
 * Collapses this range to a single point, either the first or last point
 * depending on the parameter.  This will result in the number of ranges in this
 * multi range becoming 1.
 * @param {boolean} toAnchor Whether to collapse to the anchor.
 */
goog.dom.MultiRange.prototype.collapse = function(toAnchor) {
  if (!this.isCollapsed()) {
    var range = toAnchor ? this.getTextRange(0) : this.getTextRange(
        this.getTextRangeCount() - 1);

    this.clearCachedValues_();
    range.collapse(toAnchor);
    this.ranges_ = [range];
    this.sortedRanges_ = [range];
    this.browserRanges_ = [range.getBrowserRangeObject()];
  }
};


// SAVED RANGE OBJECTS



/**
 * A SavedRange implementation using DOM endpoints.
 * @param {goog.dom.MultiRange} range The range to save.
 * @constructor
 * @extends {goog.dom.SavedRange}
 * @private
 */
goog.dom.DomSavedMultiRange_ = function(range) {
  /**
   * Array of saved ranges.
   * @type {Array.<goog.dom.SavedRange>}
   * @private
   */
  this.savedRanges_ = range.getTextRanges().map(function(range) {	// modified
    return range.saveUsingDom();
  });
};
goog.inherits(goog.dom.DomSavedMultiRange_, goog.dom.SavedRange);


/**
 * @return {goog.dom.MultiRange} The restored range.
 */
goog.dom.DomSavedMultiRange_.prototype.restoreInternal = function() {
  var ranges = this.savedRanges_.map(function(savedRange) {	// modified
    return savedRange.restore();
  });
  return goog.dom.MultiRange.createFromTextRanges(ranges);
};


/** @inheritDoc */
goog.dom.DomSavedMultiRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedMultiRange_.superClass_.disposeInternal.call(this);

  this.savedRanges_.map(function(savedRange) {	// modified
    savedRange.dispose();
  });
  delete this.savedRanges_;
};


// RANGE ITERATION



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 *
 * @param {goog.dom.MultiRange} range The range to traverse.
 * @constructor
 * @extends {goog.dom.RangeIterator}
 */
goog.dom.MultiRangeIterator = function(range) {
  if (range) {
    this.iterators_ = range.getSortedRanges().map(
        function(r) {
          return goog.iter.toIterator(r);
        });
  }

  goog.dom.RangeIterator.call(
      this, range ? this.getStartNode() : _NULL, _FALSE);
};
goog.inherits(goog.dom.MultiRangeIterator, goog.dom.RangeIterator);


/**
 * The list of range iterators left to traverse.
 * @type {Array.<goog.dom.RangeIterator>?}
 * @private
 */
goog.dom.MultiRangeIterator.prototype.iterators_ = _NULL;


/**
 * The index of the current sub-iterator being traversed.
 * @type {number}
 * @private
 */
goog.dom.MultiRangeIterator.prototype.currentIdx_ = 0;


/** @inheritDoc */
goog.dom.MultiRangeIterator.prototype.getStartTextOffset = function() {
  return this.iterators_[this.currentIdx_].getStartTextOffset();
};


/** @inheritDoc */
goog.dom.MultiRangeIterator.prototype.getEndTextOffset = function() {
  return this.iterators_[this.currentIdx_].getEndTextOffset();
};


/** @inheritDoc */
goog.dom.MultiRangeIterator.prototype.getStartNode = function() {
  return this.iterators_[0].getStartNode();
};


/** @inheritDoc */
goog.dom.MultiRangeIterator.prototype.getEndNode = function() {
  return this.iterators_.last().getEndNode();
};


/** @inheritDoc */
goog.dom.MultiRangeIterator.prototype.isLast = function() {
  return this.iterators_[this.currentIdx_].isLast();
};


/** @inheritDoc */
goog.dom.MultiRangeIterator.prototype.next = function() {
  /** @preserveTry */
  try {
    var it = this.iterators_[this.currentIdx_];
    var next = it.next();
    this.setPosition(it.node, it.tagType, it.depth);
    return next;
  } catch (ex) {
    if (ex !== goog.iter.StopIteration ||
        this.iterators_.length - 1 == this.currentIdx_) {
      throw ex;
    } else {
      // In case we got a StopIteration, increment counter and try again.
      this.currentIdx_++;
      return this.next();
    }
  }
};


/**
 * Replaces this iterator's values with values from another.
 * @param {goog.dom.MultiRangeIterator} other The iterator to copy.
 * @protected
 */
goog.dom.MultiRangeIterator.prototype.copyFrom = function(other) {
  this.iterators_ = goog.array.clone(other.iterators_);
  goog.dom.MultiRangeIterator.superClass_.copyFrom.call(this, other);
};


/**
 * @return {goog.dom.MultiRangeIterator} An identical iterator.
 */
goog.dom.MultiRangeIterator.prototype.clone = function() {
  var copy = new goog.dom.MultiRangeIterator(_NULL);
  copy.copyFrom(this);
  return copy;
};
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with IE control ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author jparent@google.com (Julie Parent)
 */


goog.provide('goog.dom.ControlRange');
goog.provide('goog.dom.ControlRangeIterator');

//goog.require('goog.dom');
//goog.require('goog.dom.AbstractMultiRange');
//goog.require('goog.dom.AbstractRange');
//goog.require('goog.dom.RangeIterator');
//goog.require('goog.dom.RangeType');
//goog.require('goog.dom.SavedRange');
//goog.require('goog.dom.TagWalkType');
//goog.require('goog.dom.TextRange');
//goog.require('goog.iter.StopIteration');
//goog.require('goog.userAgent');



/**
 * Create a new control selection with no properties.  Do not use this
 * constructor: use one of the goog.dom.Range.createFrom* methods instead.
 * @constructor
 * @extends {goog.dom.AbstractMultiRange}
 */
goog.dom.ControlRange = function() {
};
goog.inherits(goog.dom.ControlRange, goog.dom.AbstractMultiRange);


/**
 * Create a new range wrapper from the given browser range object.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {Object} controlRange The browser range object.
 * @return {goog.dom.ControlRange} A range wrapper object.
 */
goog.dom.ControlRange.createFromBrowserRange = function(controlRange) {
  var range = new goog.dom.ControlRange();
  range.range_ = controlRange;
  return range;
};


/**
 * Create a new range wrapper that selects the given element.  Do not use
 * this method directly - please use goog.dom.Range.createFrom* instead.
 * @param {...Element} var_args The element(s) to select.
 * @return {goog.dom.ControlRange} A range wrapper object.
 */
goog.dom.ControlRange.createFromElements = function(var_args) {
  var range = goog.dom.getOwnerDocument(arguments[0]).body.createControlRange();
  for (var i = 0, len = arguments.length; i < len; i++) {
    range.addElement(arguments[i]);
  }
  return goog.dom.ControlRange.createFromBrowserRange(range);
};


/**
 * The IE control range obejct.
 * @type {Object}
 * @private
 */
goog.dom.ControlRange.prototype.range_ = _NULL;


/**
 * Cached list of elements.
 * @type {Array.<Element>?}
 * @private
 */
goog.dom.ControlRange.prototype.elements_ = _NULL;


/**
 * Cached sorted list of elements.
 * @type {Array.<Element>?}
 * @private
 */
goog.dom.ControlRange.prototype.sortedElements_ = _NULL;


// Method implementations


/**
 * Clear cached values.
 * @private
 */
goog.dom.ControlRange.prototype.clearCachedValues_ = function() {
  this.elements_ = _NULL;
  this.sortedElements_ = _NULL;
};


/**
 * @return {goog.dom.ControlRange} A clone of this range.
 */
goog.dom.ControlRange.prototype.clone = function() {
  return goog.dom.ControlRange.createFromElements.apply(this,
                                                        this.getElements());
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getType = function() {
  return goog.dom.RangeType.CONTROL;
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getBrowserRangeObject = function() {
  return this.range_ || _DOC.body.createControlRange();
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.setBrowserRangeObject = function(nativeRange) {
  if (!goog.dom.AbstractRange.isNativeControlRange(nativeRange)) {
    return _FALSE;
  }
  this.range_ = nativeRange;
  return _TRUE;
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getTextRangeCount = function() {
  return this.range_ ? this.range_.length : 0;
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getTextRange = function(i) {
  return goog.dom.TextRange.createFromNodeContents(this.range_.item(i));
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getContainer = function() {
  return goog.dom.findCommonAncestor.apply(_NULL, this.getElements());
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getStartNode = function() {
  return this.getSortedElements()[0];
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getStartOffset = function() {
  return 0;
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getEndNode = function() {
  var sorted = this.getSortedElements();
  var startsLast = /** @type {Node} */ (sorted.last());	// modified
  return /** @type {Node} */ (sorted.find(function(el) {
    return goog.dom.contains(el, startsLast);
  }));
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getEndOffset = function() {
  return this.getEndNode().childNodes.length;
};


// TODO(robbyw): Figure out how to unify getElements with TextRange API.
/**
 * @return {Array.<Element>} Array of elements in the control range.
 */
goog.dom.ControlRange.prototype.getElements = function() {
  if (!this.elements_) {
    this.elements_ = [];
    if (this.range_) {
      for (var i = 0; i < this.range_.length; i++) {
        this.elements_.push(this.range_.item(i));
      }
    }
  }

  return this.elements_;
};


/**
 * @return {Array.<Element>} Array of elements comprising the control range,
 *     sorted by document order.
 */
goog.dom.ControlRange.prototype.getSortedElements = function() {
  if (!this.sortedElements_) {
    this.sortedElements_ = this.getElements().concat();
    this.sortedElements_.sort(function(a, b) {
      return a.sourceIndex - b.sourceIndex;
    });
  }

  return this.sortedElements_;
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.isRangeInDocument = function() {
  var returnValue = _FALSE;

  try {
    returnValue = this.getElements().every(function(element) {	// modified
      // On IE, this throws an exception when the range is detached.
      return goog.userAgent.IE ?
          element.parentNode :
          goog.dom.contains(element.ownerDocument.body, element);
    });
  } catch (e) {
    // IE sometimes throws Invalid Argument errors for detached elements.
    // Note: trying to return a value from the above try block can cause IE
    // to crash.  It is necessary to use the local returnValue.
  }

  return returnValue;
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.isCollapsed = function() {
  return !this.range_ || !this.range_.length;
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getText = function() {
  // TODO(robbyw): What about for table selections?  Should those have text?
  return '';
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getHtmlFragment = function() {
  return this.getSortedElements().map(goog.dom.getOuterHtml).	// modified
      join('');
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getValidHtml = function() {
  return this.getHtmlFragment();
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.getPastableHtml =
    goog.dom.ControlRange.prototype.getValidHtml;


/** @inheritDoc */
goog.dom.ControlRange.prototype.__iterator__ = function(opt_keys) {
  return new goog.dom.ControlRangeIterator(this);
};


// RANGE ACTIONS


/** @inheritDoc */
goog.dom.ControlRange.prototype.select = function() {
  if (this.range_) {
    this.range_.select();
  }
};


/** @inheritDoc */
goog.dom.ControlRange.prototype.removeContents = function() {
  // TODO(robbyw): Test implementing with execCommand('Delete')
  if (this.range_) {
    var nodes = [];
    for (var i = 0, len = this.range_.length; i < len; i++) {
      nodes.push(this.range_.item(i));
    }
    nodes.each(goog.dom.removeNode);	// modified

    this.collapse(_FALSE);
  }
};


// SAVE/RESTORE


/** @inheritDoc */
goog.dom.ControlRange.prototype.saveUsingDom = function() {
  return new goog.dom.DomSavedControlRange_(this);
};


// RANGE MODIFICATION


/** @inheritDoc */
goog.dom.ControlRange.prototype.collapse = function(toAnchor) {
  // TODO(robbyw): Should this return a text range?  If so, API needs to change.
  this.range_ = _NULL;
  this.clearCachedValues_();
};


// SAVED RANGE OBJECTS



/**
 * A SavedRange implementation using DOM endpoints.
 * @param {goog.dom.ControlRange} range The range to save.
 * @constructor
 * @extends {goog.dom.SavedRange}
 * @private
 */
goog.dom.DomSavedControlRange_ = function(range) {
  /**
   * The element list.
   * @type {Array.<Element>}
   * @private
   */
  this.elements_ = range.getElements();
};
goog.inherits(goog.dom.DomSavedControlRange_, goog.dom.SavedRange);


/**
 * @return {goog.dom.ControlRange} The restored range.
 */
goog.dom.DomSavedControlRange_.prototype.restoreInternal = function() {
  var doc = this.elements_.length ?
      goog.dom.getOwnerDocument(this.elements_[0]) : document;
  var controlRange = doc.body.createControlRange();
  for (var i = 0, len = this.elements_.length; i < len; i++) {
    controlRange.addElement(this.elements_[i]);
  }
  return goog.dom.ControlRange.createFromBrowserRange(controlRange);
};


/** @inheritDoc */
goog.dom.DomSavedControlRange_.prototype.disposeInternal = function() {
  goog.dom.DomSavedControlRange_.superClass_.disposeInternal.call(this);
  delete this.elements_;
};


// RANGE ITERATION



/**
 * Subclass of goog.dom.TagIterator that iterates over a DOM range.  It
 * adds functions to determine the portion of each text node that is selected.
 *
 * @param {goog.dom.ControlRange?} range The range to traverse.
 * @constructor
 * @extends {goog.dom.RangeIterator}
 */
goog.dom.ControlRangeIterator = function(range) {
  if (range) {
    this.elements_ = range.getSortedElements();
    this.startNode_ = this.elements_.shift();
    this.endNode_ = /** @type {Node} */ (this.elements_.last()) ||	// modified
        this.startNode_;
  }

  goog.dom.RangeIterator.call(this, this.startNode_, _FALSE);
};
goog.inherits(goog.dom.ControlRangeIterator, goog.dom.RangeIterator);


/**
 * The first node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.ControlRangeIterator.prototype.startNode_ = _NULL;


/**
 * The last node in the selection.
 * @type {Node}
 * @private
 */
goog.dom.ControlRangeIterator.prototype.endNode_ = _NULL;


/**
 * The list of elements left to traverse.
 * @type {Array.<Element>?}
 * @private
 */
goog.dom.ControlRangeIterator.prototype.elements_ = _NULL;


/** @inheritDoc */
goog.dom.ControlRangeIterator.prototype.getStartTextOffset = function() {
  return 0;
};


/** @inheritDoc */
goog.dom.ControlRangeIterator.prototype.getEndTextOffset = function() {
  return 0;
};


/** @inheritDoc */
goog.dom.ControlRangeIterator.prototype.getStartNode = function() {
  return this.startNode_;
};


/** @inheritDoc */
goog.dom.ControlRangeIterator.prototype.getEndNode = function() {
  return this.endNode_;
};


/** @inheritDoc */
goog.dom.ControlRangeIterator.prototype.isLast = function() {
  return !this.depth && !this.elements_.length;
};


/**
 * Move to the next position in the selection.
 * Throws {@code goog.iter.StopIteration} when it passes the end of the range.
 * @return {Node} The node at the next position.
 */
goog.dom.ControlRangeIterator.prototype.next = function() {
  // Iterate over each element in the range, and all of its children.
  if (this.isLast()) {
    throw goog.iter.StopIteration;
  } else if (!this.depth) {
    var el = this.elements_.shift();
    this.setPosition(el,
                     goog.dom.TagWalkType.START_TAG,
                     goog.dom.TagWalkType.START_TAG);
    return el;
  }

  // Call the super function.
  return goog.dom.ControlRangeIterator.superClass_.next.call(this);
};


/**
 * Replace this iterator's values with values from another.
 * @param {goog.dom.ControlRangeIterator} other The iterator to copy.
 * @protected
 */
goog.dom.ControlRangeIterator.prototype.copyFrom = function(other) {
  this.elements_ = other.elements_;
  this.startNode_ = other.startNode_;
  this.endNode_ = other.endNode_;

  goog.dom.ControlRangeIterator.superClass_.copyFrom.call(this, other);
};


/**
 * @return {goog.dom.ControlRangeIterator} An identical iterator.
 */
goog.dom.ControlRangeIterator.prototype.clone = function() {
  var copy = new goog.dom.ControlRangeIterator(_NULL);
  copy.copyFrom(this);
  return copy;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for working with ranges in HTML documents.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ojan@google.com (Ojan Vafai)
 * @author jparent@google.com (Julie Parent)
 */

goog.provide('goog.dom.Range');

//goog.require('goog.dom');
//goog.require('goog.dom.AbstractRange');
//goog.require('goog.dom.ControlRange');
//goog.require('goog.dom.MultiRange');
//goog.require('goog.dom.NodeType');
//goog.require('goog.dom.TextRange');
//goog.require('goog.userAgent');


/**
 * Create a new selection from the given browser window's current selection.
 * Note that this object does not auto-update if the user changes their
 * selection and should be used as a snapshot.
 * @param {Window=} opt_win The window to get the selection of.  Defaults to the
 *     window this class was defined in.
 * @return {goog.dom.AbstractRange?} A range wrapper object, or null if there
 *     was an error.
 */
goog.dom.Range.createFromWindow = function(opt_win) {
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(
      opt_win || window);
  return sel && goog.dom.Range.createFromBrowserSelection(sel);
};


/**
 * Create a new range wrapper from the given browser selection object.  Note
 * that this object does not auto-update if the user changes their selection and
 * should be used as a snapshot.
 * @param {!Object} selection The browser selection object.
 * @return {goog.dom.AbstractRange?} A range wrapper object or null if there
 *    was an error.
 */
goog.dom.Range.createFromBrowserSelection = function(selection) {
  var range;
  var isReversed = _FALSE;
  if (selection.createRange) {
    /** @preserveTry */
    try {
      range = selection.createRange();
    } catch (e) {
      // Access denied errors can be thrown here in IE if the selection was
      // a flash obj or if there are cross domain issues
      return _NULL;
    }
  } else if (selection.rangeCount) {
    if (selection.rangeCount > 1) {
      return goog.dom.MultiRange.createFromBrowserSelection(
          /** @type {Selection} */ (selection));
    } else {
      range = selection.getRangeAt(0);
      isReversed = goog.dom.Range.isReversed(selection.anchorNode,
          selection.anchorOffset, selection.focusNode, selection.focusOffset);
    }
  } else {
    return _NULL;
  }

  return goog.dom.Range.createFromBrowserRange(range, isReversed);
};


/**
 * Create a new range wrapper from the given browser range object.
 * @param {Range|TextRange} range The browser range object.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createFromBrowserRange = function(range, opt_isReversed) {
  // Create an IE control range when appropriate.
  return goog.dom.AbstractRange.isNativeControlRange(range) ?
      goog.dom.ControlRange.createFromBrowserRange(range) :
      goog.dom.TextRange.createFromBrowserRange(range, opt_isReversed);
};


/**
 * Create a new range wrapper that selects the given node's text.
 * @param {Node} node The node to select.
 * @param {boolean=} opt_isReversed Whether the focus node is before the anchor
 *     node.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createFromNodeContents = function(node, opt_isReversed) {
  return goog.dom.TextRange.createFromNodeContents(node, opt_isReversed);
};


/**
 * Create a new range wrapper that represents a caret at the given node,
 * accounting for the given offset.  This always creates a TextRange, regardless
 * of whether node is an image node or other control range type node.
 * @param {Node} node The node to place a caret at.
 * @param {number} offset The offset within the node to place the caret at.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createCaret = function(node, offset) {
  return goog.dom.TextRange.createFromNodes(node, offset, node, offset);
};


/**
 * Create a new range wrapper that selects the area between the given nodes,
 * accounting for the given offsets.
 * @param {Node} startNode The node to start with.
 * @param {number} startOffset The offset within the node to start.
 * @param {Node} endNode The node to end with.
 * @param {number} endOffset The offset within the node to end.
 * @return {goog.dom.AbstractRange} A range wrapper object.
 */
goog.dom.Range.createFromNodes = function(startNode, startOffset, endNode,
    endOffset) {
  return goog.dom.TextRange.createFromNodes(startNode, startOffset, endNode,
      endOffset);
};


/**
 * Clears the window's selection.
 * @param {Window=} opt_win The window to get the selection of.  Defaults to the
 *     window this class was defined in.
 */
goog.dom.Range.clearSelection = function(opt_win) {
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(
      opt_win || window);
  if (!sel) {
    return;
  }
  if (sel.empty) {
    // We can't just check that the selection is empty, becuase IE
    // sometimes gets confused.
    try {
      sel.empty();
    } catch (e) {
      // Emptying an already empty selection throws an exception in IE
    }
  } else {
    sel.removeAllRanges();
  }
};


/**
 * Returns whether the focus position occurs before the anchor position.
 * @param {Node} anchorNode The node to start with.
 * @param {number} anchorOffset The offset within the node to start.
 * @param {Node} focusNode The node to end with.
 * @param {number} focusOffset The offset within the node to end.
 * @return {boolean} Whether the focus position occurs before the anchor
 *     position.
 */
goog.dom.Range.isReversed = function(anchorNode, anchorOffset, focusNode,
    focusOffset) {
  if (anchorNode == focusNode) {
    return focusOffset < anchorOffset;
  }
  var child;
  if (anchorNode.nodeType == goog.dom.NodeType.ELEMENT && anchorOffset) {
    child = anchorNode.childNodes[anchorOffset];
    if (child) {
      anchorNode = child;
      anchorOffset = 0;
    } else if (goog.dom.contains(anchorNode, focusNode)) {
      // If focus node is contained in anchorNode, it must be before the
      // end of the node.  Hence we are reversed.
      return _TRUE;
    }
  }
  if (focusNode.nodeType == goog.dom.NodeType.ELEMENT && focusOffset) {
    child = focusNode.childNodes[focusOffset];
    if (child) {
      focusNode = child;
      focusOffset = 0;
    } else if (goog.dom.contains(focusNode, anchorNode)) {
      // If anchor node is contained in focusNode, it must be before the
      // end of the node.  Hence we are not reversed.
      return _FALSE;
    }
  }
  return (goog.dom.compareNodeOrder(anchorNode, focusNode) ||
      anchorOffset - focusOffset) > 0;
};
goog.provide("export_dep");

//goog.require('goog.dom.ControlRange');
//goog.require('goog.dom.MultiRange');
//goog.require('goog.dom.Range');