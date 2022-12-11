import { indent } from '@graphql-codegen/visitor-plugin-common';

import {
  APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
  DART_KEYWORDS,
  DART_SCALARS,
  defaultFreezedPluginConfig,
} from '../src/config/plugin-config';
import { FieldName, TypeName } from '../src/config/type-field-name';
import { Config } from '../src/config/config-value';

test("integrity checks: ensures that these values don't change and if they are updated accordingly", () => {
  expect(DART_SCALARS).toMatchObject({
    ID: 'String',
    String: 'String',
    Boolean: 'bool',
    Int: 'int',
    Float: 'double',
    DateTime: 'DateTime',
  });

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

describe('given an option in the config, it will matches all patterns and return the values passed to it', () => {
  const config = Config.create({});

  test('camelCasedEnums', () => {
    // defaults to `true`
    expect(config.camelCasedEnums).toBe(true);
    // if true, returns `camelCase
    expect(Config.camelCasedEnums(config)).toBe('camelCase');

    // alternatively, you can specify your preferred casing
    config.camelCasedEnums = 'PascalCase';
    expect(Config.camelCasedEnums(config)).toBe('PascalCase');

    // setting it to `undefined` or false leaves the casing as it is.
    config.camelCasedEnums = undefined;
    expect(Config.camelCasedEnums(config)).toBeUndefined();

    config.camelCasedEnums = false;
    expect(Config.camelCasedEnums(config)).toBeUndefined();
  });

  test('customScalars', () => {
    // defaults to `true`
    expect(config.customScalars).toMatchObject({});

    // tell Dart how to handle your custom Graphql Scalars by mapping them to an corresponding Dart type
    config.customScalars = {
      jsonb: 'Map<String, dynamic>',
      timestamptz: 'DateTime',
      UUID: 'String',
    };
    expect(Config.customScalars(config, 'jsonb')).toBe('Map<String, dynamic>');
    expect(Config.customScalars(config, 'UUID')).toBe('String');

    // using a built-in GraphQL Scalar will return a corresponding Dart type
    expect(Config.customScalars(config, 'ID')).toBe('String');
    expect(Config.customScalars(config, 'String')).toBe('String');
    expect(Config.customScalars(config, 'Boolean')).toBe('bool');
    expect(Config.customScalars(config, 'Int')).toBe('int');
    expect(Config.customScalars(config, 'Float')).toBe('double');
    expect(Config.customScalars(config, 'DateTime')).toBe('DateTime');

    // if a corresponding Dart type is not found, the scalar will be used as it is
    expect(Config.customScalars(config, 'NanoId')).toBe('NanoId');
    // case-sensitive: will use the scalar as it is
    expect(Config.customScalars(config, 'uuid')).toBe('uuid');

    // if customScalars isn't set, it will check id the scalar is a  built-in scalar
    config.customScalars = undefined;
    expect(Config.customScalars(config, 'ID')).toBe('String');
    // or use the Graphql Scalar as it is
    expect(Config.customScalars(config, 'uuid')).toBe('uuid');
  });

  test('fromJsonToJson', () => {
    // defaults to `true`
    expect(config.fromJsonToJson).toBe(true);
    expect(Config.fromJsonToJson(config)).toBe(true);

    // you can also specify custom encodings for each field in a Type. See the `typeFieldNameOptionValue` tests below
  });

  test('mergeInputs', () => {
    // defaults to `[]`
    expect(config.mergeInputs).toBeUndefined();

    // you can merge other types with a base type to create a Union/Sealed class
    // in the example below, we are merging all the types in the list with the `Movie` type to create a union/sealed class
    config.mergeInputs = [
      [
        'Movie',
        [
          // you can list each type in a string
          'MovieCharacter',
          'CreateMovieInput',
          'DeleteMovieInput',
          // OR: you can list all of them in one string
          'UpsertMovieInput, UpdateMovieInput',
        ],
      ],
      // Previous version used a name-convention pattern approach where it merges `Movie` with any type name containing the word `Movie`.
      // mergeInputs: ['Create$Input', 'Update$Input', 'Delete$Input'].
      //TODO: Discuss on whether this name-convention pattern approach is preferred over explicity mapping them
      // TODO: Find out if TypeFieldName can be used here to specify merging globally
      // [
      //   '@*TypeNames-[list all Object/Input Types to be excluded here]',
      //   [
      //     // `$` will be replaced with a Type name if the replacement produces a full valid Type name
      //     // you can list each type in a string
      //     '$Character', // becomes `MovieCharacter`
      //     'Create$Input', // becomes `CreateMovieInput`
      //     'Delete$Input',
      //     // OR: you can list all of them in one string
      //     'Upsert$Input, Update$Input',
      //   ],
      // ],
    ];

    expect(Config.mergeInputs(config, TypeName.fromString('Movie'))).toMatchObject([
      'MovieCharacter',
      'CreateMovieInput',
      'DeleteMovieInput',
      'UpsertMovieInput',
      'UpdateMovieInput',
    ]);

    //Just for testing: setting mergeInputs to `undefined` returns the defaultValue which is an empty array `[]`
    config.mergeInputs = undefined;

    expect(Config.mergeInputs(config, TypeName.fromString('Movie'))).toMatchObject([]);
  });

  test('ignoreTypes', () => {
    // defaults to `[]`
    expect(config.ignoreTypes).toMatchObject([]);
    expect(Config.ignoreTypes(config, TypeName.fromString('Droid'))).toBe(false);

    // ignore Droid and Human
    config.ignoreTypes = ['Droid', 'Human'];
    expect(Config.ignoreTypes(config, TypeName.fromString('Droid'))).toBe(true);
    expect(Config.ignoreTypes(config, TypeName.fromString('Starship'))).toBe(false);
    expect(Config.ignoreTypes(config, TypeName.fromString('Human'))).toBe(true);
  });

  test('unionClass', () => {
    // defaults to `true`
    expect(config.unionClass).toBeUndefined();

    config.unionClass = [
      ['SearchResult', 'constructor', 'FreezedUnionCase.pascal', { Droid: 'special_Droid' }],
      ['Movie', 'instance', 'FreezedUnionCase.camel', { CreateMovieInput: 'create' }],
    ];

    expect(Config.unionClassConfig(config, 1, TypeName.fromString('Movie'))).toBe('instance');
    // without a `unionTypeName`, it will fallback to use `@*TypeNames`, which in this case, was not specified in the config
    expect(Config.unionClassConfig(config, 1)).toBeUndefined();

    expect(Config.unionKey(config, TypeName.fromString('SearchResult'))).toBe('constructor');
    expect(Config.unionKey(config, TypeName.fromString('Movie'))).toBe('instance');
    // `UnknownMovie` was not specified as a `unionTypeName` in the config
    expect(Config.unionKey(config, TypeName.fromString('UnknownMovie'))).toBeUndefined();

    expect(Config.unionValueCase(config, TypeName.fromString('SearchResult'))).toBe('FreezedUnionCase.pascal');
    expect(Config.unionValueCase(config, TypeName.fromString('Movie'))).toBe('FreezedUnionCase.camel');
    expect(Config.unionValueCase(config, TypeName.fromString('UnknownMovie'))).toBeUndefined();

    expect(Config.unionValueDecorator(config, TypeName.fromString('SearchResult'), TypeName.fromString('Droid'))).toBe(
      indent("@FreezedUnionValue('special_Droid')")
    );

    expect(
      Config.unionValueDecorator(config, TypeName.fromString('Movie'), TypeName.fromString('CreateMovieInput'))
    ).toBe("  @FreezedUnionValue('create')");

    expect(
      Config.unionValueDecorator(config, TypeName.fromString('UnknownMovie'), TypeName.fromString('Droid'))
    ).toBeUndefined();
  });

  describe('typeNameOptionValue', () => {
    test.each([
      'copyWith',
      'equal',
      'immutable',
      'makeCollectionsUnmodifiable',
      'mutableInputs',
      'privateEmptyConstructor',
    ])('%s', option => {
      expect(config[option]).toBe(defaultFreezedPluginConfig[option]);
      expect(Config[option](config)).toBe(defaultFreezedPluginConfig[option]);

      // enable it for the following Types using a string
      config[option] = 'Droid, Starship';
      expect(Config[option](config, TypeName.fromString('Droid'))).toBe(true);
      expect(Config[option](config, TypeName.fromString('Human'))).toBe(false);

      // enable it for the following Types using a list of Type names
      config[option] = ['Droid', 'Starship'];
      expect(Config[option](config, TypeName.fromString('Droid'))).toBe(true);
      expect(Config[option](config, TypeName.fromString('Human'))).toBe(false);
    });
  });

  describe('typeFieldNameOptionValue', () => {
    const config2 = Config.create({
      final: [['@*TypeNames.@*FieldNames-[id, name, friends]; Droid.[id];', ['parameter']]],
    });

    expect(
      Config.typeFieldNameOptionValue(
        config2,
        'final',
        TypeName.fromString('Droid'),
        FieldName.fromString('name'),
        APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
        1
      )
    ).toMatchObject({ data: undefined, include: false });

    //  using an empty array `[]` for appliesOn
    expect(
      Config.typeFieldNameOptionValue(
        config2,
        'final',
        TypeName.fromString('Droid'),
        FieldName.fromString('name'),
        APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
        7 // this will set `canApply` to false
      )
    ).toMatchObject({ data: undefined, include: undefined });

    const allTypeFieldNames = `
      Droid;
      Droid.[id,name,friends];
      Droid.@*FieldNames;
      Droid.@*FieldNames-[name,id];
      Starship;
      Starship.[name,id];
      Starship.@*FieldNames-[name,id];
      @*TypeNames;
      @*TypeNames.[id,name,friends];
      @*TypeNames.@*FieldNames;
      @*TypeNames.@*FieldNames-[id,name,friends];
      @*TypeNames-[Droid,Starship];
      @*TypeNames-[Droid,Starship].[id,name,friends];
      @*TypeNames-[Droid,Starship].@*FieldNames;
      @*TypeNames-[Droid,Starship].@*FieldNames-[id,name,friends];
      Droid.[id];
    `;

    const config3 = Config.create({
      defaultValues: [[allTypeFieldNames, 'NanoId.nanoId()', ['parameter']]],
      deprecated: [[allTypeFieldNames, ['parameter']]],
      escapeDartKeywords: [[allTypeFieldNames, 'k_', '_k', 'snake_case', ['parameter']]],
      final: [[allTypeFieldNames, ['parameter']]],
      fromJsonToJson: [[allTypeFieldNames, 'ID', true, ['parameter']]],
    });

    const typeName = TypeName.fromString('Droid');
    const idFieldName = FieldName.fromString('id');
    const unknownFieldName = FieldName.fromString('unknown');
    const appliesOn = APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES;

    expect(Config.defaultValues(config3, typeName, idFieldName, [...appliesOn])).toBe('@Default(NanoId.nanoId())\n');
    expect(Config.defaultValues(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();

    expect(Config.deprecated(config3, typeName, [...appliesOn], idFieldName)).toBe('@deprecated\n');
    expect(Config.deprecated(config3, typeName, [...appliesOn], unknownFieldName)).toBeUndefined();

    expect(Config.escapeDartKeywords(config3, typeName, idFieldName, [...appliesOn])).toMatchObject([
      'k_',
      '_k',
      'snake_case',
    ]);
    expect(Config.escapeDartKeywords(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();

    expect(Config.final(config3, typeName, idFieldName, [...appliesOn])).toBe(true);
    expect(Config.final(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();

    expect(Config.fromJsonToJson(config3, typeName, idFieldName, [...appliesOn])).toMatchObject(['ID', true]);
    expect(Config.fromJsonToJson(config3, typeName, unknownFieldName, [...appliesOn])).toBeUndefined();
  });
});
