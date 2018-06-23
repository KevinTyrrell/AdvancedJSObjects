# AdvancedJSObjects

Object-Oriented Programming (OOP) JavaScript library for complex objects.

rTODO: https://stackoverflow.com/questions/2822089/how-to-link-to-part-of-the-same-document-in-markdown

# Table of Contents
| Access Modifiers                          | Non Access Modifiers       | Concepts                                            |
|:-----------------------------------------:|:--------------------------:|:---------------------------------------------------:|
| [Public](#public-members)                 | [Const](#constant-members) | [Constructors](#constructors)                       |
| [Private](#private-members)               | [Extends](#subclassing)    | [Complex Data Types](#enforcing-complex-data-types) |
| [Protected](#protected-members)           | [Final](#final)            | [Overriding](#overriding)                           |
| [Public static](#private-static-members)  | [Abstract](#abstract)      | [Overloading](#overloading)                         |
| [Private static](#private-static-members) |                            | [Inner Classes](#inner-classes)                     |
| [Protected static](#protected-static)     |                            |                                                     ||


# How It Works

The goal is to implement **class-based** objects, **subtyping**, **encapsulation**, **polymorphism**, **nested classes** and **dynamic dispatch** in JavaScript. Below, I have a simple UML diagram that we're going to try to model with plain JS.

<center>![UML](https://i.imgur.com/pevWmFp.png)</center>

Though the prototyping system has its uses, it is in direct contrast to a class-based system. Due to this, the entire prototyping system won't be of any use. This includes the `new`, `public`, `private`, `protected`, `this`, `super` etc in which objects are implemented as *functions*.
Instead, we will base our entire system on *Object literals*. Here is our first 'Machine object':

```javascript
const myMachine = { };
```

## Public Members

By default, any member inside of an object literal is effectively `public`. Access to `myMachine` means having access to all `public` members inside.

```javascript
myMachine.modelNumber = 34129;
myMachine.start = function()
{
    console.log("Machine " + myMachine.modelNumber + " is starting up.");
};
```

## Constant Members

Notice that all members of `myMachine` are mutable. That's certainly a problem, after all you wouldn't want methods like `start` to be accidentally removed from `myMachine`. There's no support for defining certain keys in an object as `const`. The API function `Object.freeze()` prevents keys of an object from being added, removed, or mutated. Once frozen, an object can never be unfrozen.

```javascript
myMachine = Object.freeze({ });
myMachine.start = ... // 'myMachine' cannot be modified.
```

**Concrete** is a word often used to describe objects. Think about it like pouring actual concrete. While pouring the concrete, you can mutate what you are building, but once the concrete sets (in this case, freezes), the member(s) that are defined are guaranteed to remain there; which is exactly what we want.

```javascript
const myMachine = (function()
{
    const obj = { };
    
    const modelNo = 34129;
    obj.modelNumber = function()
    {
        return modelNo;
    };
    
    let state = false;
    myMachine.setState = function(newState)
    {
        state = newState;
    };
    
    myMachine.getState = function()
    {
        return state;
    };
    
    return Object.freeze(obj);
})();
```

Both data elements have been abstracted away behind closures and can only be interacted with accessors and mutators. This combined with freezing the object allows us to have mutable and immutable members and ensure the object is concrete.

<center>![Frozen](https://i.imgur.com/FCtsLqi.png)</center>
<center>*Object.freeze() in action.*</center>


Once we are done adding elements to the object, we can lock it with `Object.freeze()`, truly making `modelNo` `const` while leaving `state` mutable. You may think `modelNo` and `state` are `private` members, but that is not completely true. I will cover why later on.

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
        
        machine.modelNumber = function()
        {
            return modelNo;
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
const Machine = (function()
{
    const module = { };
    const machines = new Set();
    
    module.createMachine = function()
    {
        const machine = { };
        ...
        machines.add(machine);
        return Object.freeze(machine);
    };
    
    module.isMachine = function(obj)
    {
        return machines.has(obj);
    };
    
    return Object.freeze(module);
})();

const machine = Machine.createMachine();
const clone = Object.assign({ }, machine);

console.log(Machine.isMachine(machine));    // true
console.log(Machine.isMachine(clone));      // false
```

With this approach, we can use `typeof` and the modules to enforce complex data types.

*Note: A `Set` or Object literal would maintain a **hard link** to all `Machine` objects, preventing objects from being deconstructed. A `WeakSet` should be used instead.*

## Private Static Members

Inside the `Machine` module, we've actually already defined `public static` and `private static` members.
`createMachine` is a `public static` function and `machines` is a `private static` object.

```javascript
const Machine = (function()
{
    const module = { };
    const machines = new WeakSet();
    module.isMachine = function(obj)
    {
        return machines.has(obj);
    };
    
    let nextModel = 23444; // private static
    
    module.createMachine = function()
    {
        const machine = { };
        machines.add(machine);
        
        const modelNo = nextModel++;
        machine.modelNumber = function()
        {
            return modelNo;
        };
        
        return Object.freeze(machine);
    };
    
    return Object.freeze(module);
})();
```

`nextModel` here is a `private static` member of `Machine`, as it cannot be accessed outside of `Machine`.

## Private Members

It may be tempting to think of `modelNo` as a `private` member of `Machine` objects. After all, it cannot be accessed outside of the class (*module*). However it's actually a *local* variable and is missing a key component of true `private` members.
Recall that while inside of a class, objects of that class should have access to all `public`, `private`, and `protected` members of another object of that same class. Here's some Java code to explain what I mean.

```java
public class Machine
{
    private int modelNo;
    ...
    
    public void greet(Machine other)
    {
        System.out.println("I am Machine#" + modelNo
            + ", it is nice to meet you Machine#" + other.modelNo);
    }
}
```

But here's what that looks like in our `Machine` class.

```javascript
module.createMachine = function()
{
    const machine = { };
    
    const modelNo = ...;
    
    machine.greet = function(other)
    {
        if (!isMachine(other)) return;
        
        console.log("I am Machine#" + modelNo
            + ", it is nice to meet you, Machine#" + other.modelNo); // undefined
    };
};
```

If you define a variable inside of a closure like this, it's local within that closure; unable to be shared across the class.

Somehow, we need to allow `Machine` objects inside the class to have visibility of `private` members of other `Machine` objects.

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
            console.log("I am Machine#" + modelNo
                + ", it is nice to meet you, Machine#" + other.modelNo);
        };
        
        return Object.freeze(instance);
    };
    
    return Object.freeze(module);
})();
```

*Note: Due to us having a container for each access modifier, we end up allowing multiple members of the same identifier. An object can have three members named `x`, one `public`, `private`, and `protected` respectively. I'm not sure if there's a way to avoid this.*

## Subclassing

We're about half way there in terms of implemented functionality. We have two access modifiers to go: `protected` and `protected static`. Sub-classing is very easy to implement poorly and extremely hard to implement properly. I went through a few renditions as I discovered more nuances of subclassing that I had overlooked.

We will change `Machine` here to be more simplistic, and also introduce a new `class` called `Engine`.

###### Machine.js
```javascript
const Machine = (function()
{
    const module = { };
    
    const privateMap = new WeakMap();
    module.hasInstance = function(obj)      // 'hasInstance' because it is similar to 'instanceof'
    {
        return privateMap.has(obj);
    };
    
    module.new = function()                 // using 'new' instead of 'createMachine' is less verbose
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

An `Engine` *is* a `Machine`, but currently we have no way to model that relationship.

##### Attempt #1

The first thought that comes to mind to implement sublclassing is to have `Engine` call the constructor of `Machine`. But remember, we made our objects **concrete** with the addition of `Object.freeze()` inside `Machine`'s constructor.

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

Using the `public` constructor won't work (shown above). We will need a way to construct the object *while still having the ability to add functionality*. What if we have two constructors, a `public` one which locks the object and another one which leaves the objects mutable?

###### Machine.js
```javascript
const Machine = (function()
{
    const module = { };
    ...
    
    const constructor = function()          // Constructor to give to subclasses
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
    
    module.extend = function()              // hand-off constructor to subclass
    {
        return constructor;
    };
    
    return Object.freeze(module);
})();
```

It's a bit ugly but this is a step in the right direction. Now subclasses can call `extend` to have permission to construct and expand on `Machine` objects.

*Note: Passing a constructor which creates *mutable* objects means a subclass could violate the **concrete** members of the superclass. `Engine` could outright remove the `start` method for example. This is an issue that I'm not sure if there's an easy solution to. Either you allow a subclass to add AND remove functionality or you don't allow any mutations whatsoever.*

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

Calling `Machine.hasInstance(...)` and `Engine.hasInstance(...)` will both return `true` for objects returned by `Engine.new`. Instances created by `Engine` are now in fact `Machine` objects. 
However there is still no sense of `protected` members or `protected static` class members. This implementation is still too primitive.

## Protected Static
##### (Subclassing cont.) (Attempt #3)
At the most fundamental level, what happens in high level languages when you create a new class which extends another class? What could take place behind the scenes? Surely it's not as simple as just passing a constructor to the subclass.

After enough thought, I could really only think of three things that take place when subclassing:
* Access to the `protected static` members of all superclasses
* Access to the superclasses' constructor
* Access to the `protected` members of objects

How could the `extend()` function we are designing implement those three things in a nice manner?

Well, if you think about it, the first and second points *are part of the same thing*. Constructors *are* `static` members of a class. So if you have a special constructor only for subclasses, that's just a `protected static` member.

`Protected static` fields [are often considered to be an anti-pattern](https://stackoverflow.com/questions/24289070/why-we-should-not-use-protected-static-in-java), but they will be what `extend()` returns.

###### Machine.js
```javascript
const Machine = (function()
{
    const module = { };
    const privMap = new WeakMap();
    module.hasInstance = privMap.has;       // Less verbose version.
    
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
    
    Object.freeze(protStatic);              // Only concrete classes can be extended.
    module.extend = function()
    {
        return protStatic;                  // Hand off protected static members to subclasses.
    };
    
    return Object.freeze(module);
})();
```

###### Engine.js
```javascript
const Engine = (function()
{
    const module = { };
    const privMap = new WeakMap();
    module.hasInstance = privMap.has;
    
    const superProtStatic = Machine.extend();   // Protected static members of the superclass.
    
    module.new = function(horsepower)
    {
        const instance = superStaticProt.new(); // Call super constructor.
        privMap.set(instance, { });
        
        instance.getHorsepower = function()     // Instance is not frozen, can add functionality.
        {
            return horsepower;
        };
        
        return Object.freeze(instance);
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

You may be wondering: *But I thought abstract classes can have public constructors?* In most languages, yes. However [it's generally considered an **anti-pattern**](https://stackoverflow.com/questions/4794305/are-there-good-reasons-for-a-public-constructor-of-an-abstract-class).

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

