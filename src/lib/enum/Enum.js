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
 * File Name:       Enum
 * File Author:     Kevin Tyrrell
 * Date Created:    05/14/2018
 */

"use strict";

/**
 * Enum module.
 * Subclass of Structure.
 * Defines a base class for all Enum constants.
 */
const Enum = (function()
{
    /* Module design pattern. */
    const module = { };
    /* Protected static member(s). */
    const protectedStatic = Structure.extend(module);

    /**
     * @see Structure.extend
     * @param module Base submodule.
     * @returns {{}} Protected static member(s).
     */
    module.extend = function(module)
    {
        assert(Boolean(module));
        assert(typeof module === "object");
        assert(!Object.isFrozen(module));
        assert(!Object.isSealed(module));

        /* Container for constant instances of the Enum. */
        const values = [ ];

        /**
         * Gets the Enum constant instance corresponding to the ordinal.
         * @param ordinal Ordinal of the Enum instance.
         * @returns {{}} Enum instance.
         */
        module.get = function(ordinal)
        {
            assert(typeof ordinal === "number");
            assert(Number.isInteger(ordinal));
            assert(ordinal >= 0);
            assert(ordinal < values.length);
            return values[ordinal];
        };

        /**
         * @returns {number} Amount of Enum constants defined.
         */
        module.values = function()
        {
            return values.length;
        };

        /* Protected constructor. */
        const construct = function()
        {
            const prot = protectedStatic.new();
            const instance = prot.this;

            const ordinal = values.length;
            values.push(instance);

            /**
             * @returns {number} Index of this instance within the order of the Enum.
             */
            instance.ordinal = function()
            {
                return ordinal;
            };

            return Object.freeze(prot);
        };

        return protectedStatic.extend(module, construct);
    };

    return Object.freeze(module);
})();
