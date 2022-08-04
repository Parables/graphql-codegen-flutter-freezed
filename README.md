# graphql-codegen-flutter-freezed

This is a stand-alone package based on the [`flutter-freezed`](https://github.com/Parables/graphql-code-generator/tree/flutter-freezed) plugin to generate Freezed from your GraphQL schema.

> Dart is awesome, but defining a "model" can be tedious. We may have to:
>
> - define a constructor + the properties
> - override toString, operator ==, hashCode
> - implement a copyWith method to clone the object
> - handling de/serialization
>
>On top of that, Dart is also missing features such as union types and pattern-matching.
>
> Implementing all of this can take hundreds of lines, which are error-prone and the readability of your model significantly.
>
> Freezed tries to fix that by implementing most of this for you, allowing you to focus on the definition of your model.
> <https://pub.dev/packages/freezed>

Creating these models by hand becomes even more complex when you are working with a GraphQL server that can handle nested mutations.

See this [GraphQL Playground](https://idel-lumen-api.herokuapp.com/graphql) and ask yourself, how would I create a model to handle the data returned by this nested mutation below?

> Please change the address in the playground to use `https` instead of ~~`http`~~

```gql
# Write your query or mutation here
mutation createProgramme{
  createProgramme(input: {
    title: "GraphQL + Flutter",
    programmeCode: "graphql-dart-flutter-101",
    startLevel: 100,
    endLevel: 100,
    programmeOutlines: {
      create: {
        level: 100,
        course: {
          create:{
            title: "Flutter Freezed",
            courseCode: "CS-FF-101",
            books: {
              create:{
                title: "GraphQL is way awesome",
                author: "Parables Boltnoel"
              }
            }
          }
        }
      }
    }
  }){
    id
    title
    programmeCode
    programmeOutlines{
      level
      course{
        books{
          id
          title
          author
        }
      }
    }
  }
}
```

Fortunately enough, GraphQL is strongly typed, and so is Dart.
Save yourself from implementing a model to match your strongly typed GraphQL operations, and let Freezed handle the work while you chill with this `flutter-freezed`plugin

Currently supports the following features

## Features

Currently, the plugin  supports the following features

- [x] Generate Freezed classes for ObjectTypes
- [x] Generate Freezed classes for InputTypes
- [x] Support for EnumsTypes
- [x] Support for custom ScalarTypes
- [x] Support freeze documentation of class & properties from GraphQL SDL description comments
- [x] Ignore/don't generate freezed classes for certain ObjectTypes
- [x] Support directives
- [x] Support deprecation annotation
- [] Support for InterfaceTypes
- [x] Support for UnionTypes [union/sealed classes](https://pub.dev/packages/freezed#unionssealed-classes)
- [x] Merge InputTypes with ObjectType as union/sealed class [union/sealed classes](https://pub.dev/packages/freezed#unionssealed-classes)

## TODO

- [ ] Support Queries, Mutations, and Subscription: make it way easier to use GraphQL in flutter without going through any complex process. Inspired by [KitQL](https://www.kitql.dev/)

## Installation

```bash
npm install -g graphql-codegen-flutter-freezed
```

## Usage

In your Flutter project root, create a `codegen.yml` file.

This file is allows you to configure the generator.

```yml
overwrite: true
schema: './lib/data/graphql/schema.graphql'
generates:
  lib/data/models/app_models.dart:
    plugins:
      - typescript
      - flutter-freezed

```

Then simply run

```bash

```

```dart
```

## Config API Docs  

## FAQ  

## Changelog  

  Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.  

## Testing  

  ``` bash
  yarn test
  ```

## Security  

  If you discover any security related issues, please email parables95@gmail.com instead of using the issue tracker.  

## Contributing  

  Please see [CONTRIBUTING](CONTRIBUTING.md) for details.  

## Credits  

- [Parables Boltnoel](https://github.com/parables)  

- [All Contributors](../../contributors)  

## License  

  The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Enjoy 🍻
