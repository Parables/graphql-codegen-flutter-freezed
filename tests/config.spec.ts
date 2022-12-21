import { DART_KEYWORDS, DART_SCALARS, defaultFreezedPluginConfig } from '../src/config/plugin-config';
import { TypeName, FieldName } from '../src/config/type-field-name';
import { Config } from '../src/config/config-value';

describe("integrity checks: ensures that these values don't change and if they do, they're updated accordingly", () => {
  test('integrity check: DART_SCALARS contains corresponding Dart Types mapping for built-in Graphql Scalars', () => {
    expect(DART_SCALARS).toMatchObject({
      ID: 'String',
      String: 'String',
      Boolean: 'bool',
      Int: 'int',
      Float: 'double',
      DateTime: 'DateTime',
    });
  });

  test('integrity check: All DART_KEYWORDS are accounted for', () => {
    expect(DART_KEYWORDS).toMatchObject({
      abstract: 'built-in',
      else: 'reserved',
      import: 'built-in',
      show: 'context',
      as: 'built-in',
      enum: 'reserved',
      in: 'reserved',
      static: 'built-in',
      assert: 'reserved',
      export: 'built-in',
      interface: 'built-in',
      super: 'reserved',
      async: 'context',
      extends: 'reserved',
      is: 'reserved',
      switch: 'reserved',
      await: 'async-reserved',
      extension: 'built-in',
      late: 'built-in',
      sync: 'context',
      break: 'reserved',
      external: 'built-in',
      library: 'built-in',
      this: 'reserved',
      case: 'reserved',
      factory: 'built-in',
      mixin: 'built-in',
      throw: 'reserved',
      catch: 'reserved',
      false: 'reserved',
      new: 'reserved',
      true: 'reserved',
      class: 'reserved',
      final: 'reserved',
      null: 'reserved',
      try: 'reserved',
      const: 'reserved',
      finally: 'reserved',
      on: 'context',
      typedef: 'built-in',
      continue: 'reserved',
      for: 'reserved',
      operator: 'built-in',
      var: 'reserved',
      covariant: 'built-in',
      Function: 'built-in',
      part: 'built-in',
      void: 'reserved',
      default: 'reserved',
      get: 'built-in',
      required: 'built-in',
      while: 'reserved',
      deferred: 'built-in',
      hide: 'context',
      rethrow: 'reserved',
      with: 'reserved',
      do: 'reserved',
      if: 'reserved',
      return: 'reserved',
      yield: 'async-reserved',
      dynamic: 'built-in',
      implements: 'built-in',
      set: 'built-in',
      // built-in types
      int: 'reserved',
      double: 'reserved',
      String: 'reserved',
      bool: 'reserved',
      List: 'reserved',
      Set: 'reserved',
      Map: 'reserved',
      Runes: 'reserved',
      Symbol: 'reserved',
      Object: 'reserved',
      Null: 'reserved',
      Never: 'reserved',
      Enum: 'reserved',
      Future: 'reserved',
      Iterable: 'reserved',
    });
  });

  test('integrity check: plugin config defaults are set', () => {
    expect(defaultFreezedPluginConfig).toMatchObject({
      camelCasedEnums: true,
      copyWith: undefined,
      customScalars: {},
      defaultValues: undefined,
      deprecated: undefined,
      equal: undefined,
      escapeDartKeywords: true,
      final: undefined,
      fromJsonToJson: true,
      ignoreTypes: [],
      immutable: true,
      makeCollectionsUnmodifiable: undefined,
      mergeInputs: undefined,
      mutableInputs: true,
      privateEmptyConstructor: true,
      unionClass: undefined,
    });
  });
});

const Droid = TypeName.fromString('Droid');
const Starship = TypeName.fromString('Starship');
const Human = TypeName.fromString('Human');
const Movie = TypeName.fromString('Movie');

// const id = FieldName.fromString('id');
// const name = FieldName.fromString('name');
const friends = FieldName.fromString('friends');
const friend = FieldName.fromString('friend');
// const title = FieldName.fromString('title');
// const episode = FieldName.fromString('episode');

