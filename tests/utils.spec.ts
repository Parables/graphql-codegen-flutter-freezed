import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { FlutterFreezedPluginConfig } from '../src/config';
import {
  buildBlockName,
  buildImportStatements,
  dartCasing,
  defaultFreezedConfig,
  defaultFreezedPluginConfig,
  escapeDartKeyword,
  getFreezedConfigValue,
  mergeConfig,
  nodeIsObjectType,
} from '../src/utils';
import { customDecoratorsConfig, fullDemoConfig, typeConfig } from './config';
import { starWarsSchema } from './schema';

const {
  ast: { definitions: astNodesList },
} = transformSchemaAST(starWarsSchema, fullDemoConfig);

describe('flutter-freezed-plugin-utils', () => {
  describe('default values for plugin config', () => {
    test('property: defaultFreezedConfig ==> has the default values', () => {
      expect(defaultFreezedConfig).toMatchObject({
        alwaysUseJsonKeyName: false,
        copyWith: undefined,
        customDecorators: {},
        dartKeywordEscapeCasing: undefined,
        dartKeywordEscapePrefix: undefined,
        dartKeywordEscapeSuffix: '_',
        escapeDartKeywords: true,
        equal: undefined,
        fromJsonToJson: true,
        immutable: true,
        makeCollectionsUnmodifiable: undefined,
        mergeInputs: [],
        mutableInputs: true,
        privateEmptyConstructor: true,
        unionKey: undefined,
        unionValueCase: undefined,
      });
    });

    test('property: defaultFreezedPluginConfig ==> has the default values', () => {
      expect(defaultFreezedPluginConfig).toMatchObject({
        camelCasedEnums: true,
        customScalars: {},
        fileName: 'app_models',
        globalFreezedConfig: { ...defaultFreezedConfig },
        typeSpecificFreezedConfig: {},
        ignoreTypes: [],
      });
    });

    test('method: mergeConfig() ==> extends the default config', () => {
      expect(mergeConfig()).toMatchObject(defaultFreezedPluginConfig);
      expect(mergeConfig().globalFreezedConfig).toMatchObject(defaultFreezedConfig);
      expect(mergeConfig().typeSpecificFreezedConfig).toMatchObject({});
      expect(mergeConfig(typeConfig)).toMatchObject(typeConfig);
      expect(mergeConfig().fileName).toBe(fullDemoConfig.fileName);

      const expected: FlutterFreezedPluginConfig = {
        camelCasedEnums: true,
        customScalars: {},
        fileName: 'app_models',
        globalFreezedConfig: {
          ...defaultFreezedConfig,
          customDecorators: {
            '@JsonSerializable(explicitToJson: true)': {
              applyOn: ['class'],
              mapsToFreezedAs: 'custom',
            },
          },
        },
        ignoreTypes: [],
        typeSpecificFreezedConfig: {
          Droid: {
            config: {
              customDecorators: {
                '@FreezedUnionValue': {
                  applyOn: ['union_factory'],
                  arguments: ["'BestDroid'"],
                  mapsToFreezedAs: 'custom',
                },
              },
            },
            fields: {
              id: {
                customDecorators: {
                  '@NanoId': {
                    applyOn: ['union_factory_parameter'],
                    arguments: ['size: 16', 'alphabets: NanoId.ALPHA_NUMERIC'],
                    mapsToFreezedAs: 'custom',
                  },
                },
              },
            },
          },
        },
      };

      expect(customDecoratorsConfig).toMatchObject(expected);
      // expect(customDecoratorsConfig).toMatchSnapshot();
    });
  });

  test('method: nodeIsObjectType() => returns true if node is an ObjectType', () => {
    const expected = [false, true, true, true, true, true, true, false, true, true, true, false];
    expect(astNodesList.map(nodeIsObjectType)).toEqual(expected);
  });

  describe('method: getFreezedConfigValue() ==> ', () => {
    const config = typeConfig;
    const typeName = 'Starship';

    test('without a typeName, returns the value from the globalFreezedConfig(target)', () => {
      expect(getFreezedConfigValue('alwaysUseJsonKeyName', config)).toBe(false);
      expect(getFreezedConfigValue('copyWith', config)).toBeUndefined();
      expect(getFreezedConfigValue('customDecorators', config)).toMatchObject({});
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapeSuffix', config)).toBe('_');
      expect(getFreezedConfigValue('equal', config)).toBeUndefined();
      expect(getFreezedConfigValue('escapeDartKeywords', config)).toBe(true);
      expect(getFreezedConfigValue('fromJsonToJson', config)).toBe(true);
      expect(getFreezedConfigValue('immutable', config)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config)).toBeUndefined();
      expect(getFreezedConfigValue('mergeInputs', config)).toMatchObject([]);
      expect(getFreezedConfigValue('mutableInputs', config)).toBe(true);
      expect(getFreezedConfigValue('privateEmptyConstructor', config)).toBe(true);
      expect(getFreezedConfigValue('unionKey', config)).toBeUndefined();
      expect(getFreezedConfigValue('unionValueCase', config)).toBe('FreezedUnionCase.camel');
    });

    test('without a typeName, will use the defaultValue if the globalFreezedConfig(target) values is undefined', () => {
      expect(getFreezedConfigValue('copyWith', config, undefined, true)).toBe(true);
      expect(getFreezedConfigValue('copyWith', config, undefined, false)).toBe(false);

      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, undefined, 'snake_case')).toBe('snake_case');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, undefined, 'camelCase')).toBe('camelCase');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, undefined, 'PascalCase')).toBe('PascalCase');

      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, undefined, 'GQL_')).toBe('GQL_');
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, undefined, 'ff')).toBe('ff');

      expect(getFreezedConfigValue('equal', config, undefined, true)).toBe(true);
      expect(getFreezedConfigValue('equal', config, undefined, false)).toBe(false);

      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, undefined, true)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, undefined, false)).toBe(false);

      expect(getFreezedConfigValue('unionKey', config, undefined, 'runtimeType')).toBe('runtimeType');
      expect(getFreezedConfigValue('unionKey', config, undefined, 'type')).toBe('type');
    });

    test('given a typeName, returns the value from the typeSpecificFreezedConfig(target)', () => {
      expect(getFreezedConfigValue('alwaysUseJsonKeyName', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('copyWith', config, typeName)).toBe(false);
      expect(getFreezedConfigValue('immutable', config, typeName)).toBe(false);
      expect(getFreezedConfigValue('unionValueCase', config, typeName)).toBe('FreezedUnionCase.pascal');
    });

    test('given a typeName, falls back to the globalFreezedConfig if they value is undefined', () => {
      expect(getFreezedConfigValue('customDecorators', config, typeName)).toMatchObject({});
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('dartKeywordEscapeSuffix', config, typeName)).toBe('_');
      expect(getFreezedConfigValue('equal', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('escapeDartKeywords', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('fromJsonToJson', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, typeName)).toBeUndefined();
      expect(getFreezedConfigValue('mergeInputs', config, typeName)).toMatchObject([]);
      expect(getFreezedConfigValue('mutableInputs', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('privateEmptyConstructor', config, typeName)).toBe(true);
      expect(getFreezedConfigValue('unionKey', config, typeName)).toBeUndefined();
    });

    test('given a typeName, will use the defaultValue if both typeSpecificFreezedConfig(target) and globalFreezedConfig(fallback) values is undefined', () => {
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName, 'snake_case')).toBe('snake_case');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName, 'camelCase')).toBe('camelCase');
      expect(getFreezedConfigValue('dartKeywordEscapeCasing', config, typeName, 'PascalCase')).toBe('PascalCase');

      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, typeName, 'GQL_')).toBe('GQL_');
      expect(getFreezedConfigValue('dartKeywordEscapePrefix', config, typeName, 'ff')).toBe('ff');

      expect(getFreezedConfigValue('equal', config, typeName, true)).toBe(true);
      expect(getFreezedConfigValue('equal', config, typeName, false)).toBe(false);

      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, typeName, true)).toBe(true);
      expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config, typeName, false)).toBe(false);

      expect(getFreezedConfigValue('unionKey', config, typeName, 'runtimeType')).toBe('runtimeType');
      expect(getFreezedConfigValue('unionKey', config, typeName, 'type')).toBe('type');
    });
  });

  test('method: buildImportStatements() => returns a string of import statements', () => {
    expect(buildImportStatements('SomeFileName')).toContain('some_file_name');
    expect(buildImportStatements('_Some-File_Name')).toContain('some_file_name');
    expect(buildImportStatements('Some file name')).toContain('some_file_name');
    expect(buildImportStatements('some-file-name.dart')).toContain('some_file_name.freezed.dart');
    expect(() => buildImportStatements('')).toThrow('fileName is required and must not be empty');

    expect(buildImportStatements('/lib/models/some-file_name.dart')).toBe(
      [
        `import 'package:freezed_annotation/freezed_annotation.dart';\n`,
        `import 'package:flutter/foundation.dart';\n\n`,
        `part 'some_file_name.freezed.dart';\n`,
        `part 'some_file_name.g.dart';\n\n`,
      ].join('')
    );
  });

  test('method: dartCasing() => ', () => {
    expect(dartCasing('snake---- Case___ ME', 'snake_case')).toBe('snake_case_me');
    expect(dartCasing('Camel_ case- -- - ME', 'camelCase')).toBe('camelCaseMe');
    expect(dartCasing('pascal-- --case _ ME', 'PascalCase')).toBe('PascalCaseMe');
    expect(dartCasing('lE-AvE mE A-l_o_n-e')).toBe('lE-AvE mE A-l_o_n-e');
  });

  const withoutCasing: Partial<FlutterFreezedPluginConfig> = {
    globalFreezedConfig: { dartKeywordEscapeCasing: undefined },
  };
  const withSnakeCasing: Partial<FlutterFreezedPluginConfig> = {
    globalFreezedConfig: { dartKeywordEscapeCasing: 'snake_case' },
  };
  const withCamelCasing: Partial<FlutterFreezedPluginConfig> = {
    globalFreezedConfig: { dartKeywordEscapeCasing: 'camelCase' },
  };
  const withPascalCasing: Partial<FlutterFreezedPluginConfig> = {
    globalFreezedConfig: { dartKeywordEscapeCasing: 'PascalCase' },
  };

  describe('method: escapeDartKey() => ', () => {
    const config = mergeConfig();
    /*    
   test('defaultConfig: NOT a valid Dart Language Keyword', () => {
      expect(escapeDartKeyword(config, 'NEWHOPE')).toBe('NEWHOPE');
      expect(escapeDartKeyword(config, 'EMPIRE')).toBe('EMPIRE');
      expect(escapeDartKeyword(config, 'JEDI')).toBe('JEDI');

      expect(buildBlockName(config, 'NEWHOPE')).toBe('NEWHOPE');
      expect(buildBlockName(config, 'EMPIRE')).toBe('EMPIRE');
      expect(buildBlockName(config, 'JEDI')).toBe('JEDI');
    });

    test('defaultConfig: case-sensitive: NOT valid Dart Language Keyword', () => {
      expect(escapeDartKeyword(config, 'VOID')).toBe('VOID');
      expect(escapeDartKeyword(config, 'IN')).toBe('IN');
      expect(escapeDartKeyword(config, 'IF')).toBe('IF');
      expect(escapeDartKeyword(config, 'ELSE')).toBe('ELSE');
      expect(escapeDartKeyword(config, 'SWITCH')).toBe('SWITCH');
      expect(escapeDartKeyword(config, 'FACTORY')).toBe('FACTORY');

      expect(buildBlockName(config, 'VOID')).toBe('VOID');
      expect(buildBlockName(config, 'IN')).toBe('IN');
      expect(buildBlockName(config, 'IF')).toBe('IF');
      expect(buildBlockName(config, 'ELSE')).toBe('ELSE');
      expect(buildBlockName(config, 'SWITCH')).toBe('SWITCH');
      expect(buildBlockName(config, 'FACTORY')).toBe('FACTORY');
    });
    
    describe('defaultConfig: case-sensitive: valid Dart Language Keywords', () => {
      test('method: escapeDartKeyword() => it should escape Dart Language Keywords', () => {
        expect(escapeDartKeyword(config, 'void')).toBe('void_');
        expect(escapeDartKeyword(config, 'in')).toBe('in_');
        expect(escapeDartKeyword(config, 'if')).toBe('if_');
        expect(escapeDartKeyword(config, 'else')).toBe('else_');
        expect(escapeDartKeyword(config, 'switch')).toBe('switch_');
        expect(escapeDartKeyword(config, 'factory')).toBe('factory_');
      });

      test('method: buildBlockName() => should ignore buildBlockName casing if casedBlockName is still a valid Dart Language Keyword', () => {
        expect(buildBlockName(config, 'void')).toBe('void_');
        expect(buildBlockName(config, 'void', undefined, undefined)).toBe('void_');
        expect(buildBlockName(config, 'void', undefined, undefined, true)).toBe(`@JsonKey(name: 'void') void_`);

        expect(buildBlockName(config, 'void', undefined, 'snake_case')).toBe('void_');
        expect(buildBlockName(config, 'void', undefined, 'snake_case', true)).toBe(`@JsonKey(name: 'void') void_`);

        expect(buildBlockName(config, 'void', undefined, 'camelCase')).toBe('void_');
        expect(buildBlockName(config, 'void', undefined, 'camelCase', true)).toBe(`@JsonKey(name: 'void') void_`);

        expect(buildBlockName(config, 'void', undefined, 'PascalCase')).toBe('Void');
        expect(buildBlockName(config, 'void', undefined, 'PascalCase', true)).toBe(`@JsonKey(name: 'void') Void`);
      });
    });

    describe('withPrefixConfig: case-sensitive: valid Dart Language Keyword', () => {
      const withPrefix = mergeConfig(config, {
        globalFreezedConfig: { dartKeywordEscapePrefix: 'k_', dartKeywordEscapeSuffix: undefined },
      });
      test('method: escapeDartKeyword() => it should escape Dart Language Keywords', () => {
        expect(escapeDartKeyword(withPrefix, 'void')).toBe('k_void');
        expect(escapeDartKeyword(mergeConfig(withPrefix, withoutCasing), 'in')).toBe('k_in');
        expect(escapeDartKeyword(mergeConfig(withPrefix, withSnakeCasing), 'if')).toBe('k_if');
        expect(escapeDartKeyword(mergeConfig(withPrefix, withCamelCasing), 'else')).toBe('kElse');
        expect(escapeDartKeyword(mergeConfig(withPrefix, withPascalCasing), 'switch')).toBe('KSwitch');
        expect(escapeDartKeyword(mergeConfig(withPrefix, withSnakeCasing), 'factory', undefined)).toBe('k_factory');
      });

      test('method: buildBlockName() => should ignore buildBlockName casing if casedBlockName is still a valid Dart Language Keyword', () => {
        expect(buildBlockName(withPrefix, 'void')).toBe('k_void');
        expect(buildBlockName(withPrefix, 'void', undefined, undefined)).toBe('k_void');
        expect(buildBlockName(withPrefix, 'void', undefined, undefined, true)).toBe(`@JsonKey(name: 'void') k_void`);

        expect(buildBlockName(mergeConfig(withPrefix, withoutCasing), 'void')).toBe('k_void');
        expect(buildBlockName(mergeConfig(withPrefix, withoutCasing), 'void', undefined, undefined)).toBe('k_void');
        expect(buildBlockName(mergeConfig(withPrefix, withoutCasing), 'void', undefined, undefined, true)).toBe(
          `@JsonKey(name: 'void') k_void`
        );

        expect(buildBlockName(withPrefix, 'void', undefined, 'snake_case')).toBe('k_void');
        expect(buildBlockName(withPrefix, 'void', undefined, 'snake_case', true)).toBe(`@JsonKey(name: 'void') k_void`);

        expect(buildBlockName(mergeConfig(withPrefix, withSnakeCasing), 'void', undefined, 'snake_case')).toBe(
          'k_void'
        );
        expect(buildBlockName(mergeConfig(withPrefix, withSnakeCasing), 'void', undefined, 'snake_case', true)).toBe(
          `@JsonKey(name: 'void') k_void`
        );

        expect(buildBlockName(withPrefix, 'void', undefined, 'camelCase')).toBe('kVoid');
        expect(buildBlockName(withPrefix, 'void', undefined, 'camelCase', true)).toBe(`@JsonKey(name: 'void') kVoid`);

        expect(buildBlockName(mergeConfig(withPrefix, withCamelCasing), 'void', undefined, 'camelCase')).toBe('kVoid');
        expect(buildBlockName(mergeConfig(withPrefix, withCamelCasing), 'void', undefined, 'camelCase', true)).toBe(
          `@JsonKey(name: 'void') kVoid`
        );

        expect(buildBlockName(withPrefix, 'void', undefined, 'PascalCase')).toBe('KVoid');
        expect(buildBlockName(withPrefix, 'void', undefined, 'PascalCase', true)).toBe(`@JsonKey(name: 'void') KVoid`);

        expect(buildBlockName(mergeConfig(withPrefix, withPascalCasing), 'void', undefined, 'PascalCase')).toBe(
          'KVoid'
        );
        expect(buildBlockName(mergeConfig(withPrefix, withPascalCasing), 'void', undefined, 'PascalCase', true)).toBe(
          `@JsonKey(name: 'void') KVoid`
        );
      });
    });
 
    test('withSuffixConfig: case-sensitive: valid Dart Language Keyword', () => {
      const withSuffix = mergeConfig(config, {
        globalFreezedConfig: { dartKeywordEscapePrefix: undefined, dartKeywordEscapeSuffix: '_k' },
      });

      expect(escapeDartKeyword(withSuffix, 'void')).toBe('void_k');
      expect(escapeDartKeyword(mergeConfig(withSuffix, withoutCasing), 'in')).toBe('in_k');
      expect(escapeDartKeyword(mergeConfig(withSuffix, withSnakeCasing), 'if')).toBe('if_k');
      expect(escapeDartKeyword(mergeConfig(withSuffix, withCamelCasing), 'else')).toBe('elseK');
      expect(escapeDartKeyword(mergeConfig(withSuffix, withPascalCasing), 'switch')).toBe('SwitchK');
      expect(escapeDartKeyword(mergeConfig(withSuffix, withSnakeCasing), 'factory', undefined)).toBe('factory_k');
    });

    test('withPrefixSuffixConfig: case-sensitive: valid Dart Language Keyword', () => {
      const withPrefixSuffix = mergeConfig(config, {
        globalFreezedConfig: { dartKeywordEscapePrefix: 'k_', dartKeywordEscapeSuffix: '_k' },
      });

      expect(escapeDartKeyword(withPrefixSuffix, 'void')).toBe('k_void_k');
      expect(escapeDartKeyword(mergeConfig(withPrefixSuffix, withoutCasing), 'in')).toBe('k_in_k');
      expect(escapeDartKeyword(mergeConfig(withPrefixSuffix, withSnakeCasing), 'if')).toBe('k_if_k');
      expect(escapeDartKeyword(mergeConfig(withPrefixSuffix, withCamelCasing), 'else')).toBe('kElseK');
      expect(escapeDartKeyword(mergeConfig(withPrefixSuffix, withPascalCasing), 'switch')).toBe('KSwitchK');
      expect(escapeDartKeyword(mergeConfig(withPrefixSuffix, withSnakeCasing), 'factory', undefined)).toBe(
        'k_factory_k'
      );
    });
    */
  });
});
