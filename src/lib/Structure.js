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
     * Allows a module to support subclassing.
     * A sub-class in this context is one which has access to the following:
     * -> Constructor which constructs a base instance of the class.
     * -> Private member(s) of the class.
     * -> Protected member(s) of the class and its superclass(es).
     * -> Functionality to subclass.
     * @param module Base submodule.
     * @param superConstructor Super constructor of the class.
     * @returns {Readonly<{new: new, protected: protected, private: private, extend: extend}>} Protected static member(s).
     */
    const extend = function(module, superConstructor)
    {
        assert(Boolean(module));
        assert(typeof module === "object");
        assert(!Object.isFrozen(module));
        assert(!Object.isSealed(module));
        assert(Boolean(superConstructor));
        assert(typeof superConstructor === "function");

        /* Maps to associate instances with their private and protected members. */
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

        return Object.freeze({
            /**
             * Creates a base object instance.
             * The protected table returned has the following members:
             * -> this: A reference to the object instance.
             * -> super: A reference to the super classes' protected member(s).
             * @param args Arguments which are passed to the super constructor.
             * @returns {{this: {}|this, super: *}} Instance's protected member(s).
             */
            new: function(...args)
            {
                const superProt = superConstructor(...args);
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
             * Looks up the protected member(s) of an instance.
             * @param instance Object instance to inspect.
             * @returns {{}} Protected element(s) of the instance.
             */
            protected: function(instance)
            {
                assert(Boolean(instance));
                assert(typeof instance === "object");
                assert(hasInstance(instance));
                return protectedMap.get(instance);
            },
            /**
             * Looks up the private member(s) of an instance.
             * @param instance Object instance to inspect.
             * @returns {{}} Private element(s) of the instance.
             */
            private: function(instance)
            {
                assert(Boolean(instance));
                assert(typeof instance === "object");
                assert(hasInstance(instance));
                return privateMap.get(instance);
            },
            /**
             * @see Structure.extend
             */
            extend: extend
        });
    };

    const protectedStatic = extend(module, function()
    {
        /*
        Structure is technically a subclass as to avoid repeating boilerplate
        code. Due to this, the object instance must be contained within a valid
        protected object. Thus, the super-object of all Structure is an empty
        protected object which holds an empty base object instance.
        */
        return Object.freeze({ this: { } });
    });

    /* Protected constructor. */
    const construct = function()
    {
        const prot = protectedStatic.new();
        const instance = prot.this;

        /* ~~~~~~~~~~ Public member(s) ~~~~~~~~~~ */

        /**
         * @returns {string} String representation of the Structure.
         */
        instance.tostring = function()
        {
            return "Structure";
        };

        return Object.freeze(prot);
    };

    /**
     * Public constructor.
     * @returns {ReadonlyArray<{}>} Structure instance.
     */
    module.new = function()
    {
        return Object.freeze(construct().this);
    };

    /**
     * @see: extend
     * @param module Submodule to extend functionality to.
     * @returns {{}} Protected static member(s).
     */
    module.extend = function(module)
    {
        return protectedStatic.extend(module, construct);
        // return protectedStatic.extend(module, function()
        // {
        //     return protectedStatic.new();
        // });
    };

    return Object.freeze(module);
})();
