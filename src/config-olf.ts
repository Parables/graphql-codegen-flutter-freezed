

export type GetFromConfig<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: (config: T) => T[P];
};

export type FromConfig = GetFromConfig<TypeConfig>;


//#region string type alias
export type GlobalName = string;

type JsonConvertorClassName = string;
type FromToJsonFunctionName = string;

type GraphQLScalarType = string;
type DartCompatibleType = string;

export type Decorator = string;

//#endregion

//#region custom config

export type EscapeDartKeywordConfig = {
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

//#endregion


type CamelCasedEnums = 

export type DartKeyword = keyof typeof DART_KEYWORDS;

export type DartKeywordType = 'built-in' | 'context' | 'reserved' | 'async-reserved';


export type EscapeDartKeywords = boolean | Record<FieldName, EscapeDartKeywordConfig>;

export type DefaultValueConfig = ;

export type DefaultFieldValues = Record<FieldName, DefaultValueConfig>;

export type DeprecatedFields = Record<FieldName, AppliesOn[]>;

export type FinalFieldValues = Record<FieldName, AppliesOnParameters[]>;

export type FromToJsonConfig = {
  name: JsonConvertorClassName | FromToJsonFunctionName;
  useClassConverter?: boolean;
  appliesOn?: AppliesOnParameters[];
};

export type FromJsonToJson = boolean | Record<FieldName, JsonConvertorClassName | FromToJsonConfig>;

type GlobalNameConfig = 
export type MergeInputs = GraphQLTypeFieldName[];


/** initializes a FreezedPluginConfig with the defaults values */
export const defaultFreezedPluginConfig: FlutterFreezedPluginConfig = {
  globalName: { graphQLTypeFieldName: '@*TypeName', fieldName: '@*FieldName' },
  camelCasedEnums: true,
  customScalars: {},
  fileName: 'app_models',
  typeConfig: {},
  ignoreTypes: [],
};

/** initializes a TypeConfig with the defaults values */
export const defaultTypeConfig: TypeConfig = {
  alwaysUseJsonKeyName: undefined,
  copyWith: undefined,
  defaultValue: undefined,
  deprecated: undefined,
  equal: undefined,
  escapeDartKeywords: true,
  final: undefined,
  fromJsonToJson: true,
  immutable: true,
  makeCollectionsUnmodifiable: undefined,
  mergeInputs: undefined,
  mutableInputs: true,
  privateEmptyConstructor: true,
  unionKey: undefined,
  unionValueCase: undefined,
};
