import { indent } from '@graphql-codegen/visitor-plugin-common';
import {
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { appliesOnBlock } from '../utils';
// import { TypeName, FieldName, TypeFieldName } from './type-field-name';

//#region PluginConfig
/**
 * @name FlutterFreezedPluginConfig
 * @description configure the `flutter-freezed` plugin
 */
export type FlutterFreezedPluginConfig = {
  /**
   * @name camelCasedEnums
   * @type {(boolean | DartIdentifierCasing)}
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
   * @type {(boolean | TypeName['value'] | TypeName[])}
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
   *           copyWith: 'Droid,Starship;',
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

  copyWith?: boolean | TypeName | TypeName[];

  /**
   * @name customScalars
   * @type {Record<string, string>}
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
   * @type
   * @summary annotate a field with a @Default(value: defaultValue) decorator
   * @description Requires an array of tuples with the type signature below:
   *
   * `[typeFieldName: TypeFieldName, value: string, appliesOn: AppliesOnParameters[]]`.
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
   *             ['MovieCharacter.[appearsIn]', `Episode.jedi`, ['default_factory_parameter']],
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
    typeFieldName: TypeFieldName,
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
  deprecated?: [typeFieldName: TypeFieldName, appliesOn: (AppliesOnFactory | AppliesOnParameters)[]][];

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
  equal?: boolean | TypeName | TypeName[];

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
        typeFieldName: TypeFieldName,
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
   * ` [typeFieldName: TypeFieldName, appliesOn: AppliesOnParameters[]]`
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
  final?: [typeFieldName: TypeFieldName, appliesOn: AppliesOnParameters[]][];

  /**
   *
   * @name fromJsonToJson
   * @summary  makes your models compatible with `json_serializable`.
   * @description If `true` freezed will use `json_serializable` to generate fromJson and toJson constructors for your models.
   *
   * You can use custom encodings for each field by passing in an array of tuple with the type signature below:
   *
   * `[typeFieldName: TypeFieldName, classOrFunctionName: string, useClassConverter?: boolean, appliesOn?: AppliesOnParameters[]]`
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
        typeFieldName: TypeFieldName,
        classOrFunctionName: string,
        useClassConverter?: boolean,
        appliesOn?: AppliesOnParameters[]
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
  ignoreTypes?: TypeName[];

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
  immutable?: boolean | TypeName | TypeName[];

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
  makeCollectionsUnmodifiable?: boolean | TypeName | TypeName[];

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
  mergeInputs?: [typeName: TypeName, mergeWithTypeNames: TypeName[]][];

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
  mutableInputs?: boolean | TypeName | TypeName[];

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
  privateEmptyConstructor?: boolean | TypeName | TypeName[];

  /**
   * @name unionClass
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
   *           unionClass: [
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
  unionClass?: [
    /**
     * The name of the Graphql Union Type (or in the case of merged types, the base type on which other types are merged with)
     */
    unionTypeName: TypeName | string,

    /**
     * in a fromJSON/toJson encoding a response/object({key:value}), you can specify what name should be used as the key ?
     */
    unionKey?: string,

    /**
     * normally in camelCase but you can change that to PascalCase
     */
    unionValueCase?: UnionValueCase,

    /**
     * just as the unionKey changes the key used, this changes the value for each union/sealed factories
     */
    unionValuesNameMap?: Record<TypeName | string, string>
  ][];
};

//#endregion

//#region type alias

// /**
//  * @name TypeName
//  * @see [TypeName]()
//  * @description A comma-separated string of GraphQL Type Names. Use the `globalTypeFieldName` to apply the same config options to all GraphQL Types.
//  * @exampleMarkdown

//  *
//  */
// export type TypeName = _TypeName['value'];

