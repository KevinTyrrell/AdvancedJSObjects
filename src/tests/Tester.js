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

println("==== Starting tests ====");

const listener = function(_, oldVal, newVal)
{
    println("Property changed from " + oldVal + " to " + newVal);
};

const a = NumberProperty.new(5);
const b = NumberProperty.new(10);

a.addListener(listener);
b.addListener(listener);

a.set(3);
b.bind(a);

a.add(15);

a.unbind();
b.unbind();

const c = NumberProperty.new(25);
const d = c.readOnly();

assert(!NumberProperty.hasInstance(d));
assert(ReadOnlyProperty.hasInstance(d));
assert(d.set === undefined);

assert(c.get() === d.get());
c.set(30);
assert(d.get() === 30);

d.addListener(listener);
c.increment();

c.unbind();

println("==== Ending tests ====");
