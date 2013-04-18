// Uses the attr function of jQuery rather than data because the selector needs to find/ignore the attribute as it is changed and data doesn't change the
// actual underlying attribute.
; (function ($) {
    var functions = new Object(); // Stores the functions

    // private function to get the args from the element
    function getArgs(functionName, element, event) {
        var argsString = element.attr('data-jBinder-' + functionName + '-args');
        var args;

        if (argsString) {
            args = $.parseJSON(argsString);
        }
        else {
            args = new Object();
        }

        args['element'] = element; // add the element, default argument
        if (event) {
            args['event'] = event; // add the event, default argument
        }

        return args;
    }

    function getFunctionName(fullFunctionName) {
        var functionName;
        if (fullFunctionName.indexOf('.') > 0) {
            functionName = fullFunctionName.split('.')[1];
        }
        else {
            functionName = fullFunctionName;
        }
        return functionName;
    }

    // global function to allow the registration of functions for binding
    $.jBinder = {
        registerFunction: function (functionName, execFunction) {
            functions[functionName] = execFunction;
        }
        ,unRegisterFunction: function (functionName) {
            if (functionName) {
                functions[functionName] = function(){};
            }
            else{
                functions = new Object();
            }
        }
    };

    // the methods allows by jBinder
    var methods = {
        bindFunctions: function () {
            return this.each(function () {
                var bindElement = $(this);
                var immediateFunctions = new Object;
                var immediateFunctionPositions = [];
                var immediateFunctionIndex = 0;
                bindElement.find('[data-jBinder-functions]').add(bindElement.filter('[data-jBinder-functions]')).each(function () {
                    var element = $(this);
                    var immediateFunction = false;
                    var jBinderFunctionsAttr = element.attr('data-jBinder-functions');

                    if (jBinderFunctionsAttr) { // make sure it isn't just undefined - IE
                        var unboundFunctions = '';
                        var boundFunctions = '';
                        var splitFunctions = jBinderFunctionsAttr.split(','); // split the comma sperated list of functions

                        if (element.attr('data-jBinder-boundFunctions')) {
                            boundFunctions = element.attr('data-jBinder-boundFunctions');
                        }

                        for (i = 0; i < splitFunctions.length; i++) {
                            var fullFunctionName = $.trim(splitFunctions[i]);
                            var functionName = getFunctionName(fullFunctionName);

                            // make sure this is a function that has been registered
                            // don't error if not as it could be registered later, just leave it be
                            if (functionName in functions) {
                                if (boundFunctions != '') { boundFunctions += ','; } // ensure comma speration
                                boundFunctions += fullFunctionName; // the function is now bound
                                if (fullFunctionName.indexOf('.') > 0) {
                                    if (fullFunctionName.split('.')[0].match('^\\d*$')) {
                                        immediateFunctionIndex = fullFunctionName.split('.')[0];
                                        immediateFunction = true;
                                    }
                                    else {
                                        immediateFunction = false;
                                    }
                                }
                                else {
                                    immediateFunctionIndex = 1;
                                    immediateFunction = true;
                                }
                                if (!immediateFunction) {
                                    (function (functionToRun, theFunctionName, theFullFunctionName) {
                                        element.off(theFullFunctionName); // just make sure we haven't bound twice
                                        element.on(theFullFunctionName, function (event) {
                                            return functionToRun(getArgs(theFunctionName, element, event));
                                        })
                                    })(functions[functionName], functionName, fullFunctionName);
                                }
                                else {
                                    if (immediateFunctionPositions.indexOf(immediateFunctionIndex) == -1)
                                    {
                                        immediateFunctionPositions.push(immediateFunctionIndex);
                                        immediateFunctions[immediateFunctionIndex] = [];
                                    }
                                    (function (functionToRun, theFunctionName) {
                                        immediateFunctions[immediateFunctionIndex].push(function () {
                                            functionToRun(getArgs(theFunctionName, element, null));
                                        });
                                    })(functions[functionName], functionName);
                                }
                            }
                            else {
                                if (unboundFunctions != '') { unboundFunctions += ','; } // ensure comma speration
                                unboundFunctions += fullFunctionName;
                            }
                        }

                        if (unboundFunctions == '') {
                            element.removeData('jbinder-functions');
                            element.attr('data-jBinder-functions', null);
                        }
                        else {
                            element.attr('data-jBinder-functions', unboundFunctions); // update the jBinder-functions with any unbound functions, they might be picked up by later registrations
                        }

                        element.attr('data-jBinder-boundFunctions', boundFunctions); // write the functions that are now bound

                    }
                });

                immediateFunctionPositions = immediateFunctionPositions.sort();
                for (i = 0; i < immediateFunctionPositions.length; i++) {
                    immediateFunctionIndex = immediateFunctionPositions[i];
                    for (f = 0; f < immediateFunctions[immediateFunctionIndex].length; f++) {
                        immediateFunctions[immediateFunctionIndex][f]();
                    }
                }
            });
        },
        addFunction: function (functionToAdd, functionArgs) {
            return this.each(function () {
                var element = $(this);
                var functionName = getFunctionName(functionToAdd);
                var currentFunctions = element.attr('data-jBinder-functions');
                if (!currentFunctions) { currentFunctions = ''; } // ensure there is a value for functions (get rid of undefined).
                var boundFunctions = currentFunctions.split(',');
                for (i = 0; i < boundFunctions.length; i++) {
                    if (boundFunctions[i] == functionToAdd) {
                        functionToAdd = ''; // Function is already bound so ignore it
                    }
                }
                if (functionToAdd != '') { // make sure there is a function and then bind it.
                    if (currentFunctions != '') { currentFunctions += ','; } // comma seperate
                    currentFunctions += functionToAdd;
                    element.attr('data-jBinder-functions', currentFunctions);
                    if (functionArgs && functionArgs != '') {
                        element.attr('data-jBinder-' + functionName + '-args', functionArgs);
                    }
                }
            });
        },
        removeFunction: function (functionToRemove) {
            if (!functionToRemove) { // no specific function to remove, so remove them all
                return this.each(function () {
                    var element = $(this);

                    var currentFunction;
                    var boundFunctions;
                    if (element.attr('data-jBinder-boundFunctions')) {
                        boundFunctions = element.attr('data-jBinder-boundFunctions').split(',');
                    }
                    else {
                        boundFunctions = ''.split(',');
                    }
                    for (i = 0; i < boundFunctions.length; i++) {
                        currentFunction = boundFunctions[i];
                        // If it was an event then make sure that we remove the event
                        if (currentFunction.indexOf('.') > 0) {
                            element.off(currentFunction);
                        }
                    }
                    element.attr('data-jBinder-boundFunctions', ''); // clear the bound functions
                });
            }
            else {
                return this.each(function () {
                    var element = $(this);
                    var bindings = element.attr('data-jBinder-boundFunctions').split(',');
                    var currentFunction;
                    var functionName = '';
                    var remainingFunctions = '';

                    for (i = 0; bindings.length; i++) {
                        currentFunction = bindings[i];
                        functionName = getFunctionName(currentFunction);
                        if (functionName == functionToRemove) {
                            // disable event if it is an event
                            if (currentFunction.indexOf('.') > 0) {
                                element.off(currentFunction);
                            }
                        }
                        else {
                            if (remainingFunctions != '') { remainingFunctions += ','; } //comma seperate
                            remainingFunctions += currentFunction;
                        }
                    }
                    element.attr('data-jBinder-boundFunctions', remainingFunctions); // update the bound functions with any remaining functions that are still bound
                });
            }
        }
    };

    $.fn.jBinder = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.bindFunctions.apply(this);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.jBinder');
        }
    };
})(jQuery);