// /**
//  * @name TypeFieldName
//  * @see [TypeFieldName]()
//  * @description A compact string of GraphQL Type and Field Names separated with a  dot(`.`) used in the config for specifying options for a list of Graphql Types and Fields
//  * @exampleMarkdown
//  * ### Configuring GraphQL Types
//  * ```ts
//  *  let typeName3:TypeFieldName = '@*TypeName' //  This example applies for all GraphQL Types
//  *
//  *  let typeName4:TypeFieldName = '@*TypeName-[Human,Movie]' // if there are many types to be specified, use this to specify those to be **excluded**. This example applies on all types in the GraphQL Schema except the `Human` and `Movie` types
//  *
//  * let typeName1:TypeFieldName = 'Droid' // This example applies on the Droid GraphQL Type
//  *
//  * let typeName2:TypeFieldName = 'Droid, Starship' // a comma-separated string of GraphQL Type names. This example applies on the Droid and Starship GraphQL Types
//  *
//  * ```
//  *
//  * ### Configuring the fields of GraphQL Types
//  * ```ts
//  * let typeFieldName1:TypeFieldName = 'Droid.[id,friends]' // in an array, specify one or more fields for that GraphQL Type. This example applies on the `id` and `friends` fields of the Droid GraphQL Type
//  *
//  * let typeFieldName2:TypeFieldName = 'Droid.[id,friends], Starship.[id], @*TypeName.[id,name]' // same as `typeFieldName1` but for more than one GraphQL Type
//  *
//  * let typeFieldName3:TypeFieldName = 'Droid.@*FieldName' // applies on all fields of the Droid GraphQL Type
//  *
//  * let typeFieldName4:TypeFieldName = 'Droid.@*FieldName-[name,appearsIn]' // if there are many fields to be specified, use this to specify those to be **excluded**. This example applies on all of the fields of the Droid GraphQL Type except the `name` and `appearsIn` fields
//  *
//  *
//  * let typeFieldName5:TypeFieldName = '@*TypeName.[id]' // applies on the `id` field of any GraphQL Types
//  *
//  *
//  * let typeFieldName6:TypeFieldName = '@*TypeName-[Human,Starship].[id]' // applies on the `id` field of any GraphQL Types except the `Human` and `Starship` types
//  *
//  * let typeFieldName7:TypeFieldName = '@*TypeName.@*FieldName' // applies on all of the fields of the GraphQL Types
//  *
//  * let typeFieldName8:TypeFieldName = '@*TypeName-[Human,Starship].@*FieldName' // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types
//  *
//  * let typeFieldName9:TypeFieldName = '@*TypeName.@*FieldName-[id,name]' // applies on all of the fields of the GraphQL Types except the `id` and `name` fields
//  *
//  * let typeFieldName10:TypeFieldName = '@*TypeName-[Human,Movie].@*FieldName-[id,name]' // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types and the `id` and `name` fields
//  * ```
//  * */
// export type TypeFieldName = _TypeFieldName['value'];

/**
 * @name ApplyDecoratorOn
 * @description Values that are passed to the `DecoratorToFreezed.applyOn` field that specifies where the custom decorator should be applied
 */
export type AppliesOn =
  | 'enum' // applies on the Enum itself
  | 'enum_value' // applies to the value of an Enum
  | 'class' // applies on the class itself
  | 'factory' // applies on all class factory constructor
  | 'default_factory' // applies on the main default factory constructor
  | 'named_factory' // applies on all of the named factory constructors in a class
  | 'named_factory_for_union_types' // applies on the named factory constructors for a specified(or all when the `*` is used as the key) GraphQL Object Type when it appears in a class as a named factory constructor and that class was generated for a GraphQL Union Type. E.g: `Droid` in `SearchResult` in the StarWars Schema
  | 'named_factory_for_merged_types' // applies on the named factory constructors for a GraphQL Input Type when it appears in a class as a named factory constructor and that class was generated for a GraphQL Object Type and it Type is to be merged with the GraphQL Object Type. E.g: `CreateMovieInput` merged with `Movie` in the StarWars Schema
  | 'parameter' // applies on all parameters for both default constructors and named factory constructors
  | 'default_factory_parameter' // applies on parameters for ONLY default constructors for a specified(or all when the `*` is used as the key) field on a GraphQL Object/Input Type
  | 'named_factory_parameter' // applies on parameters for all named factory constructors for a specified(or all when the `*` is used as the key) field on a GraphQL Object/Input Type
  | 'named_factory_parameter_for_union_types' // like `named_factory_parameters` but ONLY for a parameter in a named factory constructor which for a GraphQL Union Type
  | 'named_factory_parameter_for_merged_types'; // like `named_factory_parameters` but ONLY for a parameter in a named factory constructor which for a GraphQL Input Type that is merged inside an a class generated for a GraphQL Object Type

export const APPLIES_ON_ENUM = <const>['enum'];

export type AppliesOnEnum = typeof APPLIES_ON_ENUM[number];

