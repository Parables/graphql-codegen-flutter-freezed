import {
  DartIdentifierCasing,
  DART_SCALARS,
  defaultFreezedPluginConfig,
  FlutterFreezedPluginConfig,
} from './plugin-config';

export class Config {
  static camelCasedEnums = (config: FlutterFreezedPluginConfig) => {
    const _camelCasedEnums = config.camelCasedEnums;

    if (_camelCasedEnums === true) {
      return 'camelCase';
    } else if (_camelCasedEnums === false) {
      return undefined;
    }
    return _camelCasedEnums;
  };

  static copyWith = (config: FlutterFreezedPluginConfig /* typeName?: TypeName */) => {
    const copyWith = config.copyWith;
    if (typeof copyWith === 'boolean') {
      return copyWith;
    }
    // TODO: handle Pattern configuration
    return undefined;
  };

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  static defaultValues = () =>
    /*    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnParameters> = [] */
    {
      // TODO: Use this decorator function in the blocks instead
      // const decorator = (defaultValue: string) => `@Default(${defaultValue})\n`;

      // const defaultValues = config.defaultValues;

      return undefined;
    };

  static deprecated = () =>
    /*   config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName?: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnFactory | AppliesOnParameters> = [] */
    {
      // const deprecated = config.deprecated;

      return undefined;
    };

  static equal = (/* config: FlutterFreezedPluginConfig, typeName?: TypeName */) => {
    return undefined;
  };

  static escapeDartKeywords = (
    config: FlutterFreezedPluginConfig
    /*  typeName: TypeName,
    fieldName?: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOn> = [] */
  ): [prefix?: string, suffix?: string, casing?: DartIdentifierCasing] => {
    const _escapeDartKeywords = config.escapeDartKeywords;

    /*    if (_escapeDartKeywords === true) {
      return ['', '_', undefined]; // use a suffix `_`
    } else */ if (_escapeDartKeywords === false) {
      return ['', '', undefined]; // no suffix
    }

    // return default value
    return ['', '_', undefined]; // use a suffix `_`
  };

  static final = () =>
    /*    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnParameters> = [] */
    {
      // const final = config.final;

      return undefined;
    };

  static fromJsonToJson = () =>
    /* config: FlutterFreezedPluginConfig
    typeName?: TypeName,
    fieldName?: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnParameters> = [] */
    {
      // const fromJsonToJson = config.fromJsonToJson;

      return true;
    };

  static ignoreTypes = (/* config: FlutterFreezedPluginConfig, typeName: TypeName */): string[] => {
    return [];
  };

  static immutable = (/* config: FlutterFreezedPluginConfig, typeName?: TypeName */) => {
    return true;
  };

  static makeCollectionsUnmodifiable = (/* config: FlutterFreezedPluginConfig, typeName?: TypeName */) => {
    return undefined;
  };

  static mergeTypes = (/* config: FlutterFreezedPluginConfig, typeName: TypeName */) => {
    return [];
  };

  static mutableInputs = (/* config: FlutterFreezedPluginConfig, typeName?: TypeName */) => {
    return true;
  };

  static privateEmptyConstructor = (/* config: FlutterFreezedPluginConfig, typeName?: TypeName */) => {
    return true;
  };

  static unionClass = (/* config: FlutterFreezedPluginConfig, index: number, unionTypeName: TypeName */) => {
    // const unionClass = config['unionClass'];

    return undefined;
  };

  static unionKey = (/* config: FlutterFreezedPluginConfig, typeName: TypeName */): string | undefined => {
    return undefined;
  };

  static unionValueCase = (/* config: FlutterFreezedPluginConfig, typeName: TypeName */): string | undefined => {
    return undefined;
  };

  static unionValueDecorator = () =>
    /*  config: FlutterFreezedPluginConfig,
    unionTypeName: TypeName,
    unionValueTypeName: TypeName */
    {
      return undefined;
    };

  public static create = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign({}, defaultFreezedPluginConfig, ...config);
  };
}
