import { snakeCase } from 'change-case-all';
import { Kind, EnumValueDefinitionNode } from 'graphql';
import { FieldName, TypeName } from '../config/pattern-new';
import { Config } from '../config/config-value';
import {
  AppliesOn,
  AppliesOnDefaultFactory,
  AppliesOnNamedFactory,
  DartIdentifierCasing,
  FieldType,
  FlutterFreezedPluginConfig,
  NodeType,
} from '../config/plugin-config';
import { dartCasing, escapeDartKeyword, isDartKeyword, nodeIsObjectType } from '../utils';
import { ClassBlock } from './class-block';
import { EnumBlock } from './enum-block';
import { FactoryBlock } from './factory-block';
import { NodeRepository } from './node-repository';

export class Block {
  static buildImportStatements = (fileName: string) => {
    if (fileName.length < 1) {
      throw new Error('fileName is required and must not be empty');
    }
    const segments = fileName.split('/');
    const target = segments[segments.length - 1];
    const expectedFileName = snakeCase(target.replace(/\.dart/g, ''));
    return [
      `import 'package:freezed_annotation/freezed_annotation.dart';\n`,
      `import 'package:flutter/foundation.dart';\n\n`,
      `part '${expectedFileName}.freezed.dart';\n`,
      `part '${expectedFileName}.g.dart';\n\n`,
    ].join('');
  };

  /**
   * Transforms the AST nodes into  Freezed classes/models
   * @param config The plugin configuration object
   * @param node the AST node passed by the schema visitor
   * @param nodeRepository A map that stores the name of the Graphql Type as the key and it AST node as the value. Used to build FactoryBlocks from placeholders for mergedInputs and Union Types
   * @returns a string output of a `FreezedDeclarationBlock` which represents a Freezed class/model in Dart
   */
  static build = (config: FlutterFreezedPluginConfig, node: NodeType, nodeRepository: NodeRepository) => {
    // ignore these...
    const typeName = TypeName.fromString(node.name.value);
    if (['Query', 'Mutation', 'Subscription', ...Config.ignoreTypes(config, typeName)].includes(typeName.value)) {
      return '';
    }

    // registers all the ObjectTypes
    if (nodeIsObjectType(node)) {
      nodeRepository.register(node);
    }

    return node.kind === Kind.ENUM_TYPE_DEFINITION ? EnumBlock.build(config, node) : ClassBlock.build(config, node);
  };

  static buildComment = (node?: NodeType | FieldType | EnumValueDefinitionNode): string => {
    const comment = node?.description?.value;

    return comment && comment?.length > 0
      ? `${comment
          .trim()
          .split(/\n/gm)
          .map(c => `/// ${c.trim().replace(/^#/, '')}\n`)
          .join('')}`
      : '';
  };

  static buildBlockName = (
    config: FlutterFreezedPluginConfig,
    identifier: string,
    typeName: TypeName,
    fieldName?: FieldName,
    blockCasing?: DartIdentifierCasing,
    blockAppliesOn: readonly AppliesOn[] = []
  ): string => {
    // step 1: escape the identifier
    // identifier = escapeDartKeyword(config, identifier, typeName, fieldName, blockAppliesOn);

    // step 2: apply the block casing
    identifier = dartCasing(identifier, blockCasing);

    // step 3: if identifier is a dart keyword...
    if (isDartKeyword(identifier)) {
      return escapeDartKeyword(config, identifier, typeName, fieldName, blockAppliesOn);
    }
    return identifier;
  };

  static tokens = {
    defaultFactory: '==>default_factory==>',
    unionFactory: '==>union_factory==>',
    mergedFactory: '==>merged_factory==>',
    fromJsonToJson: '==>from_json_to_json==>',
  };

  static regexpForToken = <T = keyof typeof Block.tokens>(tokenName: T) => {
    return RegExp(`${Block.tokens[tokenName as string]}.+\n`, 'gm');
  };

  static replaceTokens = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    generatedBlocks: string[]
  ): string =>
    generatedBlocks
      .map(block => {
        block = Block.replaceDefaultFactoryToken(block, config, nodeRepository);
        block = Block.replaceNamedFactoryToken(block, config, nodeRepository, 'unionFactory');
        block = Block.replaceNamedFactoryToken(block, config, nodeRepository, 'mergedFactory');
        // TODO: one more for parameter fromJson and toJson tokens inside @JsonKey
        return block;
      })
      .join('');

  static replaceDefaultFactoryToken = (
    block: string,
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository
  ) =>
    block.replace(Block.regexpForToken('defaultFactory'), token => {
      const pattern = token.replace(Block.tokens.defaultFactory, '').trim();
      const [typeName, appliesOn] = pattern.split('==>');
      return FactoryBlock.deserializeFactory(
        config,
        nodeRepository,
        TypeName.fromString(typeName),
        appliesOn.split(',') as AppliesOnDefaultFactory[]
      );
    });

  static replaceNamedFactoryToken = (
    block: string,
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    blockType: 'unionFactory' | 'mergedFactory'
  ) =>
    block.replace(Block.regexpForToken(blockType), token => {
      const pattern = token.replace(Block.tokens[blockType], '').trim();
      const [typeName, namedFactory, appliesOn] = pattern.split('==>');
      return FactoryBlock.deserializeNamedFactory(
        config,
        nodeRepository,
        TypeName.fromString(typeName),
        TypeName.fromString(namedFactory),
        appliesOn.split(',') as AppliesOnNamedFactory[]
      );
    });
}
