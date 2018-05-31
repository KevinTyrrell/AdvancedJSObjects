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
 * File Name:       ReadOnlyProperty
 * File Author:     Kevin Tyrrell
 * Date Created:    05/14/2018
 */

"use strict";

/**
 * Read-only property module.
 * Subclass of Structure.
 * Defines an abstract subscriber producer object pattern.
 */
const ReadOnlyProperty = (function()
{
    /* Module design pattern. */
    const module = { };
    /* Protected static member(s). */
    const protectedStatic = Structure.extend(module);

    /* Protected constructor. */
    const construct = function(getCallback)
    {
        assert(Boolean(getCallback));
        assert(Type.of(getCallback) === Type.FUNCTION);

        const prot = protectedStatic.new();
        const instance = prot.this;

        /* ~~~~~~~~~~ Local member(s) ~~~~~~~~~~ */

        /* Callback(s) listening to changes in the Property. */
        const listeners = new Set();

        /* ~~~~~~~~~~ Protected member(s) ~~~~~~~~~~ */

        /**
         * Notifies all listeners that the Property changed.
         * @see: ReadOnlyProperty.addListener
         * @param oldValue Value which was overwritten.
         */
        prot.notify = function(oldValue)
        {
            assert(oldValue !== undefined);
            const newValue = instance.get();
            for (let listener of listeners)
                listener(instance, oldValue, newValue);
        };

        /* ~~~~~~~~~~ Public member(s) ~~~~~~~~~~ */

        /**
         * Returns the value of the Property.
         */
        instance.get = getCallback;

        /**
         * Adds a listener which monitors changes to the Property.
         * @see: ReadOnlyProperty.new
         * @param callback Function to be called.
         */
        instance.addListener = function(callback)
        {
            assert(Boolean(callback));
            assert(Type.of(callback) === Type.FUNCTION);
            listeners.add(callback);
        };

        /**
         * Removes a listener from the Property.
         * @param callback Function to be removed.
         * @returns {boolean|void|Promise<void>} True if the listener was removed.
         */
        instance.removeListener = function(callback)
        {
            assert(Boolean(callback));
            assert(Type.of(callback) === Type.FUNCTION);
            return listeners.delete(callback);
        };

        /**
         * @see: Structure.tostring
         * @returns {string} String representation of the Property.
         */
        instance.tostring = function()
        {
            const v = instance.get();
            if (v !== null
                && Type.of(v) === Type.OBJECT
                && Structure.hasInstance(v))
                return v.tostring();
            return "" + v;
        };

        return Object.freeze(prot);
    };

    /**
     * Public constructor.
     * The callback will be provided the following:
     * <property>, <oldValue>, <newValue>
     *     <property>: Property which has changed.
     *     <oldValue>: The value that was replaced.
     *     <newValue>: The replacement value that was set.
     * @param getCallback Function to be called.
     * @returns {Readonly<{}|this>} ReadOnlyProperty instance.
     */
    module.new = function(getCallback)
    {
        return Object.freeze(construct(getCallback).this);
    };

    /**
     * @see Structure.extend
     * @param module Base submodule.
     * @returns {{}} Protected static member(s).
     */
    module.extend = function(module)
    {
        assert(Boolean(module));
        assert(Type.of(module) === Type.OBJECT);
        assert(!Object.isFrozen(module));
        assert(!Object.isSealed(module));

        return protectedStatic.extend(module, construct);
    };

    return Object.freeze(module);
})();
