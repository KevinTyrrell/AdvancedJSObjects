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
 * File Name:       ReadOnlyPropertyWrapper
 * File Author:     Kevin Tyrrell
 * Date Created:    05/22/2018
 */

"use strict";

/**
 * Read-only property wrapper module.
 * Subclass of Property.
 * Defines a Property which holds a read-only version of itself.
 */
const ReadOnlyPropertyWrapper = (function()
{
    /* Module design pattern. */
    const module = { };

    /* Private and protected static member(s). */
    const privateStatic = Object.freeze(Property.extend(module));
    const protectedStatic = privateStatic.protected;

    /* Protected constructor. */
    protectedStatic.new = (function()
    {
        const c = protectedStatic.new;

        return function(value)
        {
            if (value === undefined)
                value = null;

            const prot = c(value);
            const instance = prot.this;

            /* ~~~~~~~~~~ Local member(s) ~~~~~~~~~~ */

            /* Read-only property which shadows the Property. */
            let readOnly = null;
            /* Notifies listeners of the read-only Property. */
            let notify = null;

            /* ~~~~~~~~~~ Public member(s) ~~~~~~~~~~ */

            /**
             * Provides a read-only view of the Property.
             * Changes made in the Property are reflected in the view.
             * A read-only view will only be created if requested.
             * @returns {{}} Read-only view of the Property.
             */
            instance.readOnly = function()
            {
                if (readOnly === null)
                {
                    readOnly = ReadOnlyProperty.new(function()
                    {
                        return instance.get();
                    });

                    /* Access protected member of the ReadOnlyProperty instance. */
                    notify = protectedStatic.super.super.protected(readOnly).notify;
                }

                return readOnly;
            };

            /**
             * Override set.
             * @see: Property.set
             */
            instance.set = (function()
            {
                const set = instance.set;

                return function(newValue)
                {
                    const oldValue = instance.get();
                    set(newValue);
                    if (readOnly !== null)
                        notify(oldValue);
                };
            })();

            return Object.freeze(prot);
        };
    })();
    Object.freeze(protectedStatic);

    /**
     * Public constructor.
     * @param value Value of the Property.
     * @returns {ReadonlyArray<{}>} Property instance.
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
