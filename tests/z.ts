import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { fullDemoConfig } from './config-old';
import { starWarsSchema } from './schema';

const {
  ast: { definitions: astNodesList },
} = transformSchemaAST(starWarsSchema, fullDemoConfig);

console.log(astNodesList[11]);