describe('Config: has methods that returns a ready-to-use value for all the config options', () => {
  const config = Config.create({});

  describe('Config.camelCasedEnums(...): returns a `DartIdentifierCasing` or `undefined`', () => {
    it('config.camelCasedEnums: defaults to `true`', () => {
      expect(config.camelCasedEnums).toBe(true);
    });

    it('returns `camelCase` if set to `true`. Defaults to `true`', () => {
      expect(Config.camelCasedEnums(config)).toBe('camelCase');
    });

    it('allow to you to specify your preferred casing', () => {
      config.camelCasedEnums = 'PascalCase';
      expect(Config.camelCasedEnums(config)).toBe('PascalCase');
    });

    it('can be disabled by setting it to `false` or `undefined`', () => {
      config.camelCasedEnums = undefined;
      expect(Config.camelCasedEnums(config)).toBeUndefined();
      config.camelCasedEnums = false;
      expect(Config.camelCasedEnums(config)).toBeUndefined();
    });
  });

  // The following methods have the same signature that is why they're all tested using the same conditions
  describe.each([
    ['copyWith', undefined],
    ['equal', undefined],
    ['immutable', true],
    ['makeCollectionsUnmodifiable', undefined],
    ['mutableInputs', true],
    ['privateEmptyConstructor', true],
  ])('Config.%s(...): returns a `boolean` or `undefined`', (option, defaultValue) => {
    it(`config.${option}: defaults to \`undefined\``, () => {
      expect(config[option]).toBe(defaultValue);
      expect(Config[option](config)).toBe(defaultValue);
    });

    it('returns a boolean if set to a boolean', () => {
      config[option] = true;
      expect(Config[option](config)).toBe(true);

      config[option] = false;
      expect(Config[option](config)).toBe(false);
    });

    test('enable it only for some specified Graphql Types using TypeNamePatterns', () => {
      config[option] = 'Droid;Starship;';
      expect(Config[option](config, Droid)).toBe(true);
      expect(Config[option](config, Starship)).toBe(true);
      expect(Config[option](config, Human)).toBe(undefined);

      config[option] = '@*TypeNames;';
      expect(Config[option](config, Droid)).toBe(true);
      expect(Config[option](config, Starship)).toBe(true);
      expect(Config[option](config, Human)).toBe(true);

      config[option] = '@*TypeNames-[Droid,Movie];';
      expect(Config[option](config, Droid)).toBeUndefined();
      expect(Config[option](config, Movie)).toBeUndefined();
      expect(Config[option](config, Starship)).toBe(true);
      expect(Config[option](config, Human)).toBe(true);
    });
  });

  describe('Config.customScalars(...): returns an equivalent Dart Type for a given Graphql Scalar Type', () => {
    it('config.customScalars: defaults to an empty object `{}`', () => {
      expect(config.customScalars).toMatchObject({});
    });

    // tell Dart how to handle your custom Graphql Scalars by mapping them to an corresponding Dart type
    config.customScalars = {
      jsonb: 'Map<String, dynamic>',
      timestamp: 'DateTime',
      UUID: 'String',
    };

    it('returns the equivalent Dart Type from the config', () => {
      expect(Config.customScalars(config, 'jsonb')).toBe('Map<String, dynamic>');
      expect(Config.customScalars(config, 'UUID')).toBe('String');
    });

    it('returns the equivalent Dart Type from the DART_SCALARS', () => {
      expect(Config.customScalars(config, 'ID')).toBe('String');
      expect(Config.customScalars(config, 'String')).toBe('String');
      expect(Config.customScalars(config, 'Boolean')).toBe('bool');
      expect(Config.customScalars(config, 'Int')).toBe('int');
      expect(Config.customScalars(config, 'Float')).toBe('double');
      expect(Config.customScalars(config, 'DateTime')).toBe('DateTime');
    });

    test('you can override the DART_SCALARS with the config', () => {
      expect(Config.customScalars(config, 'ID')).toBe('String');
      config.customScalars = { ...config.customScalars, ID: 'int' };
      expect(Config.customScalars(config, 'ID')).toBe('int');
    });

    it('returns the Graphql Scalar if no equivalent type is found', () => {
      expect(Config.customScalars(config, 'NanoId')).toBe('NanoId');
    });

    it('is case-sensitive: returns the Graphql Scalar if no equivalent type is found', () => {
      expect(Config.customScalars(config, 'UUID')).toBe('String');
      expect(Config.customScalars(config, 'uuid')).toBe('uuid');
    });

    test('order of precedence: config > DART_SCALARS > graphql scalar', () => {
      config.customScalars = undefined;
      expect(Config.customScalars(config, 'ID')).toBe('String');
      expect(Config.customScalars(config, 'uuid')).toBe('uuid');
    });
  });

  describe('Config.defaultValue(...): returns a tuple containing: `[defaultValue, directiveName, directiveArgName]`', () => {
    it('config.defaultValue: defaults to `undefined`', () => {
      expect(config.defaultValues).toBeUndefined();
    });

    it('can set the defaultValues for fields of Graphql Types using TypeFieldNamePatterns', () => {
      config.defaultValues = [['Movie.[friends];Droid.[friends]', '[]', ['parameter']]];

      expect(Config.defaultValues(config, Droid, friends, ['parameter'])).toEqual(
        expect.arrayContaining(['[]', undefined, undefined])
      );
      expect(Config.defaultValues(config, Droid, friend, ['parameter'])).toBeUndefined();
      expect(Config.defaultValues(config, Starship, friends, ['parameter'])).toBeUndefined();
      expect(Config.defaultValues(config, Human, friends, ['parameter'])).toBeUndefined();
      expect(Config.defaultValues(config, Movie, friends, ['parameter'])).toEqual(
        expect.arrayContaining(['[]', undefined, undefined])
      );
      expect(Config.defaultValues(config, Movie, friend, ['parameter'])).toBeUndefined();
    });

    // TODO: this test should be done in the parameter block class by a method that places a decorator on top of the parameter
    it('will get the defaultValue from the directive if both directiveName and directiveArgName is passed', () => {
      config.defaultValues = [['Movie.[friends];Droid.[friends]', '[]', ['parameter'], 'constraint', 'min']];
      expect(Config.defaultValues(config, Droid, friends, ['parameter'])).toEqual(
        expect.arrayContaining(['[]', 'constraint', 'min'])
      );
      expect(Config.defaultValues(config, Droid, friend, ['parameter'])).toBeUndefined();
    });
  });

  describe.skip('Config.deprecated(...): returns `@deprecated` if the TypeName or FieldName is specified using a TypeFieldNamePattern', () => {
    config.deprecated = [];
  });

  describe.skip('Config.escapeDartKeywords(...): returns ', () => {
    config.deprecated = [];
  });

  describe.skip('Config.final(...): returns ', () => {
    config.deprecated = [];
  });

  describe.skip('Config.fromJsonToJson(...): returns ', () => {
    config.deprecated = [];
  });

  describe.skip('Config.ignoreTypes(...): returns ', () => {
    config.deprecated = [];
  });

  describe.skip('Config.mergeInputs(...): returns ', () => {
    config.deprecated = [];
  });

  describe.skip('Config.mutableInputs(...): returns ', () => {
    config.deprecated = [];
  });

  describe.skip('Config.unionClass(...): returns ', () => {
    config.deprecated = [];
  });

  describe.skip('Config.(...): returns ', () => {
    config.deprecated = [];
  });
});

