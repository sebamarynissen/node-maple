// Require the Maple class. In real applications you'd use
//
// var Maple = require('node-maple');
//
// of course
var Maple = require('./lib/maple');

// Create your Maple object by passing it the path to the cmaple.exe on 
// windows, or the equivalent path for MAC.
var slave = new Maple('C:\\Program Files\\Maple 15\\bin.X86_64_WINDOWS\\cmaple.exe');

// Integrations are built-in
// Note that a closure is needed, because of the asynchronous nature
for (var i = 1; i <= 5; i++) {
    (function(i) {
        slave.int('x^2', 0, i).then(function(x) {
            console.log('x^2 integrated from 1 to ' + i + ' is: ' + x);
        });
    })(i);
}

// So are derivatives
for (var j = 1; j <= 5; j++) {
    (function(j) {
        slave.diff('x^2', j).then(function(x) {
            console.log('dx^2/dx evaluated in ' + j + ' is: ' + x);
        });
    })(j);
}

// This
slave.numeric('eval(diff(sin(x), x), x=Pi/2);').then(function(x) {
    console.log('dsin(x)/dx evaluated in Pi/2 is: ' + x);
});
// is shorthand for
slave.queue('eval(diff(sin(x), x), x=Pi/2);').then(function(raw) {
    console.log('dsin(x)/dx evaluated in Pi/2 is: ' + parseFloat(raw));
});

// Want to have raw output?
slave.queue('diff(exp(x), x);').then(function(raw) {
    console.log('Raw output was: ', raw);
});

// Full example
// Don't forget to quit after you're done!
slave
  .queue('restart:')
  .queue('a := Pi:')
  .queue('f := x -> x^2:')
  .numeric('evalf(f(a));')
  .then(function(pi) {
    console.log('Pi squeared equals ' + pi);
  })
  .wait(3000)
  .numeric('evalf(a);')
  .then(function(a) {
    console.log('Pi equals:' + a);
  })
  .restart()
  .queue('a := 10:')
  .numeric('a;')
  .then(function(a) {
    console.log('a equals: ' + a);
  })
  .quit();
  