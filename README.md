# ember-modify-based-class-resource

If you find this repo, please read: [this issue](https://github.com/NullVoxPopuli/ember-resources/issues/1054) which talks about the `modify` method pattern, and why it should be avoided.

This repo's functionality is built on public APIs, and should be able to be supported for as long as the underlying APIs exist.

## Compatibility

* [ember-source][gh-ember-source] v3.28+
* [typescript][gh-typescript] v4.8+
* [ember-auto-import][gh-ember-auto-import] v2+
* [Glint][gh-glint] v1.0.0-beta.3+

[gh-glint]: https://github.com/typed-ember/glint/
[gh-ember-auto-import]: https://github.com/ef4/ember-auto-import
[gh-ember-source]: https://github.com/emberjs/ember.js/
[gh-typescript]: https://github.com/Microsoft/TypeScript/releases

## Installation

```bash
npm install ember-modify-based-class-resource
```

Or if you want to use `main` (unstable) from git, you can use this in your package.json:

```
"ember-modify-based-class-resource": "github:NullVoxPopuli/ember-modify-based-class-resource#dist"
```
Which comes from [this branch][self-dist] from [this automation][self-dist-ci]

[self-dist]: https://github.com/NullVoxPopuli/ember-modify-based-class-resource/tree/dist
[self-dist-ci]: https://github.com/NullVoxPopuli/ember-modify-based-class-resource/blob/main/.github/workflows/push-dist.yml

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).


## Usage

