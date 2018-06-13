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
 * File Name:       Binding
 * File Author:     Kevin Tyrrell
 * Date Created:    05/22/2018
 */

"use strict";

/**
 * Binding module.
 * Subclass of ReadOnlyProperty.
 * Defines a Property which is bound to a Property expression.
 */
const Binding = (function()
{
    /* Module design pattern. */
    const module = { };

    /* Private and protected static member(s). */
    const privateStatic = Object.freeze(ReadOnlyProperty.extend(module));
    const protectedStatic = Object.freeze(privateStatic.protected);

    /**
     * Public constructor.
     * Low-level binding API.
     * The compute function will be called when the binding is created,
     * and whenever any of the observed values change their value.
     * Due to the limitations of the JavaScript language, once a binding is created
     * it or any of the observed values cannot be deconstructed until 'unbind' is called.
     * This is due to the listener being a strong reference, which is given to the observable.
     * @param compute Function which computes the current value of the Binding.
     * @param observables Properties in which changes dictate a re-calculation of the binding.
     * @returns {ReadonlyArray<{}>} Binding instance.
     */
    module.new = function(compute, ...observables)
    {
        assert(Boolean(compute));
        assert(Type.of(compute) === Type.FUNCTION);
        /* Ensure all observable values are unique. */
        observables = new Set(observables);
        assert(observables.size > 0);

        /* Last calculated value of the binding. */
        let value = compute();

        /* Implement abstract method 'get'. */
        const prot = protectedStatic.new(function()
        {
            return value;
        });
        const instance = prot.this;

        /* ~~~~~~~~~~ Public member(s) ~~~~~~~~~~ */

        /**
         * Unbinds this binding, canceling future updates.
         * A binding should be unbound when no longer used,
         * as it maintains strong references to its observed
         * values and will not allow them to be garbage collected.
         * TODO: Standardize the 'unbind' from Property and Binding.
         */
        instance.unbind = (function()
        {
            const listener = (function()
            {
                const notify = prot.super.notify;

                return function()
                {
                    const oldValue = value;
                    value = compute();
                    if (oldValue !== value)
                        notify(oldValue);
                };
            })();

            for (let o of observables)
            {
                assert(Boolean(o));
                assert(Type.of(o) === Type.OBJECT);
                assert(ReadOnlyProperty.hasInstance(o));
                o.addListener(listener);
            }

            return function()
            {
                for (let o of observables)
                    o.removeListener(listener);
                observables.clear();
            };
        })();

        return Object.freeze(instance);
    };

    return Object.freeze(module);
})();
