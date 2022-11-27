import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { GraphQLSchema } from 'graphql';
import { FlutterFreezedPluginConfig, defaultFreezedPluginConfig } from './config';
import { schemaVisitor } from './schema-visitor';
import { buildImportStatements } from './utils';

export const plugin: PluginFunction<FlutterFreezedPluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: FlutterFreezedPluginConfig,
  info
): string => {
  // sets the defaults for the config
  const config = { ...defaultFreezedPluginConfig, ..._config };

  const { schema: _schema, ast } = transformSchemaAST(schema, config);
  const { nodeRepository, ...visitor } = schemaVisitor(_schema, config);

  const visitorResult = oldVisit(ast, { leave: visitor });

  const generated: string[] = visitorResult.definitions.filter((def: any) => typeof def === 'string' && def.length > 0);

  return (
    buildImportStatements(info?.outputFile ?? 'app_models') +
    generated // TODO: replace placeholders with factory blocks

      .join('')
      .trim()
  );
};
