import { indent } from '@graphql-codegen/visitor-plugin-common';
import { FieldName, TypeName } from '../models/type-field-name';
import { AppliesOnParameters, defaultFreezedPluginConfig, FlutterFreezedPluginConfig, FreezedOption } from '.';

// type GetFromConfig<T> = {
//   [P in keyof Required<T>]: (config: T) => T[P];
// };

// type Config<T> = T extends undefined ? never : T;

// type TypeConfig = Config<FlutterFreezedPluginConfig['typeConfig']>;

// type TypeConfigOption<O extends keyof T, T> = T[O];

// const copyWith: TypeConfigOption<'copyWith', TypeConfig> = true;
// console.log('🚀 ~ file: value-from-config.ts ~ line 35 ~ copyWith', copyWith);

// const valueFromConfig = (config: FlutterFreezedPluginConfig, option: ConfigOption) => {
//   //
// };

export class Config {
  static camelCasedEnums = (config: FlutterFreezedPluginConfig) => {
    const value = config['camelCasedEnums'];

    if (typeof value === 'boolean') {
      return value ? 'camelCase' : undefined;
    } else if (value !== undefined) {
      return value;
    }
  };

  static copyWith = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOption(config, 'copyWith', typeName);
  };

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOption(config, 'equal', typeName);
  };

  static fromJsonToJson = (
    config: FlutterFreezedPluginConfig,
    typeName?: TypeName,
    fieldName?: FieldName,
    appliesOn?: AppliesOnParameters[]
  ) => {
    const value = config['fromJsonToJson'];
    const expectedAppliesOn = appliesOn ?? [];

    if (typeof value === 'boolean') {
      return value;
    } else if (value !== undefined) {
      value.filter(([typeFieldName, classOrFunctionName, useClassConverter, appliesOn]) => {
        // global options
        // explicit option
        /*
     Human{
      id: {
        AppliesOnEnum
appliesOnEnumValue:{}
appliesOnClass:{}
appliesOnDefaultFactory:{}
appliesOnNamedFactory:{}
appliesOnDefaultParameters:{}
appliesOnNamedParametersForUnionTypes:{}
appliesOnNamedParametersForMergedInputs:{}
      }
     }
     */
      });

      // if(appliesOnBlock(appliesOn??[], expectedAppliesOn, true)){
      //   //
      // }
    }
  };

  static ignoreTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    return (
      (config.ignoreTypes?.filter(commaSeparatedTypeNames => commaSeparatedTypeNames.includes(typeName.value)).length ??
        0) > 0
    );
  };

  static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOption(config, 'immutable', typeName);
  };

  static makeCollectionsUnmodifiable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOption(config, 'makeCollectionsUnmodifiable', typeName);
  };

  static mergeInputs = (config: FlutterFreezedPluginConfig, typeName: TypeName, mergeWithTypeName: TypeName) => {
    // works with composition
    const value = config['mergeInputs'];
    return value?.filter(
      ([commaSeparatedTypeNames, mergeWithTypeNames]) =>
        commaSeparatedTypeNames.includes(typeName.value) &&
        mergeWithTypeNames.filter(commaSeparatedMergedTypeNames =>
          commaSeparatedMergedTypeNames.includes(mergeWithTypeName.value)
        ).length > 0
    );
  };
  static mutableInputs = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOption(config, 'mutableInputs', typeName);
  };

  static privateEmptyConstructor = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOption(config, 'privateEmptyConstructor', typeName);
  };

  static unionKey = (config: FlutterFreezedPluginConfig, unionTypeName?: TypeName): string | undefined => {
    return this.multiConstructorConfig(config, 1, unionTypeName) as string | undefined;
  };

  static unionValueCase = (config: FlutterFreezedPluginConfig, unionTypeName?: TypeName): string | undefined => {
    return this.multiConstructorConfig(config, 2, unionTypeName) as string | undefined;
  };

  static unionValueDecorator = (
    config: FlutterFreezedPluginConfig,
    unionTypeName: TypeName,
    unionValueTypeName: TypeName
  ) => {
    const unionValuesNameMap = this.multiConstructorConfig(config, 3, unionTypeName);
    if (unionValuesNameMap && typeof unionValuesNameMap !== 'string') {
      const unionValueName = unionValuesNameMap[unionValueTypeName.value];
      return indent(`@FreezedUnionValue('${unionValueName}')`); // TODO: add this to the factory block decorators
    }
    return '';
  };

  private static multiConstructorConfig = (
    config: FlutterFreezedPluginConfig,
    index: number,
    unionTypeName?: TypeName
  ) => {
    const value = config['fromJsonWithMultiConstructors'];
    if (Array.isArray(value)) {
      const v = value.find(([commaSeparatedUnionTypeNames]) =>
        TypeName.byPrecedence(unionTypeName?.value ?? '', commaSeparatedUnionTypeNames)
      );
      return v?.[index];
    }
  };

  private static freezedOption = (config: FlutterFreezedPluginConfig, option: FreezedOption, typeName?: TypeName) => {
    const value = config[option];

    if (Array.isArray(value)) {
      return typeName ? value.filter(v => v.includes(typeName.value)).length > 0 : undefined;
    } else if (typeof value === 'string') {
      return typeName ? value.includes(typeName.value) : undefined;
    }
    return value;
  };

  public static extend = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign(defaultFreezedPluginConfig, ...config);
  };
}
