import { AppliesOnFactory, AppliesOnParameters } from '.';

/**
 * @name GraphQLGraphQLTypeFieldName
 * @description A comma-separated string of GraphQL Type and Field Names separated with a `.` .Use the `globalName` to apply the same config options to all GraphQL Types.
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
export type GraphQLTypeFieldName = string;

/**
 * @name FlutterFreezedPluginConfig
 * @description configure the `flutter-freezed` plugin
 */
export type FlutterFreezedPluginConfig = {
  /**
     * @name camelCasedEnums
     * @type boolean // TODO: do the same for all config options
     * @description Dart's recommended lint uses camelCase for enum fields. You can specify your preferred casing. Set this option to `false` to use the same case as used in the GraphQL Schema but note this can cause lint issues.
     * @default true
     *
     * @exampleMarkdown
      ```yaml
      generates:
        flutter_app/lib/data/models/app_models.dart
          plugins:
            - flutter-freezed
          config:
            camelCasedEnums: true
      ```
     */
  camelCasedEnums?: boolean | DartIdentifierCasing;

  /**
     * @name customScalars
     * @description map GraphQL Scalar Types to Dart built-in types
     * @default {}
     *
     * @exampleMarkdown
     * ```yaml
      generates:
        flutter_app/lib/data/models/app_models.dart
          plugins:
            - flutter-freezed
          config:
            customScalars: {
              "jsonb": "Map<String, dynamic>",
              "timestamptz": "DateTime",
              "UUID": "String",
            }
     * ```
     */

  customScalars?: Record<string, string>;

  /**
   * @name fileName
   * @description this fileName will be used for the generated output file
   * @default "app_models"
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       fileName: app_models
   * ```
   */

  fileName?: string;

  /**
   * @name globalName
   * @description the `globalName` is used when you want to set the same config options value to every item or on the root object
   * @default "@*"
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       globalName: "@all"
   *
   * ```
   */
  globalName?: {
    typeName?: string;
    fieldName?: string;
  };

  /**
     * @name typeConfig
     * @description The GraphQL Type name is used as the key. Use `allKey` config value to set global 
     * @default undefined
     *
     * @exampleMarkdown
     * ```yaml
  
    * ```
    */

  typeConfig?: {
    /**
     * @name alwaysUseJsonKeyName
     * @description Use @JsonKey(name: 'name') even if the name is already camelCased
     * @default false
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       alwaysUseJsonKeyName: true
     *
     * ```
     */

    alwaysUseJsonKeyName?: boolean | [GraphQLTypeFieldName, AppliesOnParameters[]][];

    /**
     * @name copyWith
     * @description set to false to disable Freezed copyWith method helper
     * @default undefined
     *
     * @exampleMarkdown
     * ```yaml
     * generates:
     *   flutter_app/lib/data/models/app_models.dart
     *     plugins:
     *       - flutter-freezed
     *     config:
     *       copyWith: false
     * ```
     */

    copyWith?: boolean | [GraphQLTypeFieldName, AppliesOnClass[]];

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

    escapeDartKeywords?: EscapeDartKeywords;

    /**
     * @name final
     * @description  a list of field Names to be marked as final
     * @default undefined
     */

    final?: FinalFieldValues;

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
    fromJsonToJson?: FromJsonToJson;

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

    immutable?: boolean;

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
    makeCollectionsUnmodifiable?: boolean;

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
    mergeInputs?: MergeInputs;

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
    mutableInputs?: boolean;

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
    privateEmptyConstructor?: boolean;

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
    unionValueCase?: UnionValueCase;
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

  ignoreTypes?: string[];
};
