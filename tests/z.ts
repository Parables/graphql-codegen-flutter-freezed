import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { findOptionWithTypeFieldName } from '../src/utils';
import { customDecoratorsConfig } from './config';
import { fullDemoConfig } from './config-old';
import { starWarsSchema } from './schema';

// const {
//   ast: { definitions: astNodesList },
// } = transformSchemaAST(starWarsSchema, fullDemoConfig);

// console.log(astNodesList[11]);

console.log(findOptionWithTypeFieldName(customDecoratorsConfig['typeConfig'] ?? {}, '@*TypeName', 'customDecorators'));
