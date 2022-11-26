import { AppliesOnFactory, AppliesOnParameters, DartIdentifierCasing, UnionValueCase } from '.';

//#region string type alias

/**
 * @name GraphQLTypeName
 * @description A comma-separated string of GraphQL Type Names. Use the `globalTypeFieldName` to apply the same config options to all GraphQL Types.
 * @exampleMarkdown
 * ### Configuring GraphQL Types
 * ```ts
 * let typeName1:GraphQLTypeName = 'Droid' // This example applies on the Droid GraphQL Type
 *
 * let typeName2:GraphQLTypeName = 'Droid, Starship' // a comma-separated string of GraphQL Type names. This example applies on the Droid and Starship GraphQL Types
 *
 * let typeName3:GraphQLTypeName = '@*TypeName' //  This example applies for all GraphQL Types
 *
 * let typeName4:GraphQLTypeName = '@*TypeName-[Human,Movie]' // if there are many types to be specified, use this to specify those to be **excluded**. This example applies on all types in the GraphQL Schema except the `Human` and `Movie` types
 * ```
 *
 */
type GraphQLTypeName = string;

/**
 * @name GraphQLTypeFieldName
 * @description A comma-separated string of GraphQL Type and Field Names separated with a `.` .Use the `globalTypeFieldName` to apply the same config options to all GraphQL Types.
 * @exampleMarkdown
 * ### Configuring the fields of GraphQL Types
 * ```ts
 * let typeFieldName1:GraphQLTypeFieldName = 'Droid.[id,friends]' // in an array, specify one or more fields for that GraphQL Type. This example applies on the `id` and `friends` fields of the Droid GraphQL Type
 *
 * let typeFieldName2:GraphQLTypeFieldName = 'Droid.[id,friends], Starship.[id]' // same as `graphQLTypeFieldName1` but for more than one GraphQL Type
 *
 * let typeFieldName3:GraphQLTypeFieldName = 'Droid.@*FieldName' // applies on all fields of the Droid GraphQL Type
 *
 * let typeFieldName4:GraphQLTypeFieldName = 'Droid.@*FieldName-[name,appearsIn]' // if there are many fields to be specified, use this to specify those to be **excluded**. This example applies on all of the fields of the Droid GraphQL Type except the `name` and `appearsIn` fields
 *
 * let typeFieldName5:GraphQLTypeFieldName = '@*TypeName.@*FieldName' // applies on all of the fields of the GraphQL Types
 * ```
 * */
type GraphQLTypeFieldName = string;

//#endregion

/**
 * @name FlutterFreezedPluginConfig
 * @description configure the `flutter-freezed` plugin
 */
