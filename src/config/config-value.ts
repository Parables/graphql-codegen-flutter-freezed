import { indent } from '@graphql-codegen/visitor-plugin-common';

import { appliesOnBlock } from '../utils';
import {
  AppliesOn,
  AppliesOnFactory,
  AppliesOnParameters,
  DartIdentifierCasing,
  DART_SCALARS,
  defaultFreezedPluginConfig,
  FlutterFreezedPluginConfig,
  FreezedOption,
  TypeFieldNameOption,
} from './plugin-config';
import { FieldName, TypeFieldName, TypeName } from './type-field-name';

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
    return this.freezedOptionValue(config, 'copyWith', typeName);
  };

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  static defaultValues = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters[]
  ) => {
    const decorator = (value: string) => `@Default(${value})\n`;
    const result = this.typeFieldNameOptionValue(config, 'defaultValues', typeName, fieldName, appliesOn, 2, [1]);
    if (result.include) {
      return decorator(result.data[0]);
    }
    return undefined;
  };

  static deprecated = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    appliesOn: (AppliesOnFactory | AppliesOnParameters)[],
    fieldName?: FieldName
  ) => {
    // TODO: handle for multiple TypeNames
    const result = this.typeFieldNameOptionValue(config, 'deprecated', typeName, fieldName, appliesOn, 1);
    if (result.include) {
      return '@deprecated\n';
    }
    return undefined;
  };

  static escapeDartKeywords = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName?: FieldName,
    appliesOn?: AppliesOnParameters[]
  ) => {
    const value = config.escapeDartKeywords;
    if (value === true) {
      const d = /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//gim;
      const r = /(?<typeName>\w+)(?<!@\s*\*\s*TypeName)\s*\.\s*\[\s*(?<fieldNames>(\w+?,?\s*)*)\]/gim;
      return ['', '_', undefined];
    }
    const result = this.typeFieldNameOptionValue(
      config,
      'escapeDartKeywords',
      typeName,
      fieldName,
      appliesOn,
      4,
      [1, 2, 3]
    );
    if (result.include) {
      return result.data as [prefix?: string, suffix?: string, casing?: DartIdentifierCasing];
    }
    return undefined;
  };

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'equal', typeName);
  };

  static final = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters[]
  ) => {
    const result = this.typeFieldNameOptionValue(config, 'final', typeName, fieldName, appliesOn, 1);
    if (result.include) {
      return true;
    }
    return undefined;
  };

  static fromJsonToJson = (
    config: FlutterFreezedPluginConfig,
    typeName?: TypeName,
    fieldName?: FieldName,
    appliesOn?: AppliesOnParameters[]
  ) => {
    const value = config['fromJsonToJson'];
    // const expectedAppliesOn = appliesOn ?? [];

    if (typeof value === 'boolean') {
      return value;
    } else if (value !== undefined) {
      const result = this.typeFieldNameOptionValue(config, 'fromJsonToJson', typeName, fieldName, appliesOn, 3, [1, 2]);
      if (result.include) {
        return result.data;
      }
    }
    return undefined;
  };

  static ignoreTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    const value = config.ignoreTypes;
    return TypeName.matchesTypeNames(value, typeName);
  };

  static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'immutable', typeName);
  };

  static makeCollectionsUnmodifiable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'makeCollectionsUnmodifiable', typeName);
  };

  static mergeInputs = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    const value = config['mergeInputs'];
    return (
      value
        ?.filter(([graphQLTypeName]) => graphQLTypeName.includes(typeName.value))
        .map(([, mergeWithTypeNames]) => mergeWithTypeNames)
        .reduce(
          (acc, mergeWithTypeNames) => [
            ...acc,
            ...mergeWithTypeNames
              .map(typeName => typeName.split(/\s*,\s*/))
              .reduce((acc2, typeNames) => [...acc2, ...typeNames], []),
          ],
          []
        ) ?? []
    );
  };
  static mutableInputs = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'mutableInputs', typeName);
  };

  static privateEmptyConstructor = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOptionValue(config, 'privateEmptyConstructor', typeName);
  };

  static unionKey = (config: FlutterFreezedPluginConfig, unionTypeName?: TypeName): string | undefined => {
    return this.unionClassConfig(config, 1, unionTypeName) as string | undefined;
  };

  static unionValueCase = (config: FlutterFreezedPluginConfig, unionTypeName?: TypeName): string | undefined => {
    return this.unionClassConfig(config, 2, unionTypeName) as string | undefined;
  };

  static unionValueDecorator = (
    config: FlutterFreezedPluginConfig,
    unionTypeName: TypeName,
    unionValueTypeName: TypeName
  ) => {
    const unionValuesNameMap = this.unionClassConfig(config, 3, unionTypeName);
    if (unionValuesNameMap && typeof unionValuesNameMap !== 'string') {
      const unionValueName = unionValuesNameMap[unionValueTypeName.value];
      return indent(`@FreezedUnionValue('${unionValueName}')`); // TODO: add this to the factory block decorators
    }
    return undefined;
  };

  static unionClassConfig = (config: FlutterFreezedPluginConfig, index: number, unionTypeName?: TypeName) => {
    const value = config['unionClass'];
    // if (Array.isArray(value)) {
    const v = value.find(
      ([commaSeparatedUnionTypeNames]) =>
        unionTypeName?.value === commaSeparatedUnionTypeNames ||
        commaSeparatedUnionTypeNames.includes(unionTypeName?.value ?? TypeName.allTypeNames)
    );
    return v?.[index];
    // }
  };

  static freezedOptionValue = (config: FlutterFreezedPluginConfig, option: FreezedOption, typeName?: TypeName) => {
    const value = config[option];
    if (typeof value === 'boolean' || value === undefined) return value;
    return TypeName.matchesTypeNames(value, typeName);
  };

  public static typeFieldNameOptionValue = (
    config: FlutterFreezedPluginConfig,
    option: TypeFieldNameOption,
    typeName: TypeName,
    fieldName: FieldName,
    expectedAppliesOn: readonly AppliesOn[],
    appliesOnIndex: number,
    dataIndexes?: number[]
  ) => {
    const value = config[option];
    let include: boolean | undefined = undefined;
    let data: any[] | undefined = undefined;

    if (Array.isArray(value)) {
      value.forEach((v: any[]) => {
        const typeFieldNames = v[0];
        data = dataIndexes?.map(i => v[i]);
        const appliesOn = v[appliesOnIndex] ?? [];
        const canApply = appliesOnBlock(appliesOn, expectedAppliesOn, true);
        if (typeof typeFieldNames === 'string') {
          typeFieldNames
            .split(/\s*;\s*/)
            .filter(t => t.length > 0)
            .forEach(typeFieldName => {
              if (canApply) {
                include = TypeFieldName.attemptTypeFieldNameMatches(`${typeFieldName};`, typeName, fieldName);
              }
            });
        }
      });
    }

    return { include, data };
  };

  public static create = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign({}, defaultFreezedPluginConfig, ...config);
  };
}
