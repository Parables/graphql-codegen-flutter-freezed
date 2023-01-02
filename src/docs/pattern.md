@name Pattern

@description A compact string of patterns used in the config for granular configuration for each Graphql Type and/or its fieldNames

The string can contain more than one pattern, each pattern ends with a semi-colon (`;`).

A dot (`.`) separates the TypeName from the FieldNames in each pattern

To apply an option to all Graphql Types or fields, use the allTypeNames (`@*TypeNames`) and allFieldNames (`@*FieldNames`) tokens respectively

Wherever you use the allTypeNames and the allFieldNames, know very well that you can make some exceptions. After all, to every rule, there is an exception

A **square bracket** (`[]`) is used to specify what should be included and a **negated square bracket** (`-[]`) is used to specify what should be excluded

Manually typing out a pattern may be prone to typos and invalid patterns therefore the [`TypeFieldName`]() class exports some builder methods which you can use in your plugin config file.

The patterns themselves are readable and easy to manually type it out in the config but its RECOMMENDED that you the builder methods. However, along with builder methods, the [`TypeFieldName`]() class also exports the Regular Expression(RegExp) used to test the patterns for a match as well as matcher methods. You can use these to find out if you manually typed out patterns would work with this plugin.

@exampleMarkdown

## Usage for Graphql Types

### Configuring specific Graphql Types

You can explicitly list out the names of the Graphql Types that you want to configure.

```ts
const pattern = Pattern.forTypeNames([Droid, Starship]);
console.log(pattern); // "Droid;Starship;"
```

### Configuring all Graphql Types

Instead of manually listing out **all** the types in the Graphql Schema, use the allTypeNames (`@*TypeNames`) to configure all the Graphql Types in the Schema

```ts
const pattern = Pattern.forAllTypeNames();
console.log(pattern); // "@*TypeNames;"
```

### Configuring all Graphql Types except those specified in the exclusion list of TypeNames

You can configure all GraphQL Types except those specified.

The example below configures all the Graphql Types in the Schema except the `Droid` and `Starship` Graphql Types

```ts
const pattern = Pattern.forAllTypeNamesExcludeTypeNames([Droid, Starship]);
console.log(pattern); // "@*TypeNames-[Droid,Starship];"
```

## Usage for fields of Graphql Types

### Configuring specific fields of a specific Graphql Type

You can explicitly list out the names of the fields of the Graphql Types that you want to configure.

```ts
const pattern = Pattern.forFieldNamesOfTypeName([
  [Droid, [id, name, friends]], // individual
  [Human, [id, name, title]], // individual
  [Starship, [name, length]], // individual
]);
console.log(pattern); // "Droid.[id,name,friends];Human.[id,name,title];Starship.[name,length];"
```

### Configuring all fields of a specific Graphql Type

Instead of manually listing out **all the fields** of the Graphql Type, use the allFieldNames (`@*FieldNames`) to configure all the fields of the Graphql Type.

```ts
const pattern = Pattern.forAllFieldNamesOfTypeName([Droid, Movie]);
console.log(pattern); // "Droid.@*FieldNames;Movie.@*FieldNames;"
```

### Configuring all fields except those specified in the exclusion list of FieldNames for a specific GraphQL Type

In the example below, the `id` and the `name` fields will be excluded from the configuration while all the remaining fields of the `Droid` Graphql Type will be configured

```ts
const pattern = Pattern.forAllFieldNamesExcludeFieldNamesOfTypeName([
  [Droid, [id, name, friends]], // individual
  [Human, [id, name, title]], // individual
  [Starship, [name, length]], // individual
]);
console.log(pattern); // "Droid.@*FieldNames-[id,name,friends];Human.@*FieldNames-[id,name,title];Starship.@*FieldNames-[name,length];"
```

### Configuring specific fields of all Graphql Types

When you use the allTypeNames (`@*TypeNames`), you can specify the fields to be configured. If field name that doesn't exists for a given Graphql Type, it would simply be ignored.

The example below configures the `id` and `name` fields of all Graphql Types

```ts
const pattern = Pattern.forFieldNamesOfAllTypeNames([id, name, friends]);
console.log(pattern); // "@*TypeNames.[id,name,friends];"
```

### Configuring all fields of all Graphql Types

Using the allFieldNames (`@*FieldNames`) on the allTypeNames (`@*TypeNames`), you can configure all fields of all the Graphql Types in the Schema

```ts
const pattern = Pattern.forAllFieldNamesOfAllTypeNames();
console.log(pattern); // "@*TypeNames.@*FieldNames;"
```

### Configuring all fields except those specified in the exclusion list of FieldNames for all GraphQL Types

As always, you can make some exception when you use the allFieldNames (`@*FieldNames`) to except some fields from the configuration.

In the example below, the `id` and the `name` fields will be excluded from the configuration while all the remaining fields of all Graphql Type will be configured

```ts
const pattern = Pattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames([id, name, friends]);
console.log(pattern); // "@*TypeNames.@*FieldNames-[id,name,friends];"
```

### Configuring specific fields of all GraphQL Types except those specified in the exclusion list of TypeNames

In the example below, the `id` and `name` fields will be configured for all the Graphql Types in the Schema except`Droid` and `Starship`

```ts
const pattern = Pattern.forFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human], [id, name, friends]);
console.log(pattern); // "@*TypeNames-[Droid,Human].[id,name,friends];"
```

### Configuring all fields of all GraphQL Types except those specified in the exclusion list of TypeNames

In the example below, all fields of all Graphql Types in the Schema except for the fields of `Droid` and `Starship` will be excluded from the configuration while all the remaining fields of all Graphql Type will be configured

```ts
 * const pattern = Pattern.forAllFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human]);
 * console.log(pattern); // "@*TypeNames-[Droid,Human].@*FieldNames;"
```

### Configuring all fields except those specified in the exclusion list of FieldNames of all GraphQL Types except those specified in the exclusion list of TypeNames

In the example below, the `id` and the `name` fields of `Droid` or `Starship` will be excluded from the configuration while all the **remaining fields** of all Graphql Types(including `Droid` and `Starship`) will be configured

```ts
const pattern = Pattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(
  [Droid, Human],
  [id, name, friends]
);
console.log(pattern); // "@*TypeNames-[Droid,Human].@*FieldNames-[id,name,friends];"
```
