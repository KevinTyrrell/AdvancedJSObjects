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
 * File Name:       NumberProperty
 * File Author:     Kevin Tyrrell
 * Date Created:    05/22/2018
 */

"use strict";

/**
 * Number property module.
 * Subclass of ReadOnlyPropertyWrapper
 * Defines a Property for numerical values.
 */
const NumberProperty = (function()
{
    /* Module design pattern. */
    const module = { };

    /* Private and protected static member(s). */
    const privateStatic = Object.freeze(ReadOnlyPropertyWrapper.extend(module));
    const protectedStatic = Object.freeze(privateStatic.protected);

    /* Returns true if the parameter is a valid number. */
    const isNumber = function(num)
    {
        return num !== undefined && num !== null && Type.of(num) === Type.NUMBER;
    };

    module.new = function(value)
    {
        if (value === undefined)
            value = 0;
        assert(isNumber(value));

        const prot = protectedStatic.new(value);
        const instance = prot.this;

        /* ~~~~~~~~~~ Public member(s) ~~~~~~~~~~ */

        /**
         * Override set.
         * @see: Property.set
         */
        instance.set = (function()
        {
            const set = instance.set;

            return function(newValue)
            {
                assert(isNumber(newValue));
                set(newValue);
            };
        })();

        /**
         * Adds a number to the Property.
         * @param summand Number to be added.
         */
        instance.add = function(summand)
        {
            assert(isNumber(summand));
            instance.set(instance.get() + summand);
        };

        /**
         * Subtracts a number from the Property.
         * @param subtrahend Number to be subtracted.
         */
        instance.subtract = function(subtrahend)
        {
            assert(isNumber(subtrahend));
            instance.set(instance.get() - subtrahend);
        };

        /**
         * Multiplies the Property by a number.
         * @param factor Number to multiply by.
         */
        instance.multiply = function(factor)
        {
            assert(isNumber(factor));
            instance.set(instance.get() * factor);
        };

        /**
         * Divides the Property by a number.
         * @param divisor Number to divide by.
         */
        instance.divide = function(divisor)
        {
            assert(isNumber(divisor));
            assert(divisor !== 0);
            instance.set(instance.get() / divisor);
        };

        /**
         * Increments the Property.
         */
        instance.increment = function()
        {
            instance.add(1);
        };

        /**
         * Decrements the Property.
         */
        instance.decrement = function()
        {
            instance.subtract(1);
        };

        return Object.freeze(instance);
    };

    return Object.freeze(module);
})();
