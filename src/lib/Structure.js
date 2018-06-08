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
 * File Name:       Structure
 * File Author:     Kevin Tyrrell
 * Date Created:    05/14/2018
 */

"use strict";

/**
 * Structure module.
 * Defines a base class for closure-based objects.
 */
const Structure = (function()
{
    /* Module design pattern. */
    const module = { };

    /**
     * Enables a class to support subclassing.
     * A subclass in this context is one which has access to protected static
     * member(s) of the super class (including super classes' protected constructor).
     * @param module Submodule to support the extension.
     * @param superProtectedStatic Protected static member(s) of the super class.
     * @returns {{private: private, protected: {new: new, protected: protected, super: *}}} Private static member(s).
     */
    const extend = function(module, superProtectedStatic)
    {
        assert(Boolean(module));
        assert(typeof module === "object");
        assert(!Object.isSealed(module));
        assert(!Object.isFrozen(module));
        assert(Boolean(superProtectedStatic));
        assert(typeof superProtectedStatic === "object");
        /* Classes must be concrete to be extended. */
        assert(Object.isFrozen(superProtectedStatic));

        /* Maps which associate public instances with their protected & private member(s). */
        const protectedMap = new WeakMap();
        const privateMap = new WeakMap();

        /**
         * @param instance Object to check.
         * @returns {boolean} True if the object is a member of the class.
         */
        const hasInstance = function(instance)
        {
            assert(Boolean(instance));
            assert(typeof instance === "object");
            return privateMap.has(instance);
        };
        module.hasInstance = hasInstance;

        /* Protected static member(s) of the class. */
        const protectedStatic = {
            /**
             * Instantiates a base object through a super constructor.
             * The protected table returned has the following members:
             * -> this: A reference to the object instance.
             * -> super: A reference to the super classes' protected member(s).
             * @param args Variable arguments passed to the super constructor.
             * @returns {{this, super: *|{this: {}|this, super: *}|ReadonlyArray<{}>|Readonly<{}|this>}} Protected member(s).
             * TODO: Determine a solution to trusting the user to provide the super static protected member(s).
             */
            new: function(...args)
            {
                const superProt = superProtectedStatic.new(...args);

                const instance = superProt.this;
                const prot = {
                    this: instance,
                    super: superProt
                };

                protectedMap.set(instance, prot);
                privateMap.set(instance, { });

                return prot;
            },
            /**
             * Queries the class for the protected member(s) of the instance.
             * @param instance Object instance to query.
             * @returns {{}} Protected members(s) of the instance.
             */
            protected: function(instance)
            {
                assert(Boolean(instance));
                assert(typeof instance === "object");
                assert(hasInstance(instance));
                return protectedMap.get(instance);
            },
            /**
             * Reference to the super classes' protected static member(s).
             */
            super: superProtectedStatic
        };

        /* Private static member(s) of the class. */
        return {
            /**
             * Queries the class for the private member(s) of the instance.
             * @param instance Object instance to query.
             * @returns {{}} Private member(s) of the instance.
             */
            private: function(instance)
            {
                assert(Boolean(instance));
                assert(typeof instance === "object");
                assert(hasInstance(instance));
                return privateMap.get(instance);
            },
            /**
             * Reference to the protected static member(s) of the class.
             */
            protected: protectedStatic,
            /**
             * Allows the class to set up subclassing.
             */
            extend: extend
        };
    };

    /* Private static member(s). */
    const privateStatic = Object.freeze(extend(module, Object.freeze({
        /*
        Implements the top level instantiation of Structure objects.
        Structure technically extends this anonymous class declaration.
         */
        new: function()
        {
            return Object.freeze({ this: { } })
        }
    })));

    /* Protected static member(s). */
    const protectedStatic = (function()
    {
        const t = privateStatic.protected;
        t.super = undefined;

        const c = t.new;
        t.new = function()
        {
            const prot = c();
            prot.super = undefined;
            const instance = prot.this;

            /* ~~~~~~~~~~ Public member(s) ~~~~~~~~~~ */

            /**
             * @returns {string} String representation of the Structure.
             */
            instance.toString = function()
            {
                return "Structure";
            };

            return Object.freeze(prot);
        };

        return Object.freeze(t);
    })();

    /**
     * Public constructor.
     * @returns {ReadonlyArray<{}>} Structure instance.
     */
    module.new = function()
    {
        return Object.freeze(protectedStatic.new().this);
    };

    /**
     * @see: extend
     * @param module Submodule to extend functionality to.
     * @returns {{}} Protected static member(s).
     */
    module.extend = function(module)
    {
        return protectedStatic.extend(module, protectedStatic);
    };

    return Object.freeze(module);
})();