export const APPLIES_ON_ENUM_VALUE = <const>['enum_value'];

export type AppliesOnEnumValue = typeof APPLIES_ON_ENUM_VALUE[number];

export const APPLIES_ON_CLASS = <const>['class'];

export type AppliesOnClass = typeof APPLIES_ON_CLASS[number];

export const APPLIES_ON_DEFAULT_FACTORY = <const>['factory', 'default_factory'];

export type AppliesOnDefaultFactory = typeof APPLIES_ON_DEFAULT_FACTORY[number];

export const APPLIES_ON_NAMED_FACTORY_FOR_UNION_TYPES = <const>[
  'factory',
  'named_factory',
  'named_factory_for_union_types',
];
export type AppliesOnNamedFactoryForUnionTypes = typeof APPLIES_ON_NAMED_FACTORY_FOR_UNION_TYPES[number];

export const APPLIES_ON_NAMED_FACTORY_FOR_MERGED_TYPES = <const>[
  'factory',
  'named_factory',
  'named_factory_for_merged_types',
];
export type AppliesOnNamedFactoryForMergedTypes = typeof APPLIES_ON_NAMED_FACTORY_FOR_MERGED_TYPES[number];

export type AppliesOnNamedFactory = AppliesOnNamedFactoryForUnionTypes | AppliesOnNamedFactoryForMergedTypes;

export type AppliesOnFactory = AppliesOnDefaultFactory | AppliesOnNamedFactory;

export const APPLIES_ON_FACTORY = [
  'factory',
  'default_factory',
  'named_factory',
  'named_factory_for_merged_types',
  'named_factory_for_union_types',
];

export const APPLIES_ON_DEFAULT_PARAMETERS = <const>['parameter', 'default_factory_parameter'];

export type AppliesOnDefaultParameters = typeof APPLIES_ON_DEFAULT_PARAMETERS[number];

export const APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES = <const>[
  'parameter',
  'named_factory_parameter',
  'named_factory_parameter_for_union_types',
];

export type AppliesOnNamedFactoryParametersForUnionTypes =
  typeof APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES[number];

export const APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_MERGED_TYPES = <const>[
  'parameter',
  'named_factory_parameter',
  'named_factory_parameter_for_merged_types',
];

export type AppliesOnNamedFactoryParametersForMergedTypes =
  typeof APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_MERGED_TYPES[number];

export type AppliesOnNamedParameters =
  | AppliesOnNamedFactoryParametersForUnionTypes
  | AppliesOnNamedFactoryParametersForMergedTypes;

export type AppliesOnParameters = AppliesOnDefaultParameters | AppliesOnNamedParameters;

export const APPLIES_ON_PARAMETERS = <const>[
  'parameter',
  'default_factory_parameter',
  'named_factory_parameter',
  'named_factory_parameter_for_union_types',
  'named_factory_parameter_for_merged_types',
];

export type DartIdentifierCasing = 'snake_case' | 'camelCase' | 'PascalCase';

export type NodeType =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode;

export type FieldType = FieldDefinitionNode | InputValueDefinitionNode;

export type ObjectType = ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode;

export type ConfigOption = keyof FlutterFreezedPluginConfig;
export type FreezedOption = Extract<
  ConfigOption,
  'copyWith' | 'equal' | 'immutable' | 'makeCollectionsUnmodifiable' | 'mutableInputs' | 'privateEmptyConstructor'
>;

export type TypeFieldNameOption = Extract<
  ConfigOption,
  'defaultValues' | 'deprecated' | 'escapeDartKeywords' | 'final' | 'fromJsonToJson'
>;

export type MultiConstructorOption = FlutterFreezedPluginConfig['unionClass'];

export type UnionValueCase = 'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal';

/**
 * maps GraphQL scalar types to Dart's scalar types
 */
export const DART_SCALARS: Record<string, string> = {
  ID: 'String',
  String: 'String',
  Boolean: 'bool',
  Int: 'int',
  Float: 'double',
  DateTime: 'DateTime',
};

