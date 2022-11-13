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
  | 'named_factory_for_merged_inputs' // applies on the named factory constructors for a GraphQL Input Type when it appears in a class as a named factory constructor and that class was generated for a GraphQL Object Type and it Type is to be merged with the GraphQL Object Type. E.g: `CreateMovieInput` merged with `Movie` in the StarWars Schema
  | 'parameter' // applies on all parameters for both default constructors and named factory constructors
  | 'default_factory_parameter' // applies on parameters for ONLY default constructors for a specified(or all when the `*` is used as the key) field on a GraphQL Object/Input Type
  | 'named_factory_parameter' // applies on parameters for all named factory constructors for a specified(or all when the `*` is used as the key) field on a GraphQL Object/Input Type
  | 'named_factory_parameter_for_union_types' // like `named_factory_parameters` but ONLY for a parameter in a named factory constructor which for a GraphQL Union Type
  | 'named_factory_parameter_for_merged_inputs'; // like `named_factory_parameters` but ONLY for a parameter in a named factory constructor which for a GraphQL Input Type that is merged inside an a class generated for a GraphQL Object Type

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

// TODO: get this from config or use default or build withPrefix or withSuffix
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

export type DartKeyword = keyof typeof DART_KEYWORDS;

export type DartKeywordType = 'built-in' | 'context' | 'reserved' | 'async-reserved';

export type DartIdentifierCasing = 'snake_case' | 'camelCase' | 'PascalCase';

/**
 * @name FlutterFreezedPluginConfig
 * @description configure the `flutter-freezed` plugin
 */
export type FlutterFreezedPluginConfig /* extends TypeScriptPluginConfig */ = {
  /**
   * @name allKey
   * @description the `allKey` is sued when you want to set the same config options value to every item or on the root object
   * @default "@*"
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       rootKey: "@all"
   *
   * ```
   */
  allKey?: string;

  /**
   * @name camelCasedEnums
   * @description Dart's recommended lint uses camelCase for enum fields. Set this option to `false` to use the same case as used in the GraphQL Schema but note this can cause lint issues.
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

  customScalars?: { [name: string]: string };

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
   * @name graphQLTypeConfig
   * @description The GraphQL Type name is used as the key. Use `allKey` config value to set global 
   * @default undefined
   *
   * @exampleMarkdown
   * ```yaml

  * ```
  */

  graphQLTypeConfig?: Record<string, GraphQLTypeConfig>;

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

export type GraphQLTypeConfig = {
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

  alwaysUseJsonKeyName?: boolean | Record<string, AppliesOn[]>;

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

  copyWith?: Record<string, AppliesOn[]>;

  /**
   * @name customDecorators
   * @description annotate/decorate the generated output. Also use this option to map GraphQL directives to freezed decorators.
   * @default {}
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       customDecorators: {
   *          'default' : {
   *             mapsToFreezedAs: '@Default',
   *             arguments: ['$0'],
   *            },
   *           'deprecated' : {
   *              mapsToFreezedAs: '@deprecated',
   *           },
   *          'readonly' : {
   *              mapsToFreezedAs: 'final',
   *           },
   *          '@Assert' : {
   *              mapsToFreezedAs: 'custom',
   *              applyOn: ['class_factory','union_factory'], # @Assert should ONLY be used on factories
   *              arguments: [
   *                  '(email != null && email != "") || (phoneNumber != null && phoneNumber != "")',
   *                  'provide either an email or a phoneNumber',
   *              ],
   *           }, # custom are used just as it given
   *       }
   *
   * ```
   */

  customDecorators?: Record<
    string,
    Record<
      string,
      {
        /**
         * @name arguments
         * @description Arguments to be applied on the decorator. if the `mapsToFreezedAs === 'directive'`,  use template string such `['$0', '$2', '$3']` to select/order the arguments of the directive to be used($0 is the first argument, $1 is the second).
         * @default undefined
         * @exampleMarkdown
         * ```yaml
         * arguments: [$0] # $0 is the first argument, $1 is the 2nd ...
         * ```
         */
        arguments?: string[]; //['$0']

        /**
         * @name applyOn
         * @description Specify where the decorator should be applied
         * @exampleMarkdown
         * ```yaml
         * applyOn: ['class_factory','union_factory'], # applies this decorator on both class and union factory blocks
         * ```
         */
        applyOn: AppliesOn[];

        /**
         * @name mapsToFreezedAs
         * @description maps to a Freezed decorator or use `custom` to use a custom decorator.If `mapsToFreezedAs === 'directive'` don't include the `@` prefix in the key of the customDecorator.  If `mapsToFreezedAs === 'custom'` value, whatever you use as the key of the customDecorator is used just as it is, and the arguments spread into a parenthesis () */
        mapsToFreezedAs: '@Default' | '@deprecated' | 'final' | 'directive' | 'custom';
      }
    >
  >;

  /**
   * @name defaultValue
   * @description annotate a field with a @Default(value: defaultValue) decorator
   * @default undefined
   */

  defaultValue?: Record<string, { value: string; valueAsString?: boolean; appliesOn: AppliesOn[] }>;

  /**
   * @name deprecated
   * @description a list of field Names to be marked as deprecated. Include the rootKey to mark the whole
   * @default undefined
   */

  deprecated?: Record<string, AppliesOn[]>;

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
    | boolean
    | Record<
        string,
        {
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
        }
      >;

  /**
   * @name final
   * @description  a list of field Names to be marked as final
   * @default undefined
   */

  final?: Record<string, AppliesOn[]>;

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
    | Record<string, string | { functionName: string; className: string; appliesOn: AppliesOn[] }>;

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
  mergeInputs?: string[];

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
  unionValueCase?: 'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal';
};

export type KeyOfTypeConfig = keyof GraphQLTypeConfig;
