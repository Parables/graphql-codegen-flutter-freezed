import { defaultFreezedPluginConfig } from '../src/config/config';

it('matches default plugin config', () => {
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
