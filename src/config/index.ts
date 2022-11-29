import { indent } from '@graphql-codegen/visitor-plugin-common';
import { appliesOnBlock } from '../utils';
import {
  FlutterFreezedPluginConfig,
  AppliesOnParameters,
  FreezedOption,
  defaultFreezedPluginConfig,
  DART_SCALARS,
  GraphQLTypeFieldName,
} from './config';
import { TypeName, FieldName } from './type-field-name';

export class Config {
  //#region RegExp patterns
  static matchesTypeNameFieldName = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern = new RegExp(`${typeName.value}\\s*\\.\\s*\\[\\s*((\\w+?,?\\s*)*)\\]`, 'gim');
  };

  static matchesTypeNameAnyFieldNameExcept = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern = new RegExp(
      `${typeName.value}\\s*.\\s*@\\s*\\*\\s*FieldName\\s*-\\s*\\[\\s*((\\w+?,?\\s*)*)\\]`,
      'gim'
    );
  };

  static matchesTypeNameAnyFieldName = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern = new RegExp(`${typeName.value}\\*.\\s*@\\s*\\*\\s*FieldName\\s*,?[^-\\s*]`, 'gim');
  };

  static matchesAnyTypeNameFieldName = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern = /@\s*\*\s*TypeName\s*\.\s*\[\s*((\w+?,?\s*)*)\]/gim;
  };

  static matchesAnyTypeNameExceptFieldName = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    // /Droid\s*\.\s*\[\s*(?:(\w+?,?\s*)*)(id,?\s*)(?:(\w+?,?\s*)*)\]/gim

    const pattern = /@\s*\*\s*TypeName\s*-\s*\[\s*((\w+?,?\s*)*)\]\s*\.\s*\[\s*((\w+?,?\s*)*)\]/gim;
  };

  static matchesAnyTypeNameExceptAnyFieldNameExcept = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern =
      /@\s*\*\s*TypeName\s*-\s*\[\s*((\w+?,?\s*)*)\]\s*.\s*@\s*\*\s*FieldName\s*-\s*\[\s*((\w+?,?\s*)*)\]/gim;
  };

  static matchesAnyTypeNameExceptAnyFieldName = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern = /@\s*\*\s*TypeName\s*-\s*\[\s*((\w+?,?\s*)*)\]\s*.\s*@\s*\*\s*FieldName\s*,?[^-\s*]/gim;
  };

  static matchesAnyTypeNameAnyFieldNameExcept = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern = /@\s*\*\s*TypeName\s*.\s*@\s*\*\s*FieldName\s*-\s*\[\s*((\w+?,?\s*)*)\]/gim;
  };

  static matchesAnyTypeNameAnyFieldName = (
    config: FlutterFreezedPluginConfig,
    graphQLTypeFieldName: GraphQLTypeFieldName,
    typeName: TypeName,
    fieldNames: FieldName[]
  ) => {
    const pattern = /@\s*\*\s*TypeName\s*.\s*@\s*\*\s*FieldName\s*,?[^-\s*]/gim;
  };
  //#endregion

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

  static defaultValueDecorator = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    appliesOn: AppliesOnParameters
  ) => {
    const decorator = (value: string) => `@Default(${value})`;
  };

  static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
    return this.freezedOption(config, 'equal', typeName);
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