export type FlutterFreezedPluginConfig = {
  /**
   * @name camelCasedEnums
   * @type boolean // TODO: do the same for all config options
   * @summary Specify how Enum values should be cased.
   * @description Dart's recommended lint uses camelCase for enum values.
   *
   * You can also specify your preferred casing for Enum values. Available options are: `'snake_case'`, `'camelCase'` and `'PascalCase'`
   *
   * For consistency, this option applies to every Enum Type in the GraphQL Schema
   * @default true
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           camelCasedEnums: true, // or false
   *           // OR: specify a DartIdentifierCasing
   *           camelCasedEnums: 'snake_case',
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  camelCasedEnums?: boolean | DartIdentifierCasing;

  /**
   * @name copyWith
   * @summary enables Freezed copyWith helper method
   * @description The plugin by default generates immutable Freezed models using the `@freezed` decorator.
   *
   * If a boolean `value` is set, the plugin will use the `@Freezed(copyWith: value)` instead.
   *
   * You can also specify this option for one or more GraphQL Types by passing a list of GraphQL **Type** names
   * @default undefined
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           copyWith: true,
   *           // OR: a comma-separated string
   *           copyWith: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           copyWith: ['Droid', 'Starship'],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */

  copyWith?: boolean | GraphQLTypeName | GraphQLTypeName[];

  /**
   * @name customScalars
   * @summary Maps GraphQL Scalar Types to Dart built-in types
   * @description The `key` is the GraphQL Scalar Type and the `value` is the equivalent Dart Type
   *
   * The plugin automatically handles built-in GraphQL Scalar Types.
   * @default {}
   * @exampleMarkdown
   * ## Usage
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           customScalars: {
   *             jsonb: 'Map<String, dynamic>',
   *             timestamptz: 'DateTime',
   *             UUID: 'String',
   *           },
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  customScalars?: Record<string, string>;

  /**
   * @name defaultValues
   * @summary annotate a field with a @Default(value: defaultValue) decorator
   * @description Requires an array of tuples with the type signature below:
   *
   * `[typeFieldName: GraphQLTypeFieldName, value: string, appliesOn: AppliesOnParameters[]]`.
   *
   * Hint: Use backticks for the values so that you can use the quotation marks for string values
   * @default undefined
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           defaultValues: [
   *             ['MovieCharacter.[appearsIn]', `[Episode.jedi]`, ['default_factory_parameter']],
   *             ['@*TypeName.[id]', `UUID.new()`, ['parameter']],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  defaultValues?: [
    typeFieldName: GraphQLTypeFieldName,
    value: string, // use backticks for string values
    appliesOn: AppliesOnParameters[]
  ][];

  /**
   * @name deprecated
   * @description a list of field Names to be marked as deprecated. Include the rootKey to mark the whole
   * @default undefined
   * @exampleMarkdown
   * ## Usage:
   *
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           deprecated: [
   *             ['MovieCharacter.[appearsIn]', ['default_factory_parameter']],
   *             ['Starship,Droid,Human', ['named_factory_for_union_types']],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  deprecated?: [typeFieldName: GraphQLTypeFieldName, appliesOn: (AppliesOnFactory | AppliesOnParameters)[]][];

  /**
   * @name equal
   * @description set to false to disable Freezed equal method helper
   * @default undefined
   *
   * @exampleMarkdown
   * ## Usage:
   *
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           equal: false,
   *           // OR: a comma-separated string of `GraphQL Type Names`
   *           equal: 'Starship,Droid,Human',
   *           // OR a list of `GraphQL Type Names`
   *           equal: ['Starship', 'Droid', 'Human'],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  equal?: boolean | GraphQLTypeName | GraphQLTypeName[];

  /**
   * @name escapeDartKeywords
   * @summary ensures that the generated Freezed models doesn't use any of Dart's reserved keywords as identifiers
   *
   * @description Wraps the fields names that are valid Dart keywords with the prefix and suffix given and allows you to specify your preferred casing: "snake_case" | "camelCase" | "PascalCase"
   *
   *   Requires a boolean or an array of tuples with the type signature below:
   *
   * `[typeFieldName: string, prefix?: string, suffix?: string, casing?: DartIdentifierCasing, appliesOn?: AppliesOnParameters[]]`.
   * @default true
   * @see_also [dartKeywordEscapePrefix,dartKeywordEscapeSuffix]
   *
   * @exampleMarkdown
   * ## Usage:
   *
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           // WARNING: Setting this option to `false` might generate output that contains Dart keywords as identifiers. Defaults to `true`
   *           escapeDartKeywords: false,
   *           // OR configure how Dart keywords are handled for each type
   *           escapeDartKeywords: [
   *             [
   *               'Episode.@*FieldName',
   *               // `prefix`: defaults to an empty string `''` if undefined.
   *               // Using a underscore `_` as a prefix will make the field as private
   *               undefined,
   *               // `suffix`: defaults to an underscore `_` if undefined
   *               undefined,
   *               // `casing`: maintains the original casing if undefined.
   *               // Available options: `snake_cased`, `camelCase` or `PascalCase`
   *               undefined,
   *               // `appliesOn`: defaults to an [`parameter`] if undefined. The default applies this option on all types of parameters
   *               undefined,
   *             ],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  escapeDartKeywords?:
    | boolean
    | [
        typeFieldName: GraphQLTypeFieldName,
        prefix?: string,
        suffix?: string,
        casing?: DartIdentifierCasing,
        appliesOn?: AppliesOnParameters[]
      ][];

  /**
   * @name final
   * @summary  marks fields as final
   * @description This will mark the specified parameters as final
   *
   *   Requires a an array of tuples with the type signature below:
   *
   * ` [typeFieldName: GraphQLTypeFieldName, appliesOn: AppliesOnParameters[]]`
   * @default undefined
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           final: [
   *             ['Human.[name]', ['parameter']],
   *             ['Starship.[id],Droid.[id],Human.[id]', ['default_factory_parameter']],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  final?: [typeFieldName: GraphQLTypeFieldName, appliesOn: AppliesOnParameters[]][];

  /**
   *
   * @name fromJsonToJson
   * @summary  makes your models compatible with `json_serializable`.
   * @description If `true` freezed will use `json_serializable` to generate fromJson and toJson constructors for your models.
   *
   * You can use custom encodings for each field by passing in an array of tuple with the type signature below:
   *
   * `[typeFieldName: GraphQLTypeFieldName, classOrFunctionName: string, useClassConverter?: boolean, appliesOn?: AppliesOnParameters[]]`
   * @see {@link https://github.com/google/json_serializable.dart/tree/master/json_serializable#custom-types-and-custom-encoding Custom types and custom encoding}
   * @default true
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           fromJsonToJson: [
   *             // Example 1: Using functionName
   *             ['Movie.[createdAt,updatedAt]', timestamp, false, ['parameter']],
   *             // Example 2: Using className
   *             ['Movie.[createdAt,updatedAt]', Timestamp, true, ['parameter']],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   *
   * ### Example 1: using `functionName`
   *
   * This will declare two functions with a name `timestampFromJson` and `timestampToJson` that will an throw an Exception. You will need to implement the function manually.
   *
   * ```dart filename="app_models.dart"
   * dynamic timestampFromJson(dynamic val) {
   * throw Exception("You must implement `timestampToJson` function in `app_models.dart`");
   * }
   *
   * dynamic timestampToJson(dynamic val) {
   * throw Exception("You must implement `timestampToJson` function in `app_models.dart`");
   * }
   * ```
   *
   * ### Example 2: suing `className`
   *
   * Like the `functionName`, this will rather place the functions as methods in a class using the name given.
   *
   * This provides a better abstraction than the global functions. That's why `className` has a higher precedence than `functionName`
   *
   * ```dart filename="app_models.dart"
   * class TimestampConvertor implements JsonConverter<dynamic, dynamic> {
   *     const TimestampConvertor();
   *
   *     @override
   *     dynamic fromJson(dynamic json){
   *         throw Exception("You must implement `TimestampConvertor.fromJson` method in `app_models.dart`");
   *     }
   *
   *     @override
   *     dynamic toJson(dynamic object){
   *         throw Exception("You must implement `TimestampConvertor.toJson` method in `app_models.dart`");
   *     }
   * }
   * ```
   */
  fromJsonToJson?:
    | boolean
    | [
        typeFieldName: GraphQLTypeFieldName,
        classOrFunctionName: string,
        useClassConverter?: boolean,
        appliesOn?: AppliesOnParameters[]
      ][];

  /**
   * @name fromJsonWithMultiConstructors
   * @description customize the key to be used for fromJson with multiple constructors
   * @see {@link https://pub.dev/packages/freezed#fromjson---classes-with-multiple-constructors fromJSON - classes with multiple constructors}
   * @default undefined
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           fromJsonWithMultiConstructors: [
   *             [
   *               'SearchResult', // <-- unionTypeName
   *               'namedConstructor', // <-- unionKey
   *               'FreezedUnionCase.pascal', // <-- unionValueCase
   *               { // <-- unionValuesNameMap
   *                 Droid: 'special droid',
   *                 Human: 'astronaut',
   *                 Starship: 'space_Shuttle',
   *               },
   *             ],
   *           ],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  fromJsonWithMultiConstructors?: [
    unionTypeName: GraphQLTypeName,
    unionKey?: string,
    unionValueCase?: UnionValueCase,
    unionValuesNameMap?: Record<string, string>
  ][];

  /**
   * @name ignoreTypes
   * @description names of GraphQL types to ignore when generating Freezed classes
   * @default []
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           ignoreTypes: ['PaginatorInfo'],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  ignoreTypes?: GraphQLTypeName[];

  /**
   * @name immutable
   * @description  set to true to use the `@freezed` decorator or false to use the `@unfreezed` decorator
   * @default true
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           immutable: true,
   *           // OR: a comma-separated string
   *           immutable: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           immutable: ['Droid', 'Starship'],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  immutable?: boolean | GraphQLTypeName | GraphQLTypeName[];

  /**
   * @name makeCollectionsUnmodifiable
   * @description allows collections(lists/maps) to be modified even if class is immutable
   * @default undefined
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           makeCollectionsUnmodifiable: true,
   *           // OR: a comma-separated string
   *           makeCollectionsUnmodifiable: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           makeCollectionsUnmodifiable: ['Droid', 'Starship'],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  makeCollectionsUnmodifiable?: boolean | GraphQLTypeName | GraphQLTypeName[];

  /**
   * @name mergeInputs
   * @description merge InputTypes as a named factory constructor inside a class generated for a GraphQL ObjectType.
   * @default undefined
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *      mergeInputs: ["Create$Input", "Update$Input", "Delete$Input"]
   * ```
   */
  mergeInputs?: [typeName: GraphQLTypeName, mergeWithTypeNames: GraphQLTypeName[]][];

  /**
   * @name mutableInputs
   * @description  since inputs will be used to collect data, it makes sense to make them mutable with Freezed's `@unfreezed` decorator. This overrides(in order words: has a higher precedence than) the `immutable` config value `ONLY` for GraphQL `input types`.
   * @default true
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           mutableInputs: true,
   *           // OR: a comma-separated string
   *           mutableInputs: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           mutableInputs: ['Droid', 'Starship'],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  mutableInputs?: boolean | GraphQLTypeName | GraphQLTypeName[];

  /**
   * @name privateEmptyConstructor
   * @description if true, defines a private empty constructor to allow getter and methods to work on the class
   * @default true
   *
   * @exampleMarkdown
   * ## Usage:
   * ```ts filename='codegen.ts'
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'lib/data/models/app_models.dart': {
   *       plugins: {
   *         'flutter-freezed': {
   *           // ...
   *           privateEmptyConstructor: true,
   *           // OR: a comma-separated string
   *           privateEmptyConstructor: 'Droid,Starship',
   *           // OR: a list of GRaphQL Type names
   *           privateEmptyConstructor: ['Droid', 'Starship'],
   *         },
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  privateEmptyConstructor?: boolean | GraphQLTypeName | GraphQLTypeName[];
};
