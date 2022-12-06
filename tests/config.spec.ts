import { Config } from '../src/config/index';
import { APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES, defaultFreezedPluginConfig } from '../src/config/config';
import { FieldName, TypeName } from '../src/config/type-field-name';

describe("integrity checks: ensures that these values don't change and if they are updated accordingly", () => {
  it('matches the default plugin config', () => {
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
      fromJsonWithMultiConstructors: undefined,
      ignoreTypes: [],
      immutable: true,
      makeCollectionsUnmodifiable: undefined,
      mergeInputs: undefined,
      mutableInputs: true,
      privateEmptyConstructor: true,
    });
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

    // setting it to `undefined` leaves the casing as it is.
    config.camelCasedEnums = undefined;
    expect(Config.camelCasedEnums(config)).toBeUndefined();
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

  describe('freezedOptions', () => {
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

  // const mockedTypeFieldNameOptionValue = jest.fn(Config.typeFieldNameOptionValue);

  // "defaultValues" | "deprecated" | "escapeDartKeywords" | "final" | "fromJsonToJson"

  const config2 = Config.create({
    final: [['@*TypeName.@*FieldName-[id, name, friends]; Droid.[id];', ['parameter']]],
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

  const allTypeFieldNames = `
Droid;
Droid.[id,name,friends];
Droid.@*FieldName;
Droid.@*FieldName-[name,id];
Starship;
Starship.[name,id];
Starship.@*FieldName-[name,id];
@*TypeName;
@*TypeName.[id,name,friends];
@*TypeName.@*FieldName;
@*TypeName.@*FieldName-[id,name,friends];
@*TypeName-[Droid,Starship];
@*TypeName-[Droid,Starship].[id,name,friends];
@*TypeName-[Droid,Starship].@*FieldName;
@*TypeName-[Droid,Starship].@*FieldName-[id,name,friends];
`;

  const config3 = Config.create({
    defaultValues: [[allTypeFieldNames, 'NanoId.nanoId()', ['parameter']]],
  });

  // TODO: Debug this
  expect(
    Config.typeFieldNameOptionValue(
      config3,
      'defaultValues',
      TypeName.fromString('Droid'),
      FieldName.fromString('id'),
      APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
      2,
      [1]
    )
  ).toMatchObject({ data: ['NanoId.nanoId()'], include: false });
});
