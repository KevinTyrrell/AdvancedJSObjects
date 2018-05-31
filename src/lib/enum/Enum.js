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