export const DART_KEYWORDS = {
  abstract: 'built-in',
  else: 'reserved',
  import: 'built-in',
  show: 'context',
  as: 'built-in',
  enum: 'reserved',
  in: 'reserved',
  static: 'built-in',
  assert: 'reserved',
  export: 'built-in',
  interface: 'built-in',
  super: 'reserved',
  async: 'context',
  extends: 'reserved',
  is: 'reserved',
  switch: 'reserved',
  await: 'async-reserved',
  extension: 'built-in',
  late: 'built-in',
  sync: 'context',
  break: 'reserved',
  external: 'built-in',
  library: 'built-in',
  this: 'reserved',
  case: 'reserved',
  factory: 'built-in',
  mixin: 'built-in',
  throw: 'reserved',
  catch: 'reserved',
  false: 'reserved',
  new: 'reserved',
  true: 'reserved',
  class: 'reserved',
  final: 'reserved',
  null: 'reserved',
  try: 'reserved',
  const: 'reserved',
  finally: 'reserved',
  on: 'context',
  typedef: 'built-in',
  continue: 'reserved',
  for: 'reserved',
  operator: 'built-in',
  var: 'reserved',
  covariant: 'built-in',
  Function: 'built-in',
  part: 'built-in',
  void: 'reserved',
  default: 'reserved',
  get: 'built-in',
  required: 'built-in',
  while: 'reserved',
  deferred: 'built-in',
  hide: 'context',
  rethrow: 'reserved',
  with: 'reserved',
  do: 'reserved',
  if: 'reserved',
  return: 'reserved',
  yield: 'async-reserved',
  dynamic: 'built-in',
  implements: 'built-in',
  set: 'built-in',
  // built-in types
  int: 'reserved',
  double: 'reserved',
  String: 'reserved',
  bool: 'reserved',
  List: 'reserved',
  Set: 'reserved',
  Map: 'reserved',
  Runes: 'reserved',
  Symbol: 'reserved',
  Object: 'reserved',
  Null: 'reserved',
  Never: 'reserved',
  Enum: 'reserved',
  Future: 'reserved',
  Iterable: 'reserved',
};

/** initializes a FreezedPluginConfig with the defaults values */
export const defaultFreezedPluginConfig: FlutterFreezedPluginConfig = {
  camelCasedEnums: true,
  copyWith: undefined,
  customScalars: {},
  defaultValues: undefined,
  deprecated: undefined,
  equal: undefined,
  escapeDartKeywords: true,
  final: undefined,
  fromJsonToJson: true,
  ignoreTypes: [],
  immutable: true,
  makeCollectionsUnmodifiable: undefined,
  mergeInputs: undefined,
  mutableInputs: true,
  privateEmptyConstructor: true,
  unionClass: undefined,
};

//#endregion

export class Config {
  static camelCasedEnums = (config: FlutterFreezedPluginConfig) => {
    const value = config['camelCasedEnums'];

    if (typeof value === 'boolean') {
      return value ? 'camelCase' : undefined;
    } else if (value !== undefined) {
      return value;
    }
    return undefined;
  };

