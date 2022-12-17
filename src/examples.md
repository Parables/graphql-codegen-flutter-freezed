## Usage:

```ts filename='codegen.ts'
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // ...
  generates: {
    'lib/data/models/app_models.dart': {
      plugins: {
        'flutter-freezed': {
          // ...
          fromJsonWithMultiConstructors: [
            [
              'SearchResult', // <-- unionTypeName
              'namedConstructor', // <-- unionKey
              'FreezedUnionCase.pascal', // <-- unionValueCase
              {
                // <-- unionValuesNameMap
                Droid: 'special droid',
                Human: 'astronaut',
                Starship: 'space_Shuttle',
              },
            ],
          ],
        },
      },
    },
  },
};
export default config;
```
