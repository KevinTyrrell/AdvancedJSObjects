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
 * File Name:       Type
 * File Author:     Kevin Tyrrell
 * Date Created:    05/14/2018
 */

"use strict";

/**
 * Type module.
 * Subclass of Enum.
 * Defines an Enum to replace String type constants.
 */
const Type = (function()
{
    /* Module design pattern. */
    const module = { };

    /* Private and protected static member(s). */
    const privateStatic = Enum.extend(module);
    const protectedStatic = privateStatic.protected;

    /* Private constructor. */
    const construct = function(name)
    {
        assert(Boolean(name));
        assert(typeof name === "string");

        const prot = protectedStatic.new();
        const instance = prot.this;

        /**
         * @returns {string} Name of the Type instance.
         */
        instance.getName = function()
        {
            return name;
        };

        /* Override toString. */
        instance.toString = instance.getName;

        return Object.freeze(instance);
    };

    /* Enum constant(s). */
    module.BOOLEAN = construct("boolean");
    module.FUNCTION = construct("function");
    module.UNDEFINED = construct("undefined");
    module.NUMBER = construct("number");
    module.STRING = construct("string");
    module.SYMBOL = construct("symbol");
    module.OBJECT = construct("object");

    /**
     * Determines a variable's data type in terms of Type enum instances.
     * Used as a replacement for 'typeof'.
     * @returns {{}} Type instance corresponding to the variable's type.
     */
    module.of = (function()
    {
        const fromString = new Map();

        for (let i = 0; i < module.values(); i++)
        {
            const type = module.get(i);
            fromString.set(type.getName(), type);
        }

        return function(variable)
        {
            assert(variable !== null);
            return fromString.get(typeof variable);
        };
    })();

    return Object.freeze(module);
})();
