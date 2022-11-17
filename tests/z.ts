import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { NodeType } from '../src/config';
import { buildClassBlockDecorators, findOptionWithTypeFieldName } from '../src/utils';
import { customDecoratorsConfig } from './config';
import { starWarsSchema } from './schema';

const {
  ast: { definitions: astNodesList },
} = transformSchemaAST(starWarsSchema, customDecoratorsConfig);

// console.log(astNodesList[11]);

console.log(findOptionWithTypeFieldName(customDecoratorsConfig['typeConfig'] ?? {}, '@*TypeName', 'customDecorators'));
console.log(findOptionWithTypeFieldName(customDecoratorsConfig['typeConfig'] ?? {}, 'Starship', 'customDecorators'));

console.log(buildClassBlockDecorators(customDecoratorsConfig, astNodesList[6] as NodeType, ['class']));
