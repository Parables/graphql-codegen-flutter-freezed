@name TypeFieldName

@description A compact string of patterns used in the config for granular configuration for each Graphql Type and/or its fieldNames

The string can contain more than one pattern, each pattern ends with a semi-colon (`;`).

A dot (`.`) separates the TypeName from the FieldNames in each pattern

To apply an option to all Graphql Types or fields, use the allTypeNames (`@*TypeNames`) and allFieldNames (`@*FieldNames`) tokens respectively

Wherever you use the allTypeNames and the allFieldNames, know very well that you can make some exceptions. After all, to every rule, there is an exception

A **square bracket** (`[]`) is used to specify what should be included and a **negated square bracket** (`-[]`) is used to specify what should be excluded

Manually typing out a pattern may be prone to typos and invalid patterns therefore the [`TypeFieldName`]() class exports some builder methods which you can use in your plugin config file.

The patterns themselves are readable and easy to manually type it out in the config but its RECOMMENDED that you the builder methods. However, along with builder methods, the [`TypeFieldName`]() class also exports the Regular Expression(RegExp) used to test the patterns for a match as well as matcher methods. You can use these to find out if you manually typed out patterns would work with this plugin.

Wherever a builder method accepts parameter with a type signature of [`TypeNames`]() or [`FieldNames`](), you can use any of the following:

1. a single string. E.g: `'Droid'`

   ```ts
   const typeFieldName = TypeFieldName.buildTypeNames('Droid');
   console.log(typeFieldName); // "Droid;"
   ```

2. a comma-separated string for multiple types/fields. E.g: `'Droid, Starship, Human'`

   > The rest of this guide uses this approach wherever a builder method accepts a parameter with a type signature of [`TypeNames`]() or [`FieldNames`]()

   ```ts
   const typeFieldName = TypeFieldName.buildTypeNames('Droid, Starship, Human');
   console.log(typeFieldName); // "Droid;Starship;Human;"
   ```

3. an array of strings. E.g: `['Droid', 'Starship']`

   ```ts
   const typeFieldName = TypeFieldName.buildTypeNames(['Droid', 'Starship', 'Human']);
   console.log(typeFieldName); // "Droid;Starship;Human;"
   ```

4. a single TypeName or FieldName. E.g: `TypeName.fromString('Droid')`

   ```ts
   const typeName = TypeName.fromString('Droid');
   const typeFieldName = TypeFieldName.buildTypeNames(typeName);
   console.log(typeFieldName); // "Droid;"
   ```

5. an array of TypeName or FieldName. E.g: `[TypeName.fromString('Droid'), [TypeName.fromString('Starship')]]`

   ```ts
   const Droid = TypeName.fromString('Droid');
   const Starship = TypeName.fromString('Starship');
   const Human = TypeName.fromString('Human');

   const typeFieldName = TypeFieldName.buildTypeNames([Droid, Starship, Human]);
   console.log(typeFieldName); // "Droid;Starship;Human;"
   ```

@exampleMarkdown

## Usage for Graphql Types

### Configuring specific Graphql Types

You can explicitly list out the names of the Graphql Types that you want to configure.

```ts
const typeFieldName = TypeFieldName.buildTypeNames('Droid, Starship');
console.log(typeFieldName); // "Droid;Starship;"
```

### Configuring all Graphql Types

Instead of manually listing out **all** the types in the Graphql Schema, use the allTypeNames (`@*TypeNames`) to configure all the Graphql Types in the Schema

```ts
const typeFieldName = TypeFieldName.buildAllTypeNames(); // TODO: Create this builder
console.log(typeFieldName); // "@*TypeNames';
```

### Configuring all Graphql Types except those specified

You can configure all GraphQL Types except those specified.

The example below configures all the Graphql Types in the Schema except the `Droid` and `Starship` Graphql Types

```ts
let typeFieldName = TypeFieldName.buildAllTypeNamesexceptTypeNames('Droid, Starship');
console.log(typeFieldName); // "@*TypeNames-['Droid,Starship]';"
```

## Usage for fields of Graphql Types

### Configuring specific fields of a specific Graphql Type

