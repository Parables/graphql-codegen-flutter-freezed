import { indent } from '@graphql-codegen/visitor-plugin-common';
import { appliesOnBlock } from '../utils';
import {
  FlutterFreezedPluginConfig,
  AppliesOnParameters,
  FreezedOption,
  defaultFreezedPluginConfig,
  DART_SCALARS,
  TypeFieldNameOption,
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
    return undefined;
  };

  static copyWith = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.typeNameOptionValue(config, 'copyWith', typeName);
  };

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config?.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  static defaultValueDecorator = () =>
    // config: FlutterFreezedPluginConfig,
    // typeName: TypeName,
    // fieldName: FieldName,
    // appliesOn: AppliesOnParameters
    {
      // const decorator = (value: string) => `@Default(${value})`;
    };

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.typeNameOptionValue(config, 'equal', typeName);
  };

  static markFinal = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters[]
  ) => {
    const expectedAppliesOn = appliesOn;
    let final = false;
    const regexp3 = /@\*TypeName\.@\*FieldName-\[((\w+,?)+)\],?/gim;
    const regexp1 = /\w+\.@\*FieldName-\[((\w+,?)+)\]/gim;

    config.final?.forEach(([typeFieldName, appliesOn]) => {
      const fieldNames = typeFieldName
        .replace(regexp3, '$1,')
        .split(',')
        .filter(v => v.length > 0);

      if (regexp3.test(typeFieldName) && appliesOnBlock(appliesOn, expectedAppliesOn, true)) {
        if (fieldNames.includes(fieldName.value)) {
          final = false;
        } else {
          final = true;
        }
      }

      if (
        (regexp3.test(typeFieldName) || regexp1.test(typeFieldName)) &&
        fieldNames.includes(fieldName.value) &&
        appliesOnBlock(appliesOn, expectedAppliesOn, true)
      ) {
        final = false;
      }

      if (regexp3.test(typeFieldName)) {
        final = true;
      }
    });

    return final;
  };

  static fromJsonToJson = (
    config: FlutterFreezedPluginConfig
    // typeName?: TypeName,
    // fieldName?: FieldName,
    // appliesOn?: AppliesOnParameters[]
  ) => {
    const value = config['fromJsonToJson'];
    // const expectedAppliesOn = appliesOn ?? [];

    if (typeof value === 'boolean') {
      return value;
    } else if (value !== undefined) {
      // TODO: Like CSS find the most explicit value, or fallback to the most general value
    }
    return true;
  };

  static ignoreTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    const value = config.ignoreTypes;
    return TypeName.matchesTypeNames(value, typeName);
  };

  static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.typeNameOptionValue(config, 'immutable', typeName);
  };

  static makeCollectionsUnmodifiable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.typeNameOptionValue(config, 'makeCollectionsUnmodifiable', typeName);
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
    return this.typeNameOptionValue(config, 'mutableInputs', typeName);
  };

  static privateEmptyConstructor = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.typeNameOptionValue(config, 'privateEmptyConstructor', typeName);
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
    // if (Array.isArray(value)) {
    const v = value.find(
      ([commaSeparatedUnionTypeNames]) =>
        unionTypeName?.value === commaSeparatedUnionTypeNames ||
        commaSeparatedUnionTypeNames.includes(unionTypeName.value ?? TypeName.anyTypeName)
    );
    return v?.[index];
    // }
  };

  static typeNameOptionValue = (config: FlutterFreezedPluginConfig, option: FreezedOption, typeName?: TypeName) => {
    const value = config[option];
    if (typeof value === 'boolean' || value === undefined) return value;
    return TypeName.matchesTypeNames(value, typeName);
  };

  static typeFieldNameOptionValue = (
    config: FlutterFreezedPluginConfig,
    option: TypeFieldNameOption,
    typeName: TypeName,
    fieldName: FieldName,
    dataIndicies: number[]
  ) => {
    const value = config[option];

    if (Array.isArray(value)) {
      const typeFieldNameList = value.forEach(v => {
        // TODO:
      });
    }
  };
  public static create = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign(defaultFreezedPluginConfig, ...config);
  };
}
