(function (root, factory) {
    var resolved = [],
        required = ["require","exports","module","angular"],
        i, len = required.length;

    if (typeof define === "function" && define.amd) {
        define("ngresourceurltypefactory",["require","exports","module","angular"], factory);
    } else if (typeof exports === "object") {
        for (i = 0; i < len; i += 1) {
            resolved.push(require(required[i]));
        }

        module.exports = factory.apply({}, resolved);
    } else {
        for (i = 0; i < len; i += 1) {
            resolved.push(root[required[i]]);
        }

        root["ngresourceurltypefactory"] = factory.apply({}, resolved);
    }
}(this, function (require,exports,module,angular) {
    
    /**
 * Angular ResourceUrlTypeFactory
 * Copyright 2016 Andreas Stocker
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


(function () {
    'use strict';

    var
        app = angular.module('ngResourceUrlTypeFactory', [
            'ui.router'
        ]);

})();

/**
 * Angular ResourceUrlTypeFactoryService
 * Copyright 2016 Andreas Stocker
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


(function () {
    'use strict';

    var
        module = angular.module('ngResourceUrlTypeFactory');

    /**
     * Provider for the ResourceUrlTypeFactoryService
     *
     * @name ResourceUrlTypeFactoryServiceProvider
     * @ngdoc provider
     */
    module.provider('ResourceUrlTypeFactoryService',
        ['$urlMatcherFactoryProvider', function ($urlMatcherFactoryProvider) {
            'ngInject';

            var
                provider = this,

                /**
                 * List of REST type names
                 * @type {Array}
                 */
                typeNames = [];

            /**
             * Construct a type definition for a REST ui-router type
             * @memberOf ResourceUrlTypeFactoryServiceProvider
             * @param {String} typeName Name for the type
             * @param {RegExp} pattern Pattern to match for
             * @param {String} pkAttr Name of the PK attribute
             * @param {Function} fetchFn Function to fetch the object from REST API (supports injection)
             */
            provider.registerType = function (typeName, pattern, pkAttr, fetchFn) {
                console.log("ResourceUrlTypeFactory: Register '" + typeName + "' REST type for ui-router.");

                /*
                 * Register the URL pattern type itself. It will convert a REST object to
                 * it's URL representation, and will invoke the given fetch function to
                 * load a REST object from it's URL representation.
                 */
                $urlMatcherFactoryProvider.type(typeName,
                    {
                        pattern: pattern
                    },
                    ['$injector', function ($injector) {
                        'ngInject';

                        return {
                            encode: function (obj) {
                                return String(obj[pkAttr]);
                            },
                            decode: function (pk) {
                                var
                                    promise = $injector.invoke(fetchFn, null, {'$pk': pk});

                                promise[pkAttr] = pk;
                                return promise;
                            },
                            equals: function (objA, objB) {
                                if (objA && objB) {
                                    return String(objA[pkAttr]).toUpperCase() === String(objB[pkAttr]).toUpperCase();
                                }
                                return !objA && !objB;
                            },
                            is: function (obj) {
                                return angular.isObject(obj);
                            }
                        }
                    }]
                );

                typeNames.push(typeName);
            };

            /**
             * Gets the actual service object
             * @name ResourceUrlTypeFactoryService
             * @ngdoc factory
             * @returns {Object}
             */
            provider.$get = ['$q', '$transitions', function ($q, $transitions) {
                'ngInject';

                var
                    self = this,

                    /**
                     * Get a promise of the given object. Returns the object itself if we pass a promise, returns
                     * the `$promise` attribute if we pass a resource instance, and returns a resolved promise for the
                     * passed object on anything else.
                     * @private
                     * @memberOf ResourceUrlTypeFactoryService
                     * @param obj
                     * @return {Promise}
                     */
                    getPromise = function (obj) {
                        if (obj && (typeof obj.then === 'function')) {
                            return obj;
                        }
                        else if (obj && obj.$promise && (typeof obj.$promise.then === 'function')) {
                            return obj.$promise;
                        }
                        else {
                            return $q.resolve(obj);
                        }
                    };

                /**
                 * Returns a list of names for all registered types.
                 * @memberOf ResourceUrlTypeFactoryService
                 * @return {String[]}
                 */
                self.getTypeNames = function () {
                    return angular.copy(typeNames);
                };

                /**
                 * Gets the param names that are resource url type factory types for the
                 * given param definitions.
                 * @memberOf ResourceUrlTypeFactoryService
                 * @param paramDefinitions
                 * @return {String[]}
                 */
                self.getParams = function (paramDefinitions) {
                    var
                        paramNames = [];

                    for (var paramName in paramDefinitions) {
                        if (paramDefinitions.hasOwnProperty(paramName)) {
                            var
                                param = paramDefinitions[paramName],
                                paramType = param.type,
                                paramTypeName = paramType.name;

                            if (typeNames.indexOf(paramTypeName) !== -1) {
                                paramNames.push(paramName);
                            }
                        }
                    }

                    return paramNames;
                };

                /**
                 * Registers a ui-router transition handler for the registered types above. The transition
                 * will wait for the promises to resolve before the routing finishes.
                 * @memberOf ResourceUrlTypeFactoryService
                 */
                self.registerTransition = function () {
                    $transitions.onStart(
                        {
                            to: function (state) {
                                return self.getParams(state.params).length !== 0;
                            }
                        },
                        function transition (trans) {
                            var
                                targetState = trans._targetState,
                                paramDefinitions = targetState._definition.params,
                                paramNames = self.getParams(paramDefinitions),
                                promises = [];

                            for (var i = 0; i < paramNames.length; i++) {
                                var
                                    paramName = paramNames[i],
                                    param = targetState._params[paramName],
                                    promise = getPromise(param);

                                promises.push(promise);
                            }

                            console.log("ResourceUrlTypeFactory: State transition waits for '" + promises.length + "' calls");

                            return $q.all(promises);
                        }
                    );
                };

                return self;
            }];
        }]
    );

    module.run(
        ['ResourceUrlTypeFactoryService', function (ResourceUrlTypeFactoryService) {
            'ngInject';

            console.log("ResourceUrlTypeFactory: Register transition for ui-router resource types");

            ResourceUrlTypeFactoryService.registerTransition();
        }]
    )
})();


    return angular.module("ngResourceUrlTypeFactory");
    
}));