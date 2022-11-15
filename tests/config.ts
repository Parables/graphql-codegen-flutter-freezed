import { mergeConfig } from '../src/utils';

export const customScalarConfig = mergeConfig({
  customScalars: {
    jsonb: 'Map<String, dynamic>',
    timestamptz: 'DateTime',
    UUID: 'String',
  },
});

export const customDecoratorsConfig = mergeConfig({
  typeConfig: {
    '@*TypeName': {
      // <-- all types
      customDecorators: {
        '@*RootBlock': {
          // <-- for root block of all types
          '@JsonSerializable(explicitToJson: true)': {
            appliesOn: ['class'],
            mapsToFreezedAs: 'custom',
          },
        },
      },
    },
    'Droid, Starship': {
      // comma-separated type names
      // <-- specific typeName(s); this will work for both Droid and Starship
      customDecorators: {
        // comma-separated field names
        '@*RootBlock': {
          // <-- for root block of Droid and Starship
          '@FreezedUnionValue': {
            appliesOn: ['named_factory_for_union_types', 'class'],
            arguments: ["'BestDroid'"],
            mapsToFreezedAs: 'custom',
          },
        },
        id: {
          // <-- for `id` field of Droid and Starship
          '@NanoId': {
            appliesOn: ['parameter'],
            arguments: ['size: 16', 'alphabets: NanoId.ALPHA_NUMERIC'],
            mapsToFreezedAs: 'custom',
          },
        },
      },
    },
    'Starship, @*TypeName': {
      // comma-separated type names
      // <-- specific typeName(s); this will work for Starship and all typeNames
      customDecorators: {
        // comma-separated field names
        '@*RootBlock': {
          // <-- for root block of Starship and all typeNames
          '@HiveObject': {
            appliesOn: ['class'],
            arguments: ['5'],
            mapsToFreezedAs: 'custom',
          },
        },
        '@*FieldName': {
          // <-- for all fields of Starship
          '@HiveType': {
            appliesOn: ['default_factory'],
            arguments: ['${index}'], //TODO: if the string matches `/^${index}/gm`, it will be replaced with the index of the field
            mapsToFreezedAs: 'custom',
          },
        },
      },
    },
  },
});
