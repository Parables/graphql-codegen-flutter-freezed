@name TypeFieldName

@description A compact string of patterns used in the config for granular configuration for each Graphql Type and/or its fieldNames

The string can contain more than one pattern, each pattern ends with a semi-colon (`;`).

A dot (`.`) separates the TypeName from the FieldNames in each pattern

To apply an option to all Graphql Types or fields, use the anyTypeName (`@*TypeNames`) and anyFieldName (`@*FieldNames`) tokens respectively

To specify more than one TypeName or FieldName, use (`[]`) to specify what should be included and (`-[]`) for what should be excluded

Manually typing out a pattern may be prone to typos and invalid patterns therefore the [`TypeFieldName`]() class exposes some builder methods which you can use in your plugin config file.

Wherever a builder method accepts parameter with a type signature of [`TypeNames`]() or [`FieldNames`](), you can use any of the following:

1.  a single string. E.g: `'Droid'`

    ```ts
    const typeFieldName = TypeFieldName.buildTypeName('Droid');
    console.log(typeFieldName); // "Droid;"
    ```

2.  a comma-separated string for multiple types/fields. E.g: `'Droid, Starship, Human'`

    > The rest of this guide uses this approach wherever a builder method accepts a parameter with a type signature of [`TypeNames`]() or [`FieldNames`]()

    ```ts
    const typeFieldName = TypeFieldName.buildTypeName('Droid, Starship, Human');
    console.log(typeFieldName); // "Droid;Starship;Human;"
    ```

3.  an array of strings. E.g: `['Droid', 'Starship']`

    ```ts
    const typeFieldName = TypeFieldName.buildTypeName(['Droid', 'Starship', 'Human']);
    console.log(typeFieldName); // "Droid;Starship;Human;"
    ```

4.  a single TypeName or FieldName. E.g: `TypeName.fromString('Droid')`

    ```ts
    const typeName = TypeName.fromString('Droid');
    const typeFieldName = TypeFieldName.buildTypeName(typeName);
    console.log(typeFieldName); // "Droid;"
    ```

5.  an array of TypeName or FieldName. E.g: `[TypeName.fromString('Droid'), [TypeName.fromString('Starship')]]`

    ```ts
    const Droid = TypeName.fromString('Droid');
    const Starship = TypeName.fromString('Starship');
    const Human = TypeName.fromString('Human');

    const typeFieldName = TypeFieldName.buildTypeName([Droid, Starship, Human]);
    console.log(typeFieldName); // "Droid;Starship;Human;"
    ```

@exampleMarkdown

## Usage for Graphql Types

### Configuring multiple Graphql Types

You can explicitly list out the names of the Graphql Types that you want to configure.

```ts
const typeFieldName = TypeFieldName.buildTypeName('Droid, Starship, Human');
console.log(typeFieldName); // "Droid;Starship;Human;"
```

### Configuring all Graphql Type

Instead of manually listing out **all** the types in the Graphql Schema, use the anyTypeName (`@*TypeNames`) to configure all the Graphql Types in the Schema

```ts
const typeFieldName = TypeFieldName.buildAnyTypeName(); // TODO: Create this builder
console.log(typeFieldName); // "@*TypeNames';
```

### Configuring all Graphql Types Except Some Types

This would apply the configuration to all GraphQL Types except those specified.

In the example below, the configuration will be applied to all the Graphql Types in the Schema except the `Droid` and `Starship` Graphql Types

```ts
let typeFieldName = TypeFieldName.buildAnyTypeNameExceptTypeNames('Droid, Starship');
console.log(typeFieldName); // "@*TypeNames-['Droid,Starship]';"
```

## Usage for fields of Graphql Types

For each of the 3 builder methods available above for configuring Graphql Types, there is also similar builder methods for configuring the **specific fields** or **all fields** that belong to the Graphql Type

### Configuring fields of a Graphql Type

You can explicitly list out the names of the fields of the Graphql Types that you want to configure.

```ts
const typeFieldName = TypeFieldName.buildFieldNamesOfTypeName('Droid', 'id, name, friends');
console.log(typeFieldName); // "Droid.[id,name,friends];"
```

