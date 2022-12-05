import { Config } from '../src/config/index';
import { defaultFreezedPluginConfig } from '../src/config/config';
import { TypeName } from '../src/config/type-field-name';

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
});
