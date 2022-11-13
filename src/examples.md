@name toJson
@description The name aof a function that will be used to converting toJson.
The function has to be created or imported..
We can declare the function that throws an UnimplementedError
@see [Custom types and custom encoding]{@link https://github.com/google/json_serializable.dart/tree/master/json_serializable#custom-types-and-custom-encoding}
@default undefined
@param key a comma-separated string of fieldNames
@param value.functionName the name of the function
@param value.className the name of the convertor class. Has a higher precedence over the functionName
@param value.appliesOn when this option on specific blocks. Defaults to ['parameter]

@exampleMarkdown

## usage

```ts filename="codegen.ts"
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // ...
  generates: {
    'lib/data/models/app_models.dart': {
      plugins: {
        'flutter-freezed': {
          option: {
            // Syntax 1: using `functionName` => `${functionName}FromJson` && `${functionName}ToJson`
            fromJsonToJson: {
              'createAt, updatedAt': {
                functionName: 'timestamp',
              },
            },
            // Syntax 2: suing `className`
            fromJsonToJson: {
              'createAt, updatedAt': {
                className: 'TimestampConvertor<DateTime, int>',
              },
            },
            // Syntax 2: suing `className`
            fromJsonToJson: {
              'createAt, updatedAt': 'TimestampConvertor<DateTime, int>',
            },
            // ...
          },
        },
      },
    },
  },
};
export default config;
```

### Syntax 1: using `functionName`

This will declare a function with a name `timestampToJson` that will an throw `Unimplemented Function Error`. You will need to implement the function manually.

```dart filename="app_models.dart"
dynamic timestampFromJson(dynamic val) {
throw Exception("You must implement `timestampToJson` function in `app_models.dart`");
}

dynamic timestampToJson(dynamic val) {
throw Exception("You must implement `timestampToJson` function in `app_models.dart`");
}
```

### Syntax 2 & 3: suing `className`

Like the `functionName`, this will rather place the functions as method in a class using the name given.

- This provides a better abstraction than the global functions. That's why `className` has a higher precedence than `functionName`

```dart filename="app_models.dart"
class TimestampConvertor implements JsonConverter<DateTime, int> {
    const TimestampConvertor();

    @override
    DateTime fromJson(int json){
        throw Exception("You must implement `TimestampConvertor.fromJson` method in `app_models.dart`");
    }

    @override
    int toJson(DateTime object){
        throw Exception("You must implement `TimestampConvertor.toJson` method in `app_models.dart`");
    }
}
```
