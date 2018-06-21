# AdvancedJSObjects

Object-Oriented Programming (OOP) JavaScript library for complex objects.

TODO: https://stackoverflow.com/questions/2822089/how-to-link-to-part-of-the-same-document-in-markdown

# How It Works

---

The goal is to implement **class-based** objects, **subtyping**, **encapsulation**, **polymorphism**, and **dynamic dispatch** in JavaScript
.
The entire proto-typing system, including *objects as functions* (using the `this` and `new` keyword) won't be of any use to us to implement a `class`-based system.
That leaves object literals.

```javascript
let myMachine = { };
```

## Public Members

Public object member(s) are 'already implemented' by JavaScript, since anyone with access to `myMachine` has access to all of the member(s) inside.

```javascript
myMachine.modelNumber = 34129;
myMachine.state = true;
myMachine.start = function()
{
    myMachine.state = true;
    console.log("Machine " + myMachine.modelNumber + " is now starting up.");
};
```

## Constant / Final Members

<center>![Frozen](https://i.imgur.com/FCtsLqi.png)</center>
<center>*Object.freeze() characterized.*</center>

Notice that all member(s) of `myMachine` are mutable. JavaScript doesn't provide a way to declare `const` keys of an object.
`Object.freeze()` would work, however it would cause ALL members to become `const` (and would also prevent new members from being defined). 
To circumvent this limitation, *closures* must be utilized.

```javascript
myMachine.modelNumber = (function()
{
    const modelNo = 34129;
    
    return function()
    {
        return modelNo;
    };
});

(function()
{
    let state = false;
    
    myMachine.setState = function(newState)
    {
        state = newState;
    };
    
    myMachine.getState = function()
    {
        return state;
    };
})();
```

Both data elements have been abstracted behind closures and can only be interacted with accessors and mutators.
You may think `modelNo` and `state` are now `private`, but that is not completely true which I will cover later on.

Once we are done adding elements to the object, we can lock it with `Object.freeze()`, truly making `modelNo` `const` while leaving `state` mutable.

## Constructors

Instead of dealing with loose objects, it would be much better if we had a concrete constructor which can produce `Machine` objects without any possible deviation. That can be achieved by creating a `module` using the [Module Design Pattern](https://en.wikipedia.org/wiki/Module_pattern).

```javascript
const Machine = (function()
{
    const module = { };
    
    module.createMachine = function()
    {
        const machine = { };
        
        const modelNo = 34129;
        let state = false;
        
        machine.modelNumber = function()
        {
            return modelNo;
        };
        
        machine.setState = function(newState)
        {
            state = newState;
        };
        
        machine.getState = function()
        {
            return state;
        };
        
        return Object.freeze(machine);
    };
    
    return Object.freeze(module);
})();
```

The module (think of it like a `class`) is concrete and contains a *constructor* which creates `Machine` objects. 
Unfortunately that's not completely true. Objects returned from `createMachine` are still not really *Machines*. 

## Enforcing Complex Data Types

<center>![Ducks](https://i.imgur.com/vaazCsO.png)</center>
<center>*If it looks like a duck, swims like a duck, and quacks like a duck, then it is still possible it may not be a duck.*</center>

Ideally we'd like to see `myMachine` actually be considered a `Machine` in terms of data type.
It may seem ideal to embed the data type inside the object itself somehow, but that's a flawed approach. That is because the `public` member(s) of a JavaScript object cannot be trusted. Here's why:

```javascript
const myMachine = Machine.createMachine();
const imposter1 = Object.assign({ }, myMachine);
const imposter2 = { modelNumber: function() { } };
// How can we know without a doubt which one is a Machine?
```

We need to add another layer of abstraction to enforce complex data types.
A mother is known to always be able to recognize her children. Let's use that theory here.
When `myMachine` is created, a pointer to it is stored in a `Set` which is hidden inside the `Machine` module. Any part of the program can then ask `Machine` if `myMachine` was created by that module.

```javascript
const machines = new Set();

const createMachine = function()
{
    const machine = { };
    machines.add(machine);
    return machine;
};

const isMachine = function(obj)
{
    return machines.has(obj);
};

const machine = createMachine();
const clone = Object.assign({ }, machine);

console.log(isMachine(machine)); // true
console.log(isMachine(clone)); // false
```

Now, thanks to the `Machine` module, we can clearly distinct ANY JavaScript object as either a machine, or not.
This enables type enforcement of objects. Previously only having the primitive `typeof` stdlib function, we can now
check if objects are `undefined`, `null`, are `typeof === "object"` and finally check if they are a `Machine` with certainty.

*Note: Since a `Set` or `{ }` would maintain a **hard link** to all `Machine` objects, a `WeakSet` should be used.*

## Private Static Members

Inside the `Machine` module, we've actually already defined `public static` and `private static` members.
`createMachine` is a `public static` function and `machines` is a `private static` object.

```javascript
const Machine = (function()
{
    const module = { };
    
    ...
    
    let nextModel = 23444; // private static
    
    module.createMachine = function()
    {
        const machine = { };
        
        const modelNo = nextModel++;
        
        ...
    };
    
    ...
    
    return Object.freeze(module);
})();
```

`nextModel` here is a `private static` member of `Machine`, as it cannot be accessed outside of this scope.
Now `Machine` objects relate back to the class, as they each are stamped with their model number from the constructor of `Machine`.

## Private Members

It may be tempting to think of `modelNo` as `private`, as it cannot be accessed outside of this class (*module*). `modelNo` is actually `local`, like the Lua keyword, not `private`.
This is because `private` members should be accessible from other instances of the same class. `machineA` should be able to access all `private` members in `machineB`. Here's what I mean:

```javascript
module.createMachine = function()
{
    const machine = { };
    
    const modelNo = ...;
    
    machine.greet = function(otherMachine)
    {
        if (!isMachine(otherMachine)) return;
        
        console.log("Greetings. I am Machine#" + modelNo 
            + ". It is nice to meet you, Machine#" + otherMachine.modelNo); // undefined
    };
};
```

If you define a variable inside of a closure like this, it's local within that closure; unable to be shared across the class.

Somehow, we need to allow each object to 'lookup' the `private` member(s) of another object of the same class. A `Machine` is allowed to look at the `private` members of another `Machine`, but not an `Apple`.

```javascript
const privateLookup = new Map();

const createMachine = function()
{
    const machine = { };
    const privateMembers = { };
    
    privateMembers.modelNo = Math.random();
    privateLookup.set(machine, privateMembers);
    
    return machine;
};
```

In order for `private` members to be shared to other objects, they would need to be inside of a container similar to `public` members.
`protected` members will also follow this pattern later on. Controlling access to these three containers is what will give us the effect of **access modifiers**.

Creating a `Map` which associates the `public` members of the object to the `private` members will enable objects of the same class to access each other's `private` members.
The module now looks like the following:

```javascript
const Machine = (function()
{
    const module = { };
    
    // Maps Machines -> Machine's Private Members
    const privMap = new WeakMap();
    
    module.isMachine = function(obj)
    {
        // We can double down on the functionality of the Map to avoid using a Set.
        return privMap.has(obj);
    };
    
    let nextModel = 23444;
    
    module.createMachine = function()
    {
        const instance = { };           // Public members of this Object
        const priv = { };               // Private members of this Object
        privMap.set(instance, priv);    // Associate the two together.
        
        priv.modelNo = nextModel++;     // Private member.
        
        instance.greet = function(other)// Public member.
        {
            if (!module.isMachine(other)) return;
            // Access private members of the other Machine.
            const otherPriv = privMap.get(other);
            console.log("Greetings. I am Machine#" + priv.modelNo 
                + ". It is nice to meet you, Machine#" + otherPriv.modelNo);
        };
        
        return Object.freeze(instance);
    };
    
    return Object.freeze(module);
})();
```

*Note: One downside with this approach is we end up breaking an unwritten rule with classes. In our example, an object of a class can have a `public` and `private` member of the same name. Most OOP languages do not allow this.*

## Subclassing

This module is starting to look like a C# `struct`. We still have two access modifiers to go: `protected` and `protected static`. Sub-classing is very easy to implement poorly and extremely hard to implement properly. I went through a few renditions as I discovered more nuances of subclassing that I had overlooked.

We will change `Machine` here to be more simplistic, and also introduce a new `class` called `Engine`.

###### Machine.js
```javascript
const Machine = (function()
{
    const module = { };
    
    const privateMap = new WeakMap();
    module.hasInstance = function(obj)  // 'hasInstance' because its similar to 'instanceof'
    {
        return privateMap.has(obj);
    };
    
    module.new = function()              // using 'new' instead of 'createMachine' is less verbose
    {
        const instance = { };
        const priv = { };
        privateMap.set(instance, priv);
        
        instance.start = function()
        {
            console.log("Starting up the machine.");
        };
        
        return Object.freeze(instance);
    };
    
    return Object.freeze(module);
})();
```

###### Engine.js

```javascript
const Engine = (function()
{
    const module = { };
    
    const privateMap = new WeakMap();
    module.hasInstance = function(obj)
    {
        return privateMap.has(obj);
    };
    
    module.new = function(horsepower)
    {
        const instance = { };
        const priv = { };
        privateMap.set(instance, priv);
        
        instance.getHorsepower = function()
        {
            return horsepower;
        };
        
        return Object.freeze(instance);
    };
    
    return Object.freeze(module);
})();
```

An `Engine` *is* a `Machine`, but currently we have no way to model that relationship. So what can we do?

##### Attempt #1

The first idea that comes to mind is to have `Engine` call the constructor of `Machine`. But remember, we made our classes **concrete** with the addition of `Object.freeze()` inside `Machine`'s constructor.

```javascript
module.new = function(horsepower)
{
    const instance = Machine.new();     // call 'super constructor'
    const priv = { };
    privateMap.set(instance, priv);
    
    instance.getHorsepower = ...        // 'instance' is frozen, we can't add functionality.
    ...
};
```

Removing `Object.freeze()` in our constructors would violate one of the tenants we established earlier; Objects should have concrete members. The only way to enforce that is to lock down the object.

##### Attempt #2

Using the `public` constructor won't work (shown above). We will need a way to construct the object *while still having the ability to add functionality*. In a sense, a `protected` constructor!

###### Machine.js
```javascript
const Machine = (function()
{
    const module = { };
    ...
    
    const constructor = function()          // 'protected' constructor.
    {
        const instance = { };
        ...
        instance.start = function()
        {
            console.log("Starting up the machine.");
        };
        return instance;                    // Don't lock the object yet.
    };
    
    module.new = function()                 // public constructor
    {
        return Object.freeze(constructor());
    };
    
    module.extend = function()              // hand-off 'protected' constructor
    {
        return constructor;
    };
    
    return Object.freeze(module);
})();
```

It's a bit ugly, but this is a step in the right direction. Now subclasses can call `extend` to have permission to construct and expand on `Machine` objects.

*Note: Providing the constructor to subclasses like this causes another problem. Subclasses will be able to add `public` members, but they will also be able to **remove** members. This means that an subclass of `Machine` may not have a `start` method, which is an issue I have not come up with a solution for.*

###### Engine.js
```javascript
const Engine = (function()
{
    const module = { };
    ...
    
    const superConstructor = Machine.extend();
    
    module.new = function(horsepower)
    {
        const instance = superConstructor();
        ...
        
        instance.getHorsepower = function()
        {
            return horsepower;
        };
        
        return Object.freeze(instance);
    };
    
    return Object.freeze(module);
})();
```

Calling `Machine.hasInstance(...)` and `Engine.hasInstance(...)` will both result in `true`. Instances created by `Engine` are now in fact `Machine` objects. 
However there is still no sense of `protected` members or `protected static` class members. This method is still too primitive.

## Protected Static
##### (Subclassing cont.) (Attempt #3)
At this point I felt like I was missing something obvious. I thought of the superclasses' constructor and `protected static` class members as unrelated topics.

Then it hit me, subclassing is essentially three simple things:
* Access to the `protected static` members of all superclasses
* Access to the superclasses' constructor
* Access to the `public` and `protected` members of objects

Those first two **are actually the same thing** in this context. This is because *constructors are static members*. So it's not like a superclass hands you their `public` members, `protected` members, and their constructor. The constructor IS a `public`/`protected` member.
What this means is `extend` should not return the `protected` constructor of the super class. It should return the `protected static` class members which *INCLUDE* the constructor.

###### Machine.js
```javascript
const Machine = (function()
{
    const module = { };
    const privMap = new WeakMap();
    module.hasInstance = privMap.has;       // You can even perform this optimization to be less verbose.
    
    const protStatic = { };                 // protected static members of the class
    
    protStatic.new = function()             // protected constructor, now a protected static member
    {
        const instance = { };
        const priv = { };
        privMap.set(instance, priv);
        instance.start = function()
        {
            console.log("Starting up the machine.");
        };
        return instance;
    };
    
    module.new = function()
    {
        return Object.freeze(protStatic.new());
    };
    
    Object.freeze(protStatic);              // This class is now concrete. Subclasses cannot change it.
    module.extend = function()
    {
        return protStatic;                  // Provide subclasses with the protected static class member(s).
    };
    
    return Object.freeze(module);
})();
```

###### Engine.js
```javascript
const Engine = (function()
{
    const module = { };
    ...
    
    const superStaticProt = Machine.extend();   // Gain access to the protected static member(s) of the super class.
    
    module.new = function(horsepower)
    {
        const instance = superStaticProt.new(); // Call super constructor of the Machine class.
        
        instance.getHorsepower = function()     // We can implement new functionality properly.
        {
            return horsepower;
        };
        
        return Object.freeze(instance);         // Public constructors still must always freeze the object.
    };
    
    return Object.freeze(module);
})();
```

Though a bit verbose, this effectively models subclassing in a scripting language setting.

*Note: Using this approach does not allow for **multiple inheritance**. I have chosen here to model a single inheritance hierarchy.*

## Overriding

Before we complete the last *access modifier* `protected`, let's go over what further tools we have available to us.

*Overriding* is trivial to implement in a scripting language setting because of *first class function* support. To override a method, you can replace its *key* in the container object.
If you want to maintain a reference to the `super` method, you can utilize a technique called [Hooking](https://en.wikipedia.org/wiki/Hooking) which takes advantage of **closures**.

Here is an example inside the `Engine` constructor. This overrides the `start` method of the `Machine` class.

```javascript
module.new = function(horsepower)
{
    const instance = superStaticProt.new();
    ...
    
    instance.start = (function()
    {
        const superStart = instance.start;  // 'hook' onto the old 'start' function.
        return function()                   // replace 'start' with a new implementation.
        {
            console.log("Engine ready.");
            superStart();                   // You have optional access to the super method.
        };
    })();
    
    return Object.freeze(instance);
};
```

*Note: Due to JavaScript being loosely typed, there is no enforcement on the overrider method having the same parameters or return type*.

## Overloading

Now is probably a good chance to quickly mention *overloading*. Function overloading is not supported for the same reason why [Python](https://stackoverflow.com/questions/10202938/how-do-i-use-method-overloading-in-python), [Lua](http://lua-users.org/wiki/OverloadedFunctions), and [JavaScript](https://stackoverflow.com/questions/10855908/how-to-overload-functions-in-javascript) itself don't support it. There's no reason for overloaded functions because of how functions in scripting languages handle parameters. Implementing true function overloading of an object's members would be impossible in this context due to the requirement of an object's **keys** to be unique.

You can simulate function overloading using many different strategies not covered here.

## Abstract

**Abstract Classes**

An `abstract` class is one whose objects cannot be directly instantiated. We can simulate this behavior by removing the `public` constructor of the class. If you only provide a `protected` constructor for the class, it becomes effectively `abstract`.

You may be wondering: *Surely it would make sense for `abstract` classes to be able to have public constructors?* In most languages, yes. However [it's generally considered an **anti-pattern**](https://stackoverflow.com/questions/4794305/are-there-good-reasons-for-a-public-constructor-of-an-abstract-class).

**Abstract Methods**

Unfortunately I cannot think of a way to implement `abstract` object methods. The reason why it is so difficult is because of what was stated at the end of *Attempt #2* of the Subclassing section. **There is simply no way to guarantee that a subclass will override a method which we declared `abstract`**.

A pseudo-`abstract` method can be created by doing the following:

```javascript
instance.start = function()
{
    throw new Error("Abstract method cannot be called!");
};
```

There are many problems with this approach however:
* Concrete classes (not `abstract`) can define '`abstract`' methods which does not make sense.
* Concrete classes which `extend` from a class which has an `abstract` method(s) can choose not to implement it.
* Concrete classes can choose to remove the `abstract` method(s) from the mutable object before construction is complete.

I believe the solution for this is a much thicker layer of abstraction over the `public`, `private`, and `protected` containers. Even then, enforcing `abstract` methods at runtime seems too difficult simply using exception handling.

## Final

This modifier's support ends up being similar to `abstract`. The two are related from an implementation perspective.

**Final Classes**

A `final` class is one which cannot be extended by a subclass. Again, this behavior can be modeled by *controlling access to constructors*. To make a class `final`, either do not provide a `protected` constructor or choose to not implement an `extend` static member of the class.

**Final Methods**

Cannot be modeled. In order for this to be implemented, **JavaScript objects would need to support certain keys as frozen, while others are not**. The only way we implemented `const` was by making the entire object frozen via `Object.freeze()`. Subclasses need to add new functionality and thus the object cannot be frozen.
There is a conflict of interest, and therefor `final` methods are impossible to implement in the current state.