### Configuring any fields of a Graphql Type

Instead of manually listing out **all the fields** of the Graphql Type, use this to configure ll the fields of the Graphql Type.

```ts
const typeFieldName = TypeFieldName.buildAnyFieldNameOfTypeName('Droid');
console.log(typeFieldName); // "Droid.@*FieldNames;"
```

### Configuring fields of ll Graphql Type

When you use the ll TypeName (`@*TypeNames`), you can specify the fields to be configured. If field name that doesn't exists, it would be ignored.

The example below configures the `id` and `name` fields of ll TypeName (`@*TypeNames`)

```ts
let typeFieldName = TypeFieldName.buildFieldNamesOfAnyTypeName('id, name');
console.log(typeFieldName); // "@*TypeNames.[id,name];"
```

### Configuring ll fields of ll Graphql Type

You can also configure ll fields (`@*FieldNames`) of ll TypeNames (`@*TypeNames`)

```ts
let typeFieldName = TypeFieldName.buildAnyFieldNameOfAnyTypeName();
console.log(typeFieldName); // "@*TypeNames.@*FieldNames;"
```

### Configuring any/all fields except fieldNames of any/all Graphql Type

When you use the any/all TypeName (`@*TypeNames`), you can specify the fields to be configured. If field name that doesn't exists, it would be ignored.

The example below configures the `id` and `name` fields of any/all TypeName (`@*TypeNames`)

```ts
let typeFieldName = TypeFieldName.buildFieldNamesOfAnyTypeName('id, name');
console.log(typeFieldName); // "@*TypeNames.[id,name];"
```

### Configuring any/all fields of any/all TypeName

You can also configure any/all fields (`@*FieldNames`) of any/all TypeNames (`@*TypeNames`)

```ts
let typeFieldName = TypeFieldName.buildAnyFieldNameOfAnyTypeName();
console.log(typeFieldName); // "@*TypeNames.@*FieldNames;"
```

TODO: Update the following documentation

### Configuring the fields of GraphQL Types

```ts
let typeFieldName1 = 'Droid.[id,friends]'; // in an array, specify one or more fields for that GraphQL Type. This example applies on the `id` and `friends` fields of the Droid GraphQL Type

let typeFieldName2 = 'Droid.[id,friends]; Starship.[id]; @*TypeNames.[id];'; // same as `typeFieldName1` but for multiple patterns

let typeFieldName3 = 'Droid.@*FieldNames'; // applies on all fields of the Droid GraphQL Type

let typeFieldName4 = 'Droid.@*FieldNames-[name,appearsIn]'; // if there are many fields to be specified, use this to specify those to be*excluded**. This example applies on all of the fields of the Droid GraphQL Type except the `name` and `appearsIn` fields

let typeFieldName5 = '@*TypeNames.[id]'; // applies on the `id` field of any GraphQL Types

let typeFieldName6 = '@*TypeNames-[Human,Starship].[id]'; // applies on the `id` field of any GraphQL Types except the `Human` and `Starship` types

let typeFieldName7 = '@*TypeNames.@*FieldNames'; // applies on all of the fields of the GraphQL Types

let typeFieldName8 = '@*TypeNames-[Human,Starship].@*FieldNames'; // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types

let typeFieldName9 = '@*TypeNames.@*FieldNames-[id,name]'; // applies on all of the fields of the GraphQL Types except the `id` and `name` fields

let typeFieldName10 = '@*TypeNames-[Human,Movie].@*FieldNames-[id,name]'; // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types and the `id` and `name` fields
```

/

## Usage:

```ts filename='codegen.ts'
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // ...
  generates: {
    'lib/data/models/app_models.dart': {
      plugins: {
        'flutter-freezed': {
          // ...
          fromJsonWithMultiConstructors: [
            [
              'SearchResult', // <-- unionTypeName
              'namedConstructor', // <-- unionKey
              'FreezedUnionCase.pascal', // <-- unionValueCase
              {
                // <-- unionValuesNameMap
                Droid: 'special droid',
                Human: 'astronaut',
                Starship: 'space_Shuttle',
              },
            ],
          ],
        },
      },
    },
  },
};
export default config;
```
