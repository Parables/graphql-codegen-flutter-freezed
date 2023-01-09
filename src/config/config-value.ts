import { appliesOnBlock } from '../utils';
import { FieldName, Pattern, TypeName, TypeNamePattern } from './pattern-new';
import {
  AppliesOnParameters,
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

  static copyWith = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.copyWith, typeName);
  };

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  static defaultValues = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnParameters> = []
  ) => {
    // TODO: Use this decorator function in the blocks instead
    // const decorator = (defaultValue: string) => `@Default(${defaultValue})\n`;

    return config.defaultValues
      ?.map(([pattern, value, configAppliesOn, ...directives]) => {
        const configure =
          Pattern.findLastConfiguration(pattern, typeName, fieldName) &&
          appliesOnBlock(configAppliesOn, blockAppliesOn);
        return [configure, value, ...directives] as [
          configure: boolean,
          value: string,
          directiveName?: string,
          directiveArgName?: string
        ];
      })
      .reduce((_acc, cur) => {
        if (cur[0] === true) {
          return cur;
        }
        return undefined;
      });
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

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.equal, typeName);
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

  static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.immutable, typeName);
  };

  static makeCollectionsUnmodifiable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.makeCollectionsUnmodifiable, typeName);
  };

  static mergeTypes = (/* config: FlutterFreezedPluginConfig, typeName: TypeName */) => {
    return [];
  };

  static mutableInputs = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.mutableInputs, typeName);
  };

  static privateEmptyConstructor = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.privateEmptyConstructor, typeName);
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

  static enableWithBooleanOrTypeFieldName = (value?: boolean | TypeNamePattern, typeName?: TypeName) => {
    if (typeof value === 'boolean') {
      return value;
    } else if (value !== undefined && typeName !== undefined) {
      return Pattern.findLastConfiguration(value, typeName);
    }
    return undefined;
  };

  public static create = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign({}, defaultFreezedPluginConfig, ...config);
  };
}
