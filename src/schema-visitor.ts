import {
  EnumTypeDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { FlutterFreezedPluginConfig } from './config';
import { FreezedFactoryBlockRepository, buildBlock } from './utils';

export const schemaVisitor = (_schema: GraphQLSchema, config: FlutterFreezedPluginConfig) => {
  const freezedFactoryBlockRepository = new FreezedFactoryBlockRepository();
  return {
    freezedFactoryBlockRepository,

    EnumTypeDefinition: (node: EnumTypeDefinitionNode) => buildBlock(config, freezedFactoryBlockRepository, node),

    UnionTypeDefinition: (node: UnionTypeDefinitionNode) => buildBlock(config, freezedFactoryBlockRepository, node),

    ObjectTypeDefinition: (node: ObjectTypeDefinitionNode) => buildBlock(config, freezedFactoryBlockRepository, node),

    InputObjectTypeDefinition: (node: InputObjectTypeDefinitionNode) =>
      buildBlock(config, freezedFactoryBlockRepository, node),
  };
};
