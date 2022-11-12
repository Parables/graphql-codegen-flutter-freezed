import { mergeConfig } from '../src/utils';

export const customScalarConfig = mergeConfig({
  customScalars: {
    jsonb: 'Map<String, dynamic>',
    timestamptz: 'DateTime',
    UUID: 'String',
  },
});

export const customDecoratorsConfig = mergeConfig({});
