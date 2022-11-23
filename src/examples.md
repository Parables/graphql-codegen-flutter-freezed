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
          copyWith: true,
          // OR: a list of GRaphQL Type names
          copyWith: ['Droid', 'Starship'],
          // OR: a comma-separated string
          copyWith: 'Droid,Starship',
        },
      },
    },
  },
};
export default config;
```