> [!NOTE]:
> These docs were moved from the old location in [ember-resources](https://github.com/NullVoxPopuli/ember-resources/blob/main/DOCS.md) as ember-resources (for a long time now) does not recommend class-based resources, as classes can be used ergonomically with function-based resources.

- [class-based Resources](#class-based-resources)
    - [Lifecycle](#lifecycles-with-resource-1)
    - [Reactivity](#reactivity-1)
    - [Example: Clock](#example-class-based-clock): Managing own state
    - [Example: `fetch`](#example-class-based-fetch): Async + lifecycle


There are different abstractions to working with resources,
each with their own set of tradeoffs and capabilities
-- but ultimately are both summarized as "helpers with optional state and optional cleanup".

|    | class-based [`Resource`][docs-class-resource] | function-based [`resource`][docs-function-resource] |
| -- | ---------------------- | ------------------------- |
| supports direct invocation in [`<templates>`][rfc-779] | yes | yes |
| supports [Glint][gh-glint] | soon | soon |
| provides a value | the instance of the class is the value[^1] | can represent a primitive value or complex object[^2] |
| can be invoked with arguments | yes, received via `modify`[^3] hook | only when wrapped with a function. changes to arguments will cause the resource to teardown and re-run |
| persisted state across argument changes | yes | no, but it's possible[^4] |
| can be used in the body of a class component | yes | yes |
| can be used in template-only components | yes[^5] | yes[^5] |
| requires decorator usage (`@use`) | `@use` optional | `@use` optional[^6] |
| aligns with the derived data reactivity philosophy | no[^7] | yes |


[rfc-779]: https://github.com/emberjs/rfcs/pull/779
[gh-glint]: https://github.com/typed-ember/glint
[gh-ember-modifier]: https://github.com/ember-modifier/ember-modifier

[docs-class-resource]: https://ember-resources.pages.dev/classes/core.Resource
[docs-function-resource]: https://ember-resources.pages.dev/modules/util_function_resource#resource

[mdn-weakmap]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

[^1]: class-based resources _cannot_ be a single primitive value. APIs for support for this have been explored in the past, but it proved unergonomic and fine-grained reactivity _per accessed property_ (when an object was desired for "the value") was not possible.
[^2]: there are alternate ways to shape a function-resource depending on the behavior you want. These shapes and use cases are covered in the [function-based Resources](#function-based-resources).
[^3]: this is the same API / behavior as class-based modifiers in [ember-modifier][gh-ember-modifier].
[^4]: persisting state across argument changes with function-based resources might require a [`WeakMap`][mdn-weakmap] and some stable object to reference as the key for the storage within that `WeakMap`.
[^5]: for `.hbs` files the resources will need to be globally available via `export default`s from the `app/helpers` directory.
[^6]: without `@use`, the function-based resource must represent a non-primitive value or object.
[^7]: As-is, the modify hook we have right now in the class-based resource (and in modifiers) is used as a backdoor to an effect. See [this information](https://github.com/NullVoxPopuli/ember-resources/issues/1054) for alternate paths.


### class-based resources

[🔝 back to top](#authoring-resources)

Class-based resources are a way for object-oriented encapsulation of state,
giving access to the application container / owner for service injection,
and/or persistint state across argument changes.


Though, maybe a more pragmatic approach to the difference:

_Class-based resources can be invoked with args_.
Function-based resources must be wrapped in another function to accept args.

#### Lifecycles with `Resource`

There is only one lifecycle hook, `modify`, to encourage data-derivation (via getters) and
generally simpler state-management than you'd otherwise see with with additional lifecycle methods.

For example, this is how you'd handle initial setup, updates, and teardown with a `Resource`

```js
import { Resource } from 'ember-resources';
import { registerDestructor } from '@ember/destroyable';

class MyResource extends Resource {
  // constructor only needed if teardown is needed
  constructor(owner) {
    super(owner);

    registerDestructor(this, () => {
      // final teardown, if needed
    });
  }

  modify(positional, named) {
    // initial setup, updates, etc
  }
}
```
Many times, however, you may not even need to worry about destruction,
which is partially what makes opting in to having a "destructor" so fun --
you get to choose how much lifecycle your `Resource` has.

More info: [`@ember/destroyable`](https://api.emberjs.com/ember/release/modules/@ember%2Fdestroyable)

#### Reactivity

class-based Resources have lazy, usage-based reactivity based on whatever is accessed in the `modify` hook.

For example, consider a resource that doubles a number (this is over engineered, and you wouldn't want a Resource for doubling a number)

```js
import { tracked } from '@glimmer/tracking';
// import { Resource } from 'ember-resources'; // in V5
import { Resource } from 'ember-resources';

class Doubler extends Resource {
  @tracked result = NaN;

  modify([num]) {
    this.result = num * 2;
  }
}

class {
  @tracked num = 2;

  doubler = Doubler.from(() => [this.num]);
}
```

When accessed, the value of `doubler.result` will be `4`.
Any time `this.num` changes, the value of `doubler.result` will be `8`.

This happens lazily, so if `doubler.result` is not accessed,
the Resource is not evaluated and no computation efforts are done.

Accessing can be done anywhere at any time, in JS, or in a Template (it's the same).

A class-based Resource can define its own state anywhere, but has the same stipulations
as the function-based Resource: inside the `modify` hook, you may not access a tracked
property that is later written to. This causes an infinte loop while the framework tries to resolve what the stable "value" should be.

See the `Clock` example below for more details.

#### Example: class-based Clock

Given the complete example of a `clock` above implemented in a function-based resource,
A complete implementation, as a class-based resource could look similar to this:

```js
// import { Resource } from 'ember-resources'; // in V5
import { Resource } from 'ember-resources'
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';

class Clock extends Resource {
  @tracked current = new Date();

  constructor(owner) {
    super(owner);

    let interval = setInterval(() => (this.current = new Date()), 1_000);

    registerDestructor(this, () => clearInterval(interval));
  }

  get formatted() {
    return this.formatter.format(this.current);
  }

  modify([locale = 'en-US']) {
    this.formatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
  }
}
```

Resulting usage would look something like this:

```hbs
{{get (Clock 'en-GB') 'formatted'}}
```

Or if you needed the value in JS
```js
class {
  clock = Clock.from(this, () => ['en-GB']);

  get now() {
    return this.clock.formatted;
  }
}
```

#### Example: class-based Fetch

[🔝 back to top](#authoring-resources)

See: Cookbook entry, [`fetch` with `AbortController`](https://github.com/NullVoxPopuli/ember-resources/blob/main/docs/docs/cookbook/fetch-with-AbortController.md#using-resource)
