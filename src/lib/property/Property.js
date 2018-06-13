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
 * File Name:       Property
 * File Author:     Kevin Tyrrell
 * Date Created:    05/14/2018
 */

"use strict";

/**
 * Mutable property module.
 * Subclass of ReadOnlyProperty.
 * Defines a mutable subscriber producer object pattern.
 */
const Property = (function()
{
    /* Module design pattern. */
    const module = { };

    /* Private and protected static member(s). */
    const privateStatic = Object.freeze(ReadOnlyProperty.extend(module));
    const protectedStatic = privateStatic.protected;

    /* Protected constructor. */
    protectedStatic.new = (function()
    {
        const c = protectedStatic.new;

        return function(value)
        {
            if (value === undefined)
                value = null;

            /* Implement abstract method 'get'. */
            const prot = c(function()
            {
                return value;
            });
            const instance = prot.this;

            /* ~~~~~~~~~~ Local member(s) ~~~~~~~~~~ */

            /* Observable which the Property is bound to. */
            let observing = null;
            /* Callback function for the observed value. */
            let observedCallback = null;

            /* Sets the Property's value, ignores bound properties. */
            const set = (function()
            {
                const notify = prot.super.notify;

                return function(newValue)
                {
                    assert(newValue !== undefined);
                    if (value === newValue) return;
                    const oldValue = value;
                    value = newValue;
                    notify(oldValue);
                };
            })();

            /* ~~~~~~~~~~ Public member(s) ~~~~~~~~~~ */

            /**
             * Sets the current value of the Property.
             * A change is not made if the new and old value are equal.
             * Any listeners of the Property will be notified of the change.
             * A Property cannot be set if it is bound to another Property.
             * @param newValue Value to be set.
             */
            instance.set = function(newValue)
            {
                assert(!instance.isBound());
                set(newValue);
            };

            /**
             * @returns {boolean} True if the Property is bound.
             */
            instance.isBound = function()
            {
                return observing !== null;
            };

            /**
             * Unbinds the Property.
             * @see: Property.bind
             */
            instance.unbind = function()
            {
                if (!instance.isBound()) return;
                observing.removeListener(observedCallback);
                observing = null;
                observedCallback = null;
            };

            /**
             * Binds this Property to a binding.
             * Bindings are guaranteed to extend from ReadOnlyProperty.
             * A bound property will automatically update with the binding.
             * Once bound, the Property can no longer be set.
             * @param binding Observable binding to bind the Property to.
             */
            instance.bind = function(binding)
            {
                assert(Boolean(binding));
                assert(Type.of(binding) === Type.OBJECT);
                assert(ReadOnlyProperty.hasInstance(binding));
                if (binding === observing) return;
                instance.unbind();
                observing = binding;

                observedCallback = function(_, __, newValue)
                {
                    set(newValue);
                };

                observing.addListener(observedCallback);
                set(observing.get());
            };

            return Object.freeze(prot);
        };
    })();

    /**
     * Public constructor.
     * @param value Initial value of the Property.
     * @returns {Readonly<{}|this>} Property instance.
     */
    module.new = function(value)
    {
        return Object.freeze(protectedStatic.new(value).this);
    };

    /**
     * @see Structure.extend
     * @param module Base submodule.
     * @returns {{}} Private static member(s).
     */
    module.extend = function(module)
    {
        assert(Boolean(module));
        assert(Type.of(module) === Type.OBJECT);
        assert(!Object.isFrozen(module));
        assert(!Object.isSealed(module));

        return privateStatic.extend(module, protectedStatic);
    };

    return Object.freeze(module);
})();
