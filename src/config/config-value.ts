import { appliesOnBlock } from '../utils';
import { FieldName, Pattern, TypeName, TypeNamePattern } from './pattern-new';
import {
  AppliesOn,
  AppliesOnFactory,
  AppliesOnParameters,
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

    const initialValue: [value: string, directiveName?: string, directiveArgName?: string] = undefined;

    return config.defaultValues
      ?.map(([pattern, value, configAppliesOn, ...directives]) => {
        const shouldEnable =
          Pattern.findLastConfiguration(pattern, typeName, fieldName) &&
          appliesOnBlock(configAppliesOn, blockAppliesOn);
        return [shouldEnable, value, ...directives];
      })
      ?.reduce((_acc, cur) => {
        if (cur[0]) {
          return cur;
        }
        return initialValue;
      }, initialValue)
      .slice(1) as typeof initialValue;
  };

  static deprecated = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName?: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnFactory | AppliesOnParameters> = []
  ) => {
    const initialValue = false;
    return config.deprecated
      ?.map(
        ([pattern, configAppliesOn]) =>
          Pattern.findLastConfiguration(pattern, typeName, fieldName) && appliesOnBlock(configAppliesOn, blockAppliesOn)
      )
      ?.reduce((_acc, cur) => cur, initialValue);
  };

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.equal, typeName);
  };

  static escapeDartKeywords = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName?: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOn> = []
  ): [prefix?: string, suffix?: string] => {
    const escapeDartKeywords = config.escapeDartKeywords;
    const initialValue: [prefix?: string, suffix?: string] = ['', ''];
    if (escapeDartKeywords === true) {
      return ['', '_']; // use a suffix `_`
    } else if (escapeDartKeywords === false) {
      return initialValue; // no suffix
    }
    // else escapeDartKeywords was configured using a pattern
    return escapeDartKeywords
      ?.map(([pattern, prefix, suffix, configAppliesOn]) => {
        const shouldEnable =
          Pattern.findLastConfiguration(pattern, typeName, fieldName) &&
          appliesOnBlock(configAppliesOn, blockAppliesOn);
        return [shouldEnable, prefix, suffix] as [shouldEnable: boolean, prefix?: string, suffix?: string];
      })
      ?.reduce(
        (_acc, cur) => {
          if (cur[0] === true) {
            return cur;
          }
          return [false, ...initialValue];
        },
        [false, ...initialValue]
      )
      ?.slice(1) as typeof initialValue;
  };

  static final = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnParameters> = []
  ): boolean => {
    return config.final
      ?.map(
        ([pattern, configAppliesOn]) =>
          Pattern.findLastConfiguration(pattern, typeName, fieldName) && appliesOnBlock(configAppliesOn, blockAppliesOn)
      )
      ?.reduce((_acc, cur) => cur, false);
  };

  static fromJsonToJson = (
    config: FlutterFreezedPluginConfig,
    typeName?: TypeName,
    fieldName?: FieldName,
    blockAppliesOn: ReadonlyArray<AppliesOnParameters> = []
  ) => {
    const fromJsonToJson = config.fromJsonToJson;

    if (typeName && fieldName && Array.isArray(fromJsonToJson)) {
      return fromJsonToJson
        .map(([pattern, classOrFunctionName, useClassConverter, appliesOn]) => {
          const shouldEnable =
            Pattern.findLastConfiguration(pattern, typeName, fieldName) && appliesOnBlock(appliesOn, blockAppliesOn);
          return [shouldEnable, classOrFunctionName, useClassConverter];
        })
        .reduce((_acc, cur) => {
          if (cur[0]) {
            return cur;
          }
          return undefined;
        })
        ?.slice(1) as [classOrFunctionName: string, useClassConverter?: boolean];
    } else if (typeName && fromJsonToJson instanceof TypeNamePattern) {
      return Pattern.findLastConfiguration(fromJsonToJson, typeName);
    }
    // else if(typeof fromJsonToJson === 'boolean'){
    //   return fromJsonToJson
    // }
    return fromJsonToJson as boolean;
  };

  static ignoreTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName): string[] => {
    const ignoreTypes = config.ignoreTypes;
    if (ignoreTypes) {
      const isIgnored = Pattern.findLastConfiguration(ignoreTypes, typeName);
      return isIgnored ? [typeName.value] : [];
    }
    return [];
  };

  static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.immutable, typeName);
  };

  static makeCollectionsUnmodifiable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return Config.enableWithBooleanOrTypeFieldName(config.makeCollectionsUnmodifiable, typeName);
  };

  static mergeTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    return config.mergeTypes?.[typeName.value] ?? [];
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