You can explicitly list out the names of the fields of the Graphql Types that you want to configure.

```ts
const typeFieldName = TypeFieldName.buildFieldNamesOfTypeName([
  ['Droid', 'id,name,friends'],
  ['Human', 'id,name,title'],
  ['Starship', 'name,length'],
]);
console.log(typeFieldName); // "Droid.[id,name,friends];Human.[id,name,title];Starship.[name,length];"
```

### Configuring all fields of a specific Graphql Type

Instead of manually listing out **all the fields** of the Graphql Type, use the allFieldNames (`@*FieldNames`) to configure all the fields of the Graphql Type.

```ts
const typeFieldName = TypeFieldName.buildAllFieldNamesOfTypeName('Droid');
console.log(typeFieldName); // "Droid.@*FieldNames;Movie.@*FieldNames"
```

### Configuring all fields except some fields of a Graphql Type

In the example below, the `id` and the `name` fields will be exceptd from the configuration while all the remaining fields of the `Droid` Graphql Type will be configured

```ts
const typeFieldName = TypeFieldName.buildAllFieldNamesexceptFieldNamesOfTypeName('Droid', 'id, name');
console.log(typeFieldName); // "Droid.@*FieldNames-[id,name];"
```

### Configuring some fields of all Graphql Types

When you use the allTypeNames (`@*TypeNames`), you can specify the fields to be configured. If field name that doesn't exists for a given Graphql Type, it would simply be ignored.

The example below configures the `id` and `name` fields of all Graphql Types

```ts
let typeFieldName = TypeFieldName.buildFieldNamesOfAllTypeNames('id, name');
console.log(typeFieldName); // "@*TypeNames.[id,name];"
```

### Configuring all fields of all Graphql Types

Using the allFieldNames (`@*FieldNames`) on the allTypeNames (`@*TypeNames`), you can configure all fields of all the Graphql Types in the Schema

```ts
let typeFieldName = TypeFieldName.buildAllFieldNamesOfAllTypeNames();
console.log(typeFieldName); // "@*TypeNames.@*FieldNames;"
```

### Configuring all fields except some fields of all Graphql Types

As always, you can make some exception when you use the allFieldNames (`@*FieldNames`) to except some fields from the configuration.

In the example below, the `id` and the `name` fields will be exceptd from the configuration while all the remaining fields of all Graphql Type will be configured

```ts
let typeFieldName = TypeFieldName.buildAllFieldNamesexceptFieldNamesOfAllTypeNames('id, name');
console.log(typeFieldName); // "@*TypeNames.@*FieldNames-[id,name];"
```

### Configuring some fields of all Graphql Types excepts some Types

In the example below, the `id` and `name` fields will be configured for all the Graphql Types in the Schema except`Droid` and `Starship`

```ts
let typeFieldName = TypeFieldName.buildFieldNamesOfAllTypeNamesexceptTypeNames('Droid, Starship', 'id, name');
console.log(typeFieldName); // "@*TypeNames-[Droid,Starship].[id,name];"
```

### Configuring all fields of all Graphql Types except some Types

In the example below, all fields of all Graphql Types in the Schema except for the fields of `Droid` and `Starship` will be exceptd from the configuration while all the remaining fields of all Graphql Type will be configured

```ts
let typeFieldName = TypeFieldName.buildAllFieldNamesOfAllTypeNamesexceptTypeNames('Droid Starship', 'id, name');
console.log(typeFieldName); // "@*TypeNames-[Droid,Starship].@*FieldNames;"
```

### Configuring all fields except some fields of all Graphql Types except some Types

In the example below, the `id` and the `name` fields of `Droid` or `Starship` will be exceptd from the configuration while all the **remaining fields** of all Graphql Types(including `Droid` and `Starship`) will be configured

```ts
let typeFieldName = TypeFieldName.buildAllFieldNamesexceptFieldNamesOfAllTypeNamesexceptTypeNames(
  'Droid Starship',
  'id, name'
);
console.log(typeFieldName); // "@*TypeNames-[Droid,Starship].@*FieldNames-[id,name];"
```