  static copyWith = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'copyWith', typeName);
  };

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  static defaultValues = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters[]
  ) => {
    const decorator = (value: string) => `@Default(${value})\n`;
    const result = this.typeFieldNameOptionValue(config, 'defaultValues', typeName, fieldName, appliesOn, 2, [1]);
    if (result.include) {
      return decorator(result.data[0]);
    }
    return undefined;
  };

  static deprecated = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    appliesOn: (AppliesOnFactory | AppliesOnParameters)[],
    fieldName?: FieldName
  ) => {
    // TODO: handle for multiple TypeNames
    const result = this.typeFieldNameOptionValue(config, 'deprecated', typeName, fieldName, appliesOn, 1);
    if (result.include) {
      return '@deprecated\n';
    }
    return undefined;
  };

  static escapeDartKeywords = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters[]
  ) => {
    const result = this.typeFieldNameOptionValue(
      config,
      'escapeDartKeywords',
      typeName,
      fieldName,
      appliesOn,
      4,
      [1, 2, 3]
    );
    if (result.include) {
      return result.data;
    }
    return undefined;
  };

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'equal', typeName);
  };

  static final = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters[]
  ) => {
    const result = this.typeFieldNameOptionValue(config, 'final', typeName, fieldName, appliesOn, 1);
    if (result.include) {
      return true;
    }
    return undefined;
  };

  static fromJsonToJson = (
    config: FlutterFreezedPluginConfig,
    typeName?: TypeName,
    fieldName?: FieldName,
    appliesOn?: AppliesOnParameters[]
  ) => {
    const value = config['fromJsonToJson'];
    // const expectedAppliesOn = appliesOn ?? [];

    if (typeof value === 'boolean') {
      return value;
    } else if (value !== undefined) {
      const result = this.typeFieldNameOptionValue(config, 'fromJsonToJson', typeName, fieldName, appliesOn, 3, [1, 2]);
      if (result.include) {
        return result.data;
      }
    }
    return undefined;
  };

  static ignoreTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    const value = config.ignoreTypes;
    return TypeName.matchesTypeNames(value, typeName);
  };

  static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'immutable', typeName);
  };

  static makeCollectionsUnmodifiable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'makeCollectionsUnmodifiable', typeName);
  };

  static mergeInputs = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    const value = config['mergeInputs'];
    return (
      value
        ?.filter(([graphQLTypeName]) => graphQLTypeName.includes(typeName.value))
        .map(([, mergeWithTypeNames]) => mergeWithTypeNames)
        .reduce(
          (acc, mergeWithTypeNames) => [
            ...acc,
            ...mergeWithTypeNames
              .map(typeName => typeName.split(/\s*,\s*/))
              .reduce((acc2, typeNames) => [...acc2, ...typeNames], []),
          ],
          []
        ) ?? []
    );
  };
  static mutableInputs = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'mutableInputs', typeName);
  };

  static privateEmptyConstructor = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'privateEmptyConstructor', typeName);
  };

  static unionKey = (config: FlutterFreezedPluginConfig, unionTypeName?: TypeName): string | undefined => {
    return this.unionClassConfig(config, 1, unionTypeName) as string | undefined;
  };

  static unionValueCase = (config: FlutterFreezedPluginConfig, unionTypeName?: TypeName): string | undefined => {
    return this.unionClassConfig(config, 2, unionTypeName) as string | undefined;
  };

  static unionValueDecorator = (
    config: FlutterFreezedPluginConfig,
    unionTypeName: TypeName,
    unionValueTypeName: TypeName
  ) => {
    const unionValuesNameMap = this.unionClassConfig(config, 3, unionTypeName);
    if (unionValuesNameMap && typeof unionValuesNameMap !== 'string') {
      const unionValueName = unionValuesNameMap[unionValueTypeName.value];
      return indent(`@FreezedUnionValue('${unionValueName}')`); // TODO: add this to the factory block decorators
    }
    return undefined;
  };

  static unionClassConfig = (config: FlutterFreezedPluginConfig, index: number, unionTypeName?: TypeName) => {
    const value = config['unionClass'];
    // if (Array.isArray(value)) {
    const v = value.find(
      ([commaSeparatedUnionTypeNames]) =>
        unionTypeName?.value === commaSeparatedUnionTypeNames ||
        commaSeparatedUnionTypeNames.includes(unionTypeName?.value ?? TypeName.anyTypeName)
    );
    return v?.[index];
    // }
  };

  static freezedOptionValue = (config: FlutterFreezedPluginConfig, option: FreezedOption, typeName?: TypeName) => {
    const value = config[option];
    if (typeof value === 'boolean' || value === undefined) return value;
    return TypeName.matchesTypeNames(value, typeName);
  };

  public static typeFieldNameOptionValue = (
    config: FlutterFreezedPluginConfig,
    option: TypeFieldNameOption,
    typeName: TypeName,
    fieldName: FieldName,
    expectedAppliesOn: readonly AppliesOn[],
    appliesOnIndex: number,
    dataIndexes?: number[]
  ) => {
    const value = config[option];
    let include: boolean | undefined = undefined;
    let data: any[] | undefined = undefined;

    if (Array.isArray(value)) {
      value.forEach((v: any[]) => {
        const typeFieldNames = v[0];
        data = dataIndexes?.map(i => v[i]);
        const appliesOn = v[appliesOnIndex] ?? [];
        const canApply = appliesOnBlock(appliesOn, expectedAppliesOn, true);
        if (typeof typeFieldNames === 'string') {
          typeFieldNames
            .split(/\s*;\s*/)
            .filter(t => t.length > 0)
            .forEach(typeFieldName => {
              if (canApply) {
                include = TypeFieldName.attemptTypeFieldNameMatches(`${typeFieldName};`, typeName, fieldName);
              }
            });
        }
      });
    }

    return { include, data };
  };

  public static create = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign({}, defaultFreezedPluginConfig, ...config);
  };
}