//   describe('Config.copyWith(...): returns a `boolean` or `undefined`', () => {
//     it('config.copyWith: defaults to `undefined`', () => {});
//   });

//   test('fromJsonToJson', () => {
//     // defaults to `true`
//     expect(config.fromJsonToJson).toBe(true);
//     expect(Config.fromJsonToJson(config)).toBe(true);

//     // you can also specify custom encodings for each field in a Type. See the `typeFieldNameOptionValue` tests below
//   });

//   test('mergeInputs', () => {
//     // defaults to `[]`
//     expect(config.mergeInputs).toBeUndefined();

//     // you can merge other types with a base type to create a Union/Sealed class
//     // in the example below, we are merging all the types in the list with the `Movie` type to create a union/sealed class
//     config.mergeInputs = [
//       [
//         'Movie',
//         [
//           // you can list each type in a string
//           'MovieCharacter',
//           'CreateMovieInput',
//           'DeleteMovieInput',
//           // OR: you can list all of them in one string
//           'UpsertMovieInput, UpdateMovieInput',
//         ],
//       ],
//       // Previous version used a name-convention pattern approach where it merges `Movie` with any type name containing the word `Movie`.
//       // mergeInputs: ['Create$Input', 'Update$Input', 'Delete$Input'].
//       //TODO: Discuss on whether this name-convention pattern approach is preferred over explicity mapping them
//       // TODO: Find out if TypeFieldName can be used here to specify merging globally
//       // [
//       //   '@*TypeNames-[list all Object/Input Types to be excluded here]',
//       //   [
//       //     // `$` will be replaced with a Type name if the replacement produces a full valid Type name
//       //     // you can list each type in a string
//       //     '$Character', // becomes `MovieCharacter`
//       //     'Create$Input', // becomes `CreateMovieInput`
//       //     'Delete$Input',
//       //     // OR: you can list all of them in one string
//       //     'Upsert$Input, Update$Input',
//       //   ],
//       // ],
//     ];

