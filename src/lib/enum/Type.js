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
    /* Protected static member(s). */
    const protectedStatic = Enum.extend(module);

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
