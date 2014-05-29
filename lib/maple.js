var spawn = require('child_process').spawn,
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    _ = require('underscore'),
    $ = require('jquery-deferred');

// Constructor for a new Maple session
var Maple = function(cmaple) {
    this.child = spawn(path.normalize(cmaple), ['-q']);
    this.stdin = this.child.stdin;
    this.stdout = this.child.stdout;
    this.dfd = $.Deferred(function(dfd) {
        dfd.resolve();
    }).promise();

    // Proxy some events
    var maple = this;
    maple.child.on('close', function(code) {
        maple.emit('close', code);
    });
};

// Extend the prototype
_.extend(Maple.prototype, EventEmitter.prototype, {

    // Writes a command to the cmaple child process
    // Note: this function is not intended for direct use. The write method is
    // simply a shortcut in order not to have to add the newline character 
    // manually. If you want the result of the statement, use maple.queue(), or
    // the less abstract methods maple.int(), maple.diff() etc.
    write: function(stmt) {
        this.child.stdin.write(stmt + '\n');
    },

    // This is the main method which is used the most. The queue method is
    // the most general method for a calculation to be executed by Maple. All
    // shorthand methods like maple.int() and maple.diff() use this method.
    // 
    // The philosophy is that the Maple object has one main "queue", where all
    // statements are stored, waiting for to be executed. This queue is a 
    // Deferred. This is mandatory due to the asynchronous nature of writing to
    // the stdin and stdout of a child process. When a new statement is bound
    // to the queue, a 'once' callback is bound to the child process's stdout.
    // This event binding may only be done after the previous statement was 
    // executed and has written something to the stdout. Otherwise, the event
    // will fire too early of course!
    // Note that maple statements terminated with a colon (:) do not produce
    // output. Therefore, null is returned, meaning that the deferred which is
    // returned will be resolved immediately.
    queue: function(stmt) {
        var maple = this;
        maple.dfd = maple.dfd.then(function() {
            maple.write(stmt);
            if (stmt.match(/\;/)) {
                return $.Deferred(function(dfd) {
                    maple.stdout.once('data', function(data) {
                        dfd.resolve(''+data);
                    });
                }).promise();
            }
            else {
                return null;
            }
        });
        return maple.dfd;
    },

    // This method is a kind of decorator method for the maple.queue() method.
    // Maple.queue() returns simply the raw data. However, often a numeric 
    // value will be returned. Therefore, is a Maple statement is to be 
    // executed, which is expected to return a numeric value, this function
    // automatically parses a numeric value from queue's output and passes it 
    // to the deferred's resolve function
    numeric: function(stmt) {
        return this.queue(stmt).then(function(data) {
            return parseFloat(''+data);
        });
    },

    // Restarts the maple session
    restart: function() {
        var maple = this;
        return maple.queue('restart:').then(function() {
            maple.emit('restart');
        });
    },

    // Quits the maple session
    quit: function() {
        return this.queue('quit:');
    },

    // Performs an integration between two boundaries
    int: function(fn, a, b) {
        return this.numeric('int(x -> '+fn+', '+a+'..'+b+');');
    },

    // Calculates a derivative of a function in a specified point
    // Optionally, the nth derivative can be specified
    diff: function(fn, x, n) {
        if (n === undefined) {
            n = 1;
        }
        return this.numeric('eval(diff('+fn+', [x$'+n+']),x='+x+');');
    }

});


module.exports = Maple;