//     expect(Config.mergeInputs(config, TypeName.fromString('Movie'))).toMatchObject([
//       'MovieCharacter',
//       'CreateMovieInput',
//       'DeleteMovieInput',
//       'UpsertMovieInput',
//       'UpdateMovieInput',
//     ]);

//     //Just for testing: setting mergeInputs to `undefined` returns the defaultValue which is an empty array `[]`
//     config.mergeInputs = undefined;

//     expect(Config.mergeInputs(config, TypeName.fromString('Movie'))).toMatchObject([]);
//   });

//   test('ignoreTypes', () => {
//     // defaults to `[]`
//     expect(config.ignoreTypes).toMatchObject([]);
//     expect(Config.ignoreTypes(config, TypeName.fromString('Droid'))).toBe(false);

//     // ignore Droid and Human
//     config.ignoreTypes = ['Droid', 'Human'];
//     expect(Config.ignoreTypes(config, TypeName.fromString('Droid'))).toBe(true);
//     expect(Config.ignoreTypes(config, TypeName.fromString('Starship'))).toBe(false);
//     expect(Config.ignoreTypes(config, TypeName.fromString('Human'))).toBe(true);
//   });

//   test('unionClass', () => {
//     // defaults to `true`
//     expect(config.unionClass).toBeUndefined();

//     config.unionClass = [
//       ['SearchResult', 'constructor', 'FreezedUnionCase.pascal', { Droid: 'special_Droid' }],
//       ['Movie', 'instance', 'FreezedUnionCase.camel', { CreateMovieInput: 'create' }],
//     ];

//     expect(Config.unionClassConfig(config, 1, TypeName.fromString('Movie'))).toBe('instance');
//     // without a `unionTypeName`, it will fallback to use `@*TypeNames`, which in this case, was not specified in the config
//     expect(Config.unionClassConfig(config, 1)).toBeUndefined();

//     expect(Config.unionKey(config, TypeName.fromString('SearchResult'))).toBe('constructor');
//     expect(Config.unionKey(config, TypeName.fromString('Movie'))).toBe('instance');
//     // `UnknownMovie` was not specified as a `unionTypeName` in the config
//     expect(Config.unionKey(config, TypeName.fromString('UnknownMovie'))).toBeUndefined();

//     expect(Config.unionValueCase(config, TypeName.fromString('SearchResult'))).toBe('FreezedUnionCase.pascal');
//     expect(Config.unionValueCase(config, TypeName.fromString('Movie'))).toBe('FreezedUnionCase.camel');
//     expect(Config.unionValueCase(config, TypeName.fromString('UnknownMovie'))).toBeUndefined();

//     expect(Config.unionValueDecorator(config, TypeName.fromString('SearchResult'), TypeName.fromString('Droid'))).toBe(
//       indent("@FreezedUnionValue('special_Droid')")
//     );

//     expect(
//       Config.unionValueDecorator(config, TypeName.fromString('Movie'), TypeName.fromString('CreateMovieInput'))
//     ).toBe("  @FreezedUnionValue('create')");

//     expect(
//       Config.unionValueDecorator(config, TypeName.fromString('UnknownMovie'), TypeName.fromString('Droid'))
//     ).toBeUndefined();
//   });

