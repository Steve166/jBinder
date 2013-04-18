describe("jBinder", function() {

    beforeEach(function() {
        // Set the HTML from the template
        $('#container').html($('#containerTemplate').html().replace(/\Template/g, ''));
    });
    
    afterEach(function() {
        $('#container').jBinder('removeFunction'); // Remove all jBinder functions
        $.jBinder.unRegisterFunction(); // Remove all function registrations
    });

    it("should be able to bind a function", function() {
        $.jBinder.registerFunction('Func1', function() {
        });
        $('#standard').jBinder();
        
        // Make sure it doesn't die
        expect(true).toEqual(true);
    });

    it("should mark functions as being bound", function() {
        $.jBinder.registerFunction('Func0', function() {
        });
        $.jBinder.registerFunction('Func2', function() {
        });
        $('#standard').jBinder();
        expect($('#testDiv').attr('data-jbinder-boundfunctions')).toEqual('Func0');
        expect($('#testDiv2').attr('data-jbinder-boundfunctions')).toEqual('change.Func2');
    });

    it("should leave unbound functions to be bound later", function() {
        $.jBinder.registerFunction('Func2', function() {
        });
        $('#standard').jBinder();
        expect($('#testDiv3').attr('data-jbinder-functions')).toEqual('change.Func3');
    });

    it("should only bind functions within containers that have had jBinder called on them", function() {
        $.jBinder.registerFunction('Func0', function() {
        });
        $('#standard').jBinder();
        expect($('#testDiv').attr('data-jbinder-boundfunctions')).toEqual('Func0');
        expect($('#testDiv5').attr('data-jbinder-functions')).toEqual('0.Func1,Func2,2.Func3');
    });

    describe("event driven functions", function() {
        var function4;
        var function5;
        var functionWithArgs;
        
        beforeEach(function() {
            function4 = jasmine.createSpy('function4');
            function5 = jasmine.createSpy('function5');
            functionWithArgs = jasmine.createSpy('functionWithArgs');
        });
        
        it("should fire the correct function on the event", function() {
            $.jBinder.registerFunction('Func4', function(args) {
                function4();
            });
            $.jBinder.registerFunction('Func5', function(args) {
                function5();
            });
            $('#standard').jBinder();
            expect(function4).not.toHaveBeenCalled();
            expect(function5).not.toHaveBeenCalled();
            $('#testDiv4').trigger('change');
            expect(function4.calls.length).toEqual(1);
            expect(function5).not.toHaveBeenCalled();
            $('#testDiv4').trigger('update');
            expect(function4.calls.length).toEqual(1);
            expect(function5).toHaveBeenCalled();
        });
        
        it("shouldn't fire more than once if jBinder is called multiple times", function() {
            $.jBinder.registerFunction('Func4', function(args) {
                function4();
            });
            $.jBinder.registerFunction('Func5', function(args) {
                function5();
            });
            $('#standard').jBinder();
            $('#standard').jBinder();
            expect(function4).not.toHaveBeenCalled();
            expect(function5).not.toHaveBeenCalled();
            $('#testDiv4').trigger('change');
            expect(function4.calls.length).toEqual(1);
            expect(function5).not.toHaveBeenCalled();
            $('#testDiv4').trigger('update');
            expect(function4.calls.length).toEqual(1);
            expect(function5).toHaveBeenCalled();
        });
        
        it("should pass the default arguments", function() {
            // Create spy
            $.jBinder.registerFunction('Func5', function(args) {
                functionWithArgs(args);
            });
            $.jBinder.registerFunction('Func3', function(args) {
                functionWithArgs(args);
            });
            $('#container').jBinder();
            $('#testDiv4').trigger('update');
            expect(functionWithArgs.mostRecentCall.args[0].element.attr('id')).toEqual('testDiv4');
            expect(functionWithArgs.mostRecentCall.args[0].event.type).toEqual('update');
            expect(Object.keys(functionWithArgs.mostRecentCall.args[0]).length).toEqual(2);
            $('#testDiv3').trigger('change');
            expect(functionWithArgs.mostRecentCall.args[0].element.attr('id')).toEqual('testDiv3');
            expect(functionWithArgs.mostRecentCall.args[0].event.type).toEqual('change');
            expect(Object.keys(functionWithArgs.mostRecentCall.args[0]).length).toEqual(2);
        });
        
        it("should pass the specified arguments", function() {
            // Create spy
            $.jBinder.registerFunction('Func5', function(args) {
                functionWithArgs(args);
            });
            $.jBinder.registerFunction('Func4', function(args) {
                functionWithArgs(args);
            });
            $('#container').jBinder();
            $('#testDiv6').trigger('change');
            expect(functionWithArgs.mostRecentCall.args[0].arg).toEqual('hello');
            expect(Object.keys(functionWithArgs.mostRecentCall.args[0]).length).toEqual(3);
            $('#testDiv6').trigger('update');
            expect(functionWithArgs.mostRecentCall.args[0].arg).toEqual('goodbye');
            expect(Object.keys(functionWithArgs.mostRecentCall.args[0]).length).toEqual(3);
        });

    });

    describe("immediate functions", function() {
        var function1;
        var function2;
        var function3;
        
        beforeEach(function() {
            function1 = jasmine.createSpy('function1');
            function2 = jasmine.createSpy('function2');
            function3 = jasmine.createSpy('function3');
        });

        it("should fire immediatly", function() {
            $.jBinder.registerFunction('Func1', function(args) {
                function1();
            });
            $.jBinder.registerFunction('Func2', function(args) {
                function2();
            });
            $.jBinder.registerFunction('Func3', function(args) {
                function3();
            });
            $('#immediates').jBinder();
            expect(function1.calls.length).toEqual(1);
            expect(function2.calls.length).toEqual(1);
            expect(function3.calls.length).toEqual(1);
        });
        
        it("should fire in the correct order", function() {
            var callOrder = '';
            $.jBinder.registerFunction('Func1', function(args) {
                callOrder += '1';
            });
            $.jBinder.registerFunction('Func2', function(args) {
                callOrder += '2';
            });
            $.jBinder.registerFunction('Func3', function(args) {
                callOrder += '3';
            });
            $('#immediates').jBinder();
            expect(callOrder).toEqual('123');
        });
        
        it("should fire in the correct order over multiple elements ", function() {
            var callOrder = '';
            $.jBinder.registerFunction('Func1', function(args) {
                callOrder += '1';
            });
            $.jBinder.registerFunction('Func2', function(args) {
                callOrder += '2';
            });
            $.jBinder.registerFunction('Func3', function(args) {
                callOrder += '3';
            });
            $.jBinder.registerFunction('Func4', function(args) {
                callOrder += '4';
            });
            $.jBinder.registerFunction('Func5', function(args) {
                callOrder += '5';
            });
            $('#immediates').jBinder();
            expect(callOrder).toEqual('14235');
        });
        
        it("shouldn't fire more than once if jBinder is called multiple times", function() {
            $.jBinder.registerFunction('Func1', function(args) {
                function1();
            });
            $.jBinder.registerFunction('Func2', function(args) {
                function2();
            });
            $.jBinder.registerFunction('Func3', function(args) {
                function3();
            });
            $('#immediates').jBinder();
            $('#immediates').jBinder();
            expect(function1.calls.length).toEqual(1);
            expect(function2.calls.length).toEqual(1);
            expect(function3.calls.length).toEqual(1);
        });

    });
});