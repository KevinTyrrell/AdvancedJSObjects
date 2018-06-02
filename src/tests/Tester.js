/*
Copyright © 2018 Kevin Tyrrell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
 * File Name:       Tester
 * File Author:     Kevin Tyrrell
 * Date Created:    05/14/2018
 */

"use strict";

println("Starting tests.");

let x = null, y = null;
const a = function(v, oldVal, newVal)
{
    x = oldVal;
    y = newVal;
};

const c = Property.new(5);
c.addListener(a);

const d = Property.new(10);

assert(c.get() === 5);
assert(d.get() === 10);
c.set(3);
assert(x === 5 && y === 3);
d.bind(c);
assert(d.get() === c.get());
c.set(15);
assert(d.get() === 15);

println("Ending tests.");
