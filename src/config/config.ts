import {
  AppliesOn,
  AppliesOnClass,
  AppliesOnFactory,
  AppliesOnParameters,
  DartIdentifierCasing,
  UnionValueCase,
} from '.';

//#region string type alias
type GlobalTypeFieldName = string;

type JsonConvertorClassName = string;
type FromToJsonFunctionName = string;

type GraphQLScalarType = string;
type DartCompatibleType = string;

type Decorator = string;

/**
 * @name GraphQLTypeFieldName
 * @description A comma-separated string of GraphQL Type and Field Names separated with a `.` .Use the `globalTypeFieldName` to apply the same config options to all GraphQL Types.
 * @exampleMarkdown
 * ### Configuring GraphQL Types
 * ```ts
 * let graphQLTypeFieldName1:GraphQLTypeFieldName = 'Droid' // This example applies on the Droid GraphQL Type
 *
 * let graphQLTypeFieldName2:GraphQLTypeFieldName = 'Droid, Starship' // a comma-separated string of GraphQL Type names. This example applies on the Droid and Starship GraphQL Types
 *
 * let graphQLTypeFieldName3:GraphQLTypeFieldName = '@*TypeName' //  This example applies for all GraphQL Types
 * ```
 *
 * ### Configuring the fields of GraphQL Types
 * ```ts
 * let graphQLTypeFieldName4:GraphQLTypeFieldName = 'Droid.[id,friends]' // in an array, specify one or more fields for that GraphQL Type. This example applies on the `id` and `friends` fields of the Droid GraphQL Type
 *
 * let graphQLTypeFieldName5:GraphQLTypeFieldName = 'Droid.[id,friends], Starship.[id]' // same as `graphQLTypeFieldName4` but for more than one GraphQL Type
 *
 * let graphQLTypeFieldName6:GraphQLTypeFieldName = 'Droid.@*FieldName' // applies on all fields of the Droid GraphQL Type
 *
 * let graphQLTypeFieldName7:GraphQLTypeFieldName = 'Droid.@*FieldName-[name,appearsIn]' // if there are many fields to be specified, use this to specify those to be **excluded**. This example applies on all of the fields of the Droid GraphQL Type except the `name` and `appearsIn` fields
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
   * @name customScalars
   * @summary Maps GraphQL Scalar Types to Dart built-in types
   * @description The key is the GraphQL Scalar Type and the value is the equivalent Dart Type
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
   * @name typeConfig
   * @summary Configure GraphQL Types and Fields
   * @description This plugin is designed to be flexible. This option allows you to customize and fine-tune the generated output for each GraphQL Type and Fields
   * @default {}
   * @exampleMarkdown
   */
  typeConfig?: {
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
     *           // OR: a list of GRaphQL Type names
     *           copyWith: ['Droid', 'Starship'],
     *           // OR: a comma-separated string
     *           copyWith: 'Droid,Starship',
     *         },
     *       },
     *     },
     *   },
     * };
     * export default config;
     * ```
     */

    copyWith?: boolean | GraphQLTypeFieldName | GraphQLTypeFieldName[];

    /**
     * @name defaultValue
     * @description annotate a field with a @Default(value: defaultValue) decorator
     * @default undefined
     */

    defaultValue?: [
      GraphQLTypeFieldName,
      string, // use backticks for string values
      AppliesOnParameters[]
    ];

    /**
     * @name deprecated
     * @description a list of field Names to be marked as deprecated. Include the rootKey to mark the whole
     * @default undefined
     */

    deprecated?: [GraphQLTypeFieldName, AppliesOnFactory[] | AppliesOnParameters[]];

    /**
     * @name equal
     * @description set to false to disable Freezed equal method helper
     * @default undefined
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       equal: false
     * ```
     */

    equal?: boolean;

    /**
     * @name escapeDartKeywords
     * @description wraps dart-language reserved keywords such as `void`, `in` etc with a prefix and/or suffix which can be set by changing `dartKeywordEscapePrefix` and `dartKeywordEscapeSuffix` config values
     * @default true
     * @see_also [dartKeywordEscapePrefix,dartKeywordEscapeSuffix]
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       escapeDartKeywords: {
     *          in: true # becomes `in_`,
     *          required: { #becomes `argRequired`
     *              dartKeywordEscapePrefix: "arg_",
     *              dartKeywordEscapeCasing: camelCase
     *          }
     *       }
     *
     * ```
     */

    escapeDartKeywords?:
      | [GraphQLTypeFieldName, DartIdentifierCasing, string, string, AppliesOnParameters[]]
      | {
          /**
           * @name dartKeywordEscapeCasing
           * @description after escaping a valid dart keyword, this option transforms the casing to `snake_cased`, `camelCase` or `PascalCase`. Defaults to `undefined` to leave the casing as it is.
           * @default undefined
           * @see_also [escapeDartKeywords, dartKeywordEscapePrefix]
           *
           * ```yaml
           * generates:
           *   flutter_app/lib/data/models/app_models.dart
           *     plugins:
           *       - flutter-freezed
           *     config:
           *       dartKeywordEscapeCasing: camelCase
           *
           * ```
           */
          dartKeywordEscapeCasing?: DartIdentifierCasing;
          /**
           * @name dartKeywordEscapePrefix
           * @description prefix GraphQL type and field names that are valid dart keywords. Don't use only a underscore(`_`) as the `dartKeywordEscapePrefix` since it will make that identifier hidden or produce unexpected results. However, if you would want to change the case after escaping the keyword with `dartKeywordEscapeCasing`, you may use either an `_`, `-` or an empty space ` `.
           * @default undefined
           * @see_also [escapeDartKeywords, dartKeywordEscapeSuffix]
           *
           * @exampleMarkdown
           * ```yaml
           * generates:
           *   flutter_app/lib/data/models/app_models.dart
           *     plugins:
           *       - flutter-freezed
           *     config:
           *       dartKeywordEscapePrefix: "k_"
           *      # Example: let keyword = 'in'
           *      # dartKeywordEscapeCasing === 'snake_case' => 'k_in'
           *      # dartKeywordEscapeCasing === 'camelCase' => 'kIn'
           *      # dartKeywordEscapeCasing === 'PascalCase' => 'KIn'
           *      # dartKeywordEscapeCasing === undefined => 'k_in'
           *
           * ```
           */
          dartKeywordEscapePrefix?: string;
          /**
           * @name dartKeywordEscapeSuffix
           * @description suffix GraphQL type and field names that are valid dart keywords. If the value of `dartKeywordEscapeSuffix` is an `_` and if `dartKeywordEscapeCasing` is `snake_case` or `camelCase`, then the casing will be ignored because it will remove the trailing `_` making the escapedKeyword invalid again
           * @default "_"
           * @see_also [escapeDartKeywords, dartKeywordEscapePrefix]
           *
           * ```yaml
           * generates:
           *   flutter_app/lib/data/models/app_models.dart
           *     plugins:
           *       - flutter-freezed
           *     config:
           *       dartKeywordEscapeSuffix: "_k" or using the default '_'
           *      # Example: let keyword = 'in'
           *      # dartKeywordEscapeCasing === 'snake_case'=> 'in_k' or 'in_' // ignored casing
           *      # dartKeywordEscapeCasing === 'camelCase' =>'inK' or in_ // ignored casing
           *      # dartKeywordEscapeCasing === 'PascalCase' => 'InK' or 'In'
           *      # dartKeywordEscapeCasing === undefined  => 'in_k' or 'in_'
           *
           * ```
           */
          dartKeywordEscapeSuffix?: string;
          appliesOn?: AppliesOnParameters[];
        };

    /**
     * @name final
     * @description  a list of field Names to be marked as final
     * @default undefined
     */

    final?: [GraphQLTypeFieldName, AppliesOnParameters[]] | Record<GraphQLTypeFieldName, AppliesOnParameters[]>;

    /**
     *
     * @name fromJsonToJson
     * @description If `true || undefined` will generate fromJson and toJson methods for your models. You can use custom encodings by passing in a config object
     * @see {@link https://github.com/google/json_serializable.dart/tree/master/json_serializable#custom-types-and-custom-encoding Custom types and custom encoding}
     * @default undefined
     * @param key a comma-separated string of fieldNames
     * @param value.functionName the name of the function
     * @param value.className the name of the convertor class. Has a higher precedence over the functionName
     * @param value.appliesOn when this option on specific blocks. Defaults to ['parameter]
     *
     * @exampleMarkdown
     *
     * ## usage
     *
     * ```ts filename="codegen.ts"
     * import type { CodegenConfig } from '@graphql-codegen/cli';
     *
     * const config: CodegenConfig = {
     *   // ...
     *   generates: {
     *     'lib/data/models/app_models.dart': {
     *       plugins: {
     *         'flutter-freezed': {
     *           option: {
     *             // Syntax 1: using `functionName` => `${functionName}FromJson` && `${functionName}ToJson`
     *             fromJsonToJson: {
     *               'createAt, updatedAt': {
     *                 functionName: 'timestamp',
     *               },
     *             },
     *             // Syntax 2: suing `className`
     *             fromJsonToJson: {
     *               'createAt, updatedAt': {
     *                 className: 'TimestampConvertor<DateTime, int>',
     *               },
     *             },
     *             // Syntax 2: suing `className`
     *             fromJsonToJson: {
     *               'createAt, updatedAt': 'TimestampConvertor<DateTime, int>',
     *             },
     *             // ...
     *           },
     *         },
     *       },
     *     },
     *   },
     * };
     * export default config;
     * ```
     *
     * ### Syntax 1: using `functionName`
     *
     * This will declare a function with a name `timestampToJson` that will an throw `Unimplemented Function Error`. You will need to implement the function manually.
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
     * ### Syntax 2 & 3: suing `className`
     *
     * Like the `functionName`, this will rather place the functions as method in a class using the name given.
     *
     * - This provides a better abstraction than the global functions. That's why `className` has a higher precedence than `functionName`
     *
     * ```dart filename="app_models.dart"
     * class TimestampConvertor implements JsonConverter<DateTime, int> {
     *     const TimestampConvertor();
     *
     *     @override
     *     DateTime fromJson(int json){
     *         throw Exception("You must implement `TimestampConvertor.fromJson` method in `app_models.dart`");
     *     }
     *
     *     @override
     *     int toJson(DateTime object){
     *         throw Exception("You must implement `TimestampConvertor.toJson` method in `app_models.dart`");
     *     }
     * }
     * ```
     *
     */
    fromJsonToJson?:
      | boolean
      | [GraphQLTypeFieldName, string, AppliesOnClass[], boolean]
      | Record<
          GraphQLTypeFieldName,
          | string
          | {
              name: string;
              useClassConverter?: boolean;
              appliesOn?: AppliesOnParameters[];
            }
        >;

    /**
     * @name immutable
     * @description  set to true to use the `@freezed` decorator or false to use the `@unfreezed` decorator
     * @default true
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       immutable: true
     *
     * ```
     */

    immutable?: boolean | [GraphQLTypeFieldName, AppliesOnClass[]];

    /**
     * @name makeCollectionsUnmodifiable
     * @description allows collections(lists/maps) to be modified even if class is immutable
     * @default undefined
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       makeCollectionsUnmodifiable: true
     *
     * ```
     */
    makeCollectionsUnmodifiable?: boolean | [GraphQLTypeFieldName, AppliesOnClass[]];

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
    mergeInputs?: [GraphQLTypeFieldName, GraphQLTypeFieldName[], AppliesOn[]];

    /**
     * @name mutableInputs
     * @description  since inputs will be used to collect data, it makes sense to make them mutable with Freezed's `@unfreezed` decorator. This overrides(in order words: has a higher precedence than) the `immutable` config value `ONLY` for GraphQL `input types`.
     * @default true
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       mutableInputs: true
     *
     * ```
     */
    mutableInputs?: boolean | [GraphQLTypeFieldName, AppliesOnClass[]];

    /**
     * @name privateEmptyConstructor
     * @description if true, defines a private empty constructor to allow getter and methods to work on the class
     * @default true
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       privateEmptyConstructor: true
     *
     * ```
     */
    privateEmptyConstructor?: boolean | [GraphQLTypeFieldName, AppliesOnClass[]];

    /**
     * @name unionKey
     * @description specify the key to be used for Freezed union/sealed classes
     * @default undefined
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       unionKey: 'type'
     *
     * ```
     */
    unionKey?: string;

    /**
     * @name unionValueCase
     * @description specify the casing style to be used for Freezed union/sealed classes
     * @default undefined
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       unionValueCase: 'FreezedUnionCase.pascal'
     *
     * ```
     */
    unionValueCase?: [GraphQLTypeFieldName, UnionValueCase, AppliesOnClass[]];
  };

  /**
   * @name ignoreTypes
   * @description names of GraphQL types to ignore when generating Freezed classes
   * @default []
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       ignoreTypes: ["PaginatorInfo"]
   *
   * ```
   */

  ignoreTypes?: GraphQLTypeFieldName[];
};
