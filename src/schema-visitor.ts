import {
  EnumTypeDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { FlutterFreezedPluginConfig } from './config/plugin-config';
import { buildBlock } from './freezed-declaration-blocks';
import { NodeRepository } from './freezed-declaration-blocks/node-repository';

export const schemaVisitor = (_schema: GraphQLSchema, config: FlutterFreezedPluginConfig) => {
  const nodeRepository = new NodeRepository();
  return {
    nodeRepository,

    EnumTypeDefinition: (node: EnumTypeDefinitionNode) => buildBlock(config, node, nodeRepository),

    UnionTypeDefinition: (node: UnionTypeDefinitionNode) => buildBlock(config, node, nodeRepository),

    ObjectTypeDefinition: (node: ObjectTypeDefinitionNode) => buildBlock(config, node, nodeRepository),

    InputObjectTypeDefinition: (node: InputObjectTypeDefinitionNode) => buildBlock(config, node, nodeRepository),
  };
};
