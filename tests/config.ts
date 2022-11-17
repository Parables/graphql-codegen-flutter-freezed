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
          "@Assert('${fieldName}.isNotEmpty', '${fieldName} cannot be empty')": {
            appliesOn: ['factory'],
            mapsToFreezedAs: 'custom',
          },
          "@Assert('${fieldName}.length >= ${@constraint.minLength} && ${fieldName}.length <= ${@constraint.maxLength} ')":
            {
              appliesOn: ['factory'],
              mapsToFreezedAs: 'directive',
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
          '@HiveType': {
            appliesOn: ['class'],
            // arguments: ['5'],
            arguments: ['typeId: ${index}'], //TODO: if the string matches `/(\${index})/g`, it will be replaced with the index of the type
            mapsToFreezedAs: 'custom',
          },
        },
        '@*FieldName': {
          // <-- for all fields of Starship
          '@HiveField': {
            appliesOn: ['default_factory'],
            arguments: ['${index}'], //TODO: if the string matches `/(\${index})/g`, it will be replaced with the index of the field
            mapsToFreezedAs: 'custom',
          },
        },
      },
    },
  },
});
