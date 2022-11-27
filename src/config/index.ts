import { indent } from '@graphql-codegen/visitor-plugin-common';
import {
  FlutterFreezedPluginConfig,
  AppliesOnParameters,
  FreezedOption,
  defaultFreezedPluginConfig,
  DART_SCALARS,
} from './config';
import { TypeName, FieldName } from './type-field-name';

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

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config?.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  static defaultValues = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters
  ) => {
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
      // TODO: Like CSS find the most explicit value, or fallback to the most general value
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

  static mergeInputs = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    // works with composition
    const value = config['mergeInputs'];
    return (
      value
        ?.filter(([graphQLTypeName]) => graphQLTypeName.includes(typeName.value))
        .map(([, mergeWithTypeNames]) => mergeWithTypeNames)
        .reduce(
          (acc, mergeWithTypeNames) => [
            ...acc,
            ...mergeWithTypeNames
              .map(typeName => typeName.split(','))
              .reduce((acc2, typeNames) => [...acc2, ...typeNames], []),
          ],
          []
        ) ?? []
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

  public static unpackConfig = (config: FlutterFreezedPluginConfig, typeName: TypeName, fieldName: FieldName) => {
    const result = {
      specific: undefined,
      general: undefined,
    };

    return result;
  };

  public static extend = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign(defaultFreezedPluginConfig, ...config);
  };
}

export * from './config';
export * from './node-repository';
export * from './type-field-name';
