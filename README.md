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

