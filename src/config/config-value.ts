import { DART_SCALARS, defaultFreezedPluginConfig, FlutterFreezedPluginConfig } from './plugin-config';
import { FieldName, Pattern, TypeName } from './pattern';

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

  // static copyWith = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
  //   return this.freezedOptionValue(config, 'copyWith', typeName);
  // };

  static customScalars = (config: FlutterFreezedPluginConfig, graphqlScalar: string): string => {
    return config.customScalars?.[graphqlScalar] ?? DART_SCALARS[graphqlScalar] ?? graphqlScalar;
  };

  // static defaultValues = (
  //   config: FlutterFreezedPluginConfig,
  //   typeName: TypeName,
  //   fieldName: FieldName,
  //   blockAppliesOn: ReadonlyArray<AppliesOnParameters> = []
  // ) => {
  //   // TODO: Use this decorator function in the blocks instead
  //   // const decorator = (defaultValue: string) => `@Default(${defaultValue})\n`;

  //   const _defaultValues = config.defaultValues;

  //   const typeFieldNames = _defaultValues.map(([_typeFieldName]) => _typeFieldName);
  //   const { lastIndex, shouldConfigure } = this.findLastConfiguration(typeFieldNames, typeName, fieldName);
  //   if (shouldConfigure && lastIndex !== undefined && _defaultValues[lastIndex]) {
  //     const [, defaultValue, configAppliesOn, directiveName, directiveArgName] = _defaultValues[lastIndex];
  //     if (appliesOnBlock(configAppliesOn, blockAppliesOn)) {
  //       return [defaultValue, directiveName, directiveArgName];
  //     }
  //   }
  //   return undefined;
  // };

  // static deprecated = (
  //   config: FlutterFreezedPluginConfig,
  //   typeName: TypeName,
  //   fieldName?: FieldName,
  //   blockAppliesOn: ReadonlyArray<AppliesOnFactory | AppliesOnParameters> = []
  // ) => {
  //   const _deprecated = config.deprecated;

  //   const typeFieldNames = _deprecated.map(([_typeFieldName]) => _typeFieldName);
  //   const lastPatternIndex = this.findLastConfiguration(typeFieldNames, typeName, fieldName);
  //   if (lastPatternIndex !== undefined && _deprecated[lastPatternIndex]) {
  //     const [, configAppliesOn] = _deprecated[lastPatternIndex];
  //     if (appliesOnBlock(configAppliesOn, blockAppliesOn)) {
  //       return '@deprecated\n';
  //     }
  //   }
  //   return undefined;
  // };

  // static escapeDartKeywords = (
  //   config: FlutterFreezedPluginConfig,
  //   typeName: TypeName,
  //   fieldName?: FieldName,
  //   blockAppliesOn: ReadonlyArray<AppliesOn> = []
  // ): [prefix?: string, suffix?: string, casing?: DartIdentifierCasing] => {
  //   const _escapeDartKeywords = config.escapeDartKeywords;
  //   if (_escapeDartKeywords === true) {
  //     return ['', '_', undefined]; // use a suffix `_`
  //   } else if (_escapeDartKeywords === false) {
  //     return ['', '', undefined]; // no suffix
  //   }

  //   const typeFieldNames = _escapeDartKeywords.map(([_typeFieldName]) => _typeFieldName);
  //   const lastPatternIndex = this.findLastConfiguration(typeFieldNames, typeName, fieldName);
  //   if (lastPatternIndex !== undefined && _escapeDartKeywords[lastPatternIndex]) {
  //     const [, prefix, suffix, casing, configAppliesOn] = _escapeDartKeywords[lastPatternIndex];
  //     if (appliesOnBlock(configAppliesOn, blockAppliesOn)) {
  //       return [prefix, suffix, casing];
  //     }
  //   }
  //   return undefined;
  // };

  // static equal = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
  //   return this.freezedOptionValue(config, 'equal', typeName);
  // };

  // static final = (
  //   config: FlutterFreezedPluginConfig,
  //   typeName: TypeName,
  //   fieldName: FieldName,
  //   blockAppliesOn: ReadonlyArray<AppliesOnParameters> = []
  // ) => {
  //   const _final = config.final;

  //   const typeFieldNames = _final.map(([_typeFieldName]) => _typeFieldName);
  //   const lastPatternIndex = this.findLastConfiguration(typeFieldNames, typeName, fieldName);
  //   if (lastPatternIndex !== undefined && _final[lastPatternIndex]) {
  //     const [, configAppliesOn] = _final[lastPatternIndex];
  //     if (appliesOnBlock(configAppliesOn, blockAppliesOn)) {
  //       return true;
  //     }
  //   }
  //   return undefined;
  // };

  // static fromJsonToJson = (
  //   config: FlutterFreezedPluginConfig,
  //   typeName?: TypeName,
  //   fieldName?: FieldName,
  //   blockAppliesOn: ReadonlyArray<AppliesOnParameters> = []
  // ) => {
  //   const _fromJsonToJson = config.fromJsonToJson;

  //   if (Array.isArray(_fromJsonToJson)) {
  //     const typeFieldNames = _fromJsonToJson.map(([_typeFieldName]) => _typeFieldName);
  //     const lastPatternIndex = this.findLastConfiguration(typeFieldNames, typeName, fieldName);
  //     if (lastPatternIndex !== undefined && _fromJsonToJson[lastPatternIndex]) {
  //       const [, classOrFunctionName, useClassConverter, configAppliesOn] = _fromJsonToJson[lastPatternIndex];
  //       if (appliesOnBlock(configAppliesOn, blockAppliesOn)) {
  //         return [classOrFunctionName, useClassConverter];
  //       }
  //     }
  //   }
  //   return _fromJsonToJson;
  // };

  // static ignoreTypes = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
  //   const pattern = TypeFieldName.buildTypeNames(config.ignoreTypes);
  //   return TypeFieldName.matchAndConfigureTypeNames(pattern, typeName);
  // };

  // static immutable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
  //   return this.freezedOptionValue(config, 'immutable', typeName);
  // };

  // static makeCollectionsUnmodifiable = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
  //   return this.freezedOptionValue(config, 'makeCollectionsUnmodifiable', typeName);
  // };

  // static mergeInputs = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
  //   const value = config['mergeInputs'];
  //   return (
  //     value
  //       ?.filter(([graphQLTypeName]) => graphQLTypeName.includes(typeName.value))
  //       .map(([, mergeWithTypeNames]) => mergeWithTypeNames)
  //       .reduce(
  //         (acc, mergeWithTypeNames) => [
  //           ...acc,
  //           ...mergeWithTypeNames
  //             .map(typeName => typeName.split(/\s*,\s*/))
  //             .reduce((acc2, typeNames) => [...acc2, ...typeNames], []),
  //         ],
  //         []
  //       ) ?? []
  //   );
  // };
  // static mutableInputs = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
  //   return this.freezedOptionValue(config, 'mutableInputs', typeName);
  // };

  // static privateEmptyConstructor = (config: FlutterFreezedPluginConfig, typeName?: TypeName) => {
  //   return this.freezedOptionValue(config, 'privateEmptyConstructor', typeName);
  // };

  // static unionKey = (config: FlutterFreezedPluginConfig, unionTypeName: TypeName): string | undefined => {
  //   return this.unionClass(config, 1, unionTypeName) as string | undefined;
  // };

  // static unionValueCase = (config: FlutterFreezedPluginConfig, unionTypeName: TypeName): string | undefined => {
  //   return this.unionClass(config, 2, unionTypeName) as UnionValueCase | undefined;
  // };

  // static unionValueDecorator = (
  //   config: FlutterFreezedPluginConfig,
  //   unionTypeName: TypeName,
  //   unionValueTypeName: TypeName
  // ) => {
  //   const unionValuesNameMap = this.unionClass(config, 3, unionTypeName);
  //   if (unionValuesNameMap && typeof unionValuesNameMap !== 'string') {
  //     const unionValueName = unionValuesNameMap[unionValueTypeName.value];
  //     if (unionValueName) {
  //       return indent(`@FreezedUnionValue('${unionValueName}')`); // TODO: add this to the factory block decorators
  //     }
  //   }
  //   return undefined;
  // };

  // static unionClass = (config: FlutterFreezedPluginConfig, index: number, unionTypeName: TypeName) => {
  //   const _unionClass = config['unionClass'];
  //   const typeFieldNames = _unionClass.map(([_unionTypeName]) => _unionTypeName);
  //   const lastPatternIndex = this.findLastConfiguration(typeFieldNames, unionTypeName);
  //   if (lastPatternIndex !== undefined && _unionClass[lastPatternIndex]) {
  //     return _unionClass[lastPatternIndex][index];
  //   }
  //   return undefined;
  // };

  // static freezedOptionValue = (config: FlutterFreezedPluginConfig, option: FreezedOption, typeName?: TypeName) => {
  //   const value = config[option];
  //   if (typeof value === 'string' || Array.isArray(value)) {
  //     const typeFieldNames = typeof value === 'string' ? [value] : value;
  //     const lastPatternIndex = this.findLastConfiguration(typeFieldNames, typeName);
  //     if (lastPatternIndex !== undefined && typeFieldNames[lastPatternIndex]) {
  //       return true;
  //     }
  //     return undefined;
  //   }
  //   return value;
  // };

  static findLastConfiguration = (patterns: Pattern[], ...args: (TypeName | FieldName)[]) => {
    const result: Record<string, number> = {};
    const key = args.map(arg => arg.value).join('.');
    const [typeName, fieldName] = key.split('.');

    const isConfiguredGlobally = (_key: string, typeName: string, fieldName: string) => {
      if (
        _key === TypeName.fromAllTypeNames().value ||
        (typeName && _key === `${typeName}.${FieldName.fromAllFieldNames().value}`) ||
        (fieldName && _key === `${TypeName.fromAllTypeNames()}.${fieldName}`) ||
        _key === `${TypeName.fromAllTypeNames()}.${FieldName.fromAllFieldNames()}`
      ) {
        return true;
      }

      return false;
    };

    patterns.forEach((pattern, index) => {
      Pattern.split(pattern).forEach(pattern => {
        const { shouldBeConfigured, args: _args } = Pattern.attemptMatchAndConfigure(pattern, ...args);
        const _key = _args.map(arg => arg.value).join('.');
        const value = shouldBeConfigured ? index : undefined;

        /*         if (_key === TypeName.fromAllTypeNames().value) {
          result[key] = value;
        } else if (typeName && _key === `${typeName}.${FieldName.fromAllFieldNames().value}`) {
          result[key] = value;
        } else if (fieldName && _key === `${TypeName.fromAllTypeNames()}.${fieldName}`) {
          result[key] = value;
        } else if (_key === `${TypeName.fromAllTypeNames()}.${FieldName.fromAllFieldNames()}`) {
          result[key] = value;
        } else {
          result[_key] = value;
        } */

        if (isConfiguredGlobally(_key, typeName, fieldName) || _key === key) {
          result[key] = value;
        } else {
          result[_key] = value;
        }
      });
    });

    return result;
  };

  public static create = (...config: Partial<FlutterFreezedPluginConfig>[]): FlutterFreezedPluginConfig => {
    return Object.assign({}, defaultFreezedPluginConfig, ...config);
  };
}