//   describe('typeNameOptionValue', () => {
//     test.each([
//       'copyWith',
//       'equal',
//       'immutable',
//       'makeCollectionsUnmodifiable',
//       'mutableInputs',
//       'privateEmptyConstructor',
//     ])('%s', option => {
//       expect(config[option]).toBe(defaultFreezedPluginConfig[option]);
//       expect(Config[option](config)).toBe(defaultFreezedPluginConfig[option]);

//       // enable it for the following Types using a string
//       config[option] = 'Droid, Starship';
//       expect(Config[option](config, TypeName.fromString('Droid'))).toBe(true);
//       expect(Config[option](config, TypeName.fromString('Human'))).toBe(false);

//       // enable it for the following Types using a list of Type names
//       config[option] = ['Droid', 'Starship'];
//       expect(Config[option](config, TypeName.fromString('Droid'))).toBe(true);
//       expect(Config[option](config, TypeName.fromString('Human'))).toBe(false);
//     });
//   });

//   describe('typeFieldNameOptionValue', () => {
//     const config2 = Config.create({
//       final: [['@*TypeNames.@*FieldNames-[id, name, friends]; Droid.[id];', ['parameter']]],
//     });

//     expect(
//       Config.typeFieldNameOptionValue(
//         config2,
//         'final',
//         TypeName.fromString('Droid'),
//         FieldName.fromString('name'),
//         APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
//         1
//       )
//     ).toMatchObject({ data: undefined, include: false });

//     //  using an empty array `[]` for appliesOn
//     expect(
//       Config.typeFieldNameOptionValue(
//         config2,
//         'final',
//         TypeName.fromString('Droid'),
//         FieldName.fromString('name'),
//         APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
//         7 // this will set `canApply` to false
//       )
//     ).toMatchObject({ data: undefined, include: undefined });

//     const allTypeFieldNames = `
//       Droid;
//       Droid.[id,name,friends];
//       Droid.@*FieldNames;
//       Droid.@*FieldNames-[name,id];
//       Starship;
//       Starship.[name,id];
//       Starship.@*FieldNames-[name,id];
//       @*TypeNames;
//       @*TypeNames.[id,name,friends];
//       @*TypeNames.@*FieldNames;
//       @*TypeNames.@*FieldNames-[id,name,friends];
//       @*TypeNames-[Droid,Starship];
//       @*TypeNames-[Droid,Starship].[id,name,friends];
//       @*TypeNames-[Droid,Starship].@*FieldNames;
//       @*TypeNames-[Droid,Starship].@*FieldNames-[id,name,friends];
//       Droid.[id];
//     `;

//     const config3 = Config.create({
//       defaultValues: [[allTypeFieldNames, 'NanoId.nanoId()', ['parameter']]],
//       deprecated: [[allTypeFieldNames, ['parameter']]],
//       escapeDartKeywords: [[allTypeFieldNames, 'k_', '_k', 'snake_case', ['parameter']]],
//       final: [[allTypeFieldNames, ['parameter']]],
//       fromJsonToJson: [[allTypeFieldNames, 'ID', true, ['parameter']]],
//     });

//     const typeName = TypeName.fromString('Droid');
//     const idFieldName = FieldName.fromString('id');
//     const unknownFieldName = FieldName.fromString('unknown');
//     const appliesOn = APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES;

//     expect(Config.defaultValues(config3, typeName, idFieldName, [...appliesOn])).toBe('@Default(NanoId.nanoId())\n');
//     expect(Config.defaultValues(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();

//     expect(Config.deprecated(config3, typeName, [...appliesOn], idFieldName)).toBe('@deprecated\n');
//     expect(Config.deprecated(config3, typeName, [...appliesOn], unknownFieldName)).toBeUndefined();

//     expect(Config.escapeDartKeywords(config3, typeName, idFieldName, [...appliesOn])).toMatchObject([
//       'k_',
//       '_k',
//       'snake_case',
//     ]);
//     expect(Config.escapeDartKeywords(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();

//     expect(Config.final(config3, typeName, idFieldName, [...appliesOn])).toBe(true);
//     expect(Config.final(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();

//     expect(Config.fromJsonToJson(config3, typeName, idFieldName, [...appliesOn])).toMatchObject(['ID', true]);
//     expect(Config.fromJsonToJson(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();
//   });
// });
