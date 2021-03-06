node-maple
==========

Node-maple is a bridge between Node.js and the computer algebra system [Maple](www.maplesoft.com)

Install using
```
npm install node-maple
```
and use as
```javascript
var Maple = require('node-maple');
var slave = new Maple('/path/to/maple/cli/executable');
```

From then on, you can use the main function Maple.queue() as

```javascript
slave
  .queue('restart:')
  .queue('a := Pi:')
  .queue('f := x -> x^2:')
  .numeric('evalf(f(a));')
  .then(function(x) {
    console.log('Pi squared equals ' + x);
  })
  // Don't forget to quit after you're done, otherwise it will keep on running!
  .quit();
```

If you expect a statement to output a numerical value, use Maple.numeric() to automatically parse it to a numeric value.
Using Maple.queue() would only result in the raw output that Maple provided.
You can use this however to write your own parser, which parses algebraic output to JavaScript functions for example.

Also, a few functions are built in, such as Maple.restart(), Maple.int() and Maple.diff().
Take a look at example.js for more info.

I know that the functionality is pretty basic, however, the Maple.queue() method should get you pretty far.
Also, I mainly made this for my own interest, so I don't think I will actively work on this project, but feel free to post suggestions and pull requests!
