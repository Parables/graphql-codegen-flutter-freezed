import { mergeConfig } from '../src/utils';

export const customScalarConfig = mergeConfig({
  customScalars: {
    jsonb: 'Map<String, dynamic>',
    timestamptz: 'DateTime',
    UUID: 'String',
  },
});

export const alwaysUseJsonKeyNameConfig = mergeConfig({
  typeConfig: {
    alwaysUseJsonKeyName: [
      ['Droid.id, Starship.@*FieldName', ['default_factory_parameter', 'named_factory_parameter']],
      ['@*TypeName.@*FieldName', ['parameter']],
    ],
  },
});
