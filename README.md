jBinder
=======

Repository for jBinder; a jQuery plugin to facilitate unobtrusive JavaScript event binding.

About
=====

jBinder is a jQuery plugin that makes it easy to produce unobtrusive JavaScript making use of the HTML5 data attribute. Rather than having your JavaScript matching elements by id or by class name jBinder allows you to bind events by using the attribute data-jbinder-functions; therefore keeping your css free for what it is there for: styling. This also improves re-useability by having single functions with arguments specified in the elements themselves.

Using jBinder has two sides to it. The first of these is to register the functions that need to be bound to the DOM elements. Each function must be registered with jBinder by passing a function name and the function itself (see examples below for code). The second part of jBinder is the data-jBinder-functions attribute. Once functions are registered they can be run against an element, either immeidatly, on an event or both. By adding the attribute data-jbinder-functions to a DOM element you can specify the function to be run. With all functions registered and elements decorated with the appropriate attributes the DOM can be bound.

Methods
=======

```
registerFunction(functionName, function(args){})
```

This method registers a function with jBinder such that it can be bound to DOM elements. The method takes the name of the function and the function itself, which will be passed an argument object.

```
jBinder()
```

This method binds the DOM element and all children based on the data-jbinder-functions attribute.

HTML attributes
===============

```
data-jBinder-functions="functionName"
data-jBinder-functions="index.functionName"
data-jBinder-functions="event.functionName"
```
The data-jbinder-functions attribute details the functions to be bound to the DOM element. Multiple functions can be specified (comma delimited). Each function can be in one of three formats. Specifying just a function name will mark it as an immediate function with a default run order index of 1. Specifying an index will mark the function as an immediate function with the specified run order index. Specifying an event which bind the function to the specified event on the object.
```
data-jBinder-functionName-args
```
The data-jbinder-xxx-args attribute is an optional attribute specified per bound function. This attribute is in JSON format and defines the arguments to be passed to the bound function.
```
data-jBinder-boundFunctions
```
The data-jBinder-boundFunctions attribute is created by jBinder when it binds the functions and details which functions have been bound to the element.

Quick example
=============

The following example shows how to bind a simple ```alert()``` to a button using jBinder.

```
<!DOCTYPE html>
<html>
<head>
<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="jBinder.min.js"></script>
<script>
$(document).ready(function() {
    $.jBinder.registerFunction('helloWorld',function(args) {
      alert(args.message);
	});

	$(document).jBinder();
});
</script>
</head>
<body>
<button data-jBinder-functions="click.helloWorld" data-jBinder-helloWorld-args='{"message":"Hello world!"}'>Say hello</button>
</body>
</html>
```
