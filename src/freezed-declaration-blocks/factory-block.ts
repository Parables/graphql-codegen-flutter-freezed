import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Config } from '../config/config-value';
import { TypeName } from '../config/pattern-new';
import {
  FlutterFreezedPluginConfig,
  ObjectType,
  AppliesOnFactory,
  AppliesOnParameters,
  AppliesOnDefaultFactory,
  AppliesOnNamedFactory,
  APPLIES_ON_DEFAULT_FACTORY,
  APPLIES_ON_NAMED_FACTORY_FOR_UNION_TYPES,
  APPLIES_ON_NAMED_FACTORY_FOR_MERGED_TYPES,
} from '../config/plugin-config';
import { NodeRepository } from './node-repository';
import { Block } from './index';
import { ParameterBlock } from './parameter-block';
import { FieldDefinitionNode, InputValueDefinitionNode } from 'graphql';

export class FactoryBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    appliesOn: AppliesOnFactory[],
    className: TypeName,
    factoryName?: TypeName
  ): string {
    let block = '';

    block += Block.buildComment(node);

    block += this.buildDecorators();

    block += this.buildHeader(config, className, factoryName, appliesOn);

    block += this.buildBody(config, node, appliesOn);

    factoryName = appliesOn.includes('default_factory') ? className : factoryName;
    block += this.buildFooter(config, appliesOn, factoryName);

    return block;
  }

  public static buildDecorators = (): string => {
    // TODO: @deprecated
    // TODO: @Assert
    return '';
  };

  public static buildHeader = (
    config: FlutterFreezedPluginConfig,
    className: TypeName,
    factoryName?: TypeName,
    blockAppliesOn?: readonly AppliesOnFactory[]
  ) => {
    const immutable = Config.immutable(config, className);
    // const mutableInputs = Config.mutableInputs(config, factoryName);
    // const mutable = immutable !== true || (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && mutableInputs);
    const constFactory = immutable ? indent('const factory') : indent('factory');
    const _className = Block.buildBlockName(
      config,
      className.value,
      className,
      undefined,
      'PascalCase',
      blockAppliesOn
    );

    if (factoryName) {
      const _factoryName = Block.buildBlockName(
        config,
        factoryName.value,
        factoryName,
        undefined,
        'camelCase',
        blockAppliesOn
      );
      return `${constFactory} ${_className}.${_factoryName}({\n`;
    }

    return `${constFactory} ${_className}({\n`;
  };

  public static buildBody = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    appliesOn: AppliesOnFactory[]
  ): string => {
    let appliesOnParameters: AppliesOnParameters[] = [];
    if (appliesOn.includes('default_factory')) {
      appliesOnParameters = ['parameter', 'default_factory_parameter'];
    } else if (appliesOn.includes('named_factory_for_union_types')) {
      appliesOnParameters = ['parameter', 'named_factory_parameter', 'named_factory_parameter_for_union_types'];
    } else if (appliesOn.includes('named_factory_for_merged_types')) {
      appliesOnParameters = ['parameter', 'named_factory_parameter', 'named_factory_parameter_for_merged_types'];
    }

    return (
      node.fields
        ?.map((field: FieldDefinitionNode | InputValueDefinitionNode) => {
          return ParameterBlock.build(config, node, field, appliesOnParameters);
        })
        .join('') ?? ''
    );
  };

  public static buildFooter = (
    config: FlutterFreezedPluginConfig,
    appliesOn: AppliesOnFactory[],
    factoryName: TypeName
  ) => {
    const _ = appliesOn.includes('default_factory') ? '_' : '';
    const _factoryName = Block.buildBlockName(
      config,
      factoryName.value,
      factoryName,
      undefined,
      'PascalCase',
      appliesOn
    );
    return indent(`}) = ${_}${_factoryName};\n\n`);
  };

  public static serializeDefaultFactory = (typeName: TypeName): string => {
    return `${Block.tokens.defaultFactory}${typeName.value}==>${APPLIES_ON_DEFAULT_FACTORY.join(',')}\n`;
  };

  public static serializeUnionFactory = (targetTypeName: TypeName, unionTypeName: TypeName): string => {
    return `${Block.tokens.unionFactory}${
      targetTypeName.value
    }==>${unionTypeName}==>${APPLIES_ON_NAMED_FACTORY_FOR_UNION_TYPES.join(',')}\n`;
  };

  public static serializeMergedFactory = (typeName: TypeName, mergedTypeName: TypeName): string => {
    return `${Block.tokens.mergedFactory}${typeName.value}==>${
      mergedTypeName.value
    }==>${APPLIES_ON_NAMED_FACTORY_FOR_MERGED_TYPES.join(',')}\n`;
  };

  public static deserializeFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    className: TypeName,
    appliesOn: AppliesOnDefaultFactory[]
  ): string => {
    const node = nodeRepository.get(className.value);

    if (node) {
      return FactoryBlock.buildFromFactory(config, node, className, appliesOn);
    }

    return '';
  };

  public static deserializeNamedFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    className: TypeName,
    factoryName: TypeName,
    appliesOn: AppliesOnNamedFactory[]
  ): string => {
    const node = nodeRepository.get(factoryName.value);

    if (node) {
      return FactoryBlock.buildFromNamedFactory(config, node, className, factoryName, appliesOn);
    }

    return '';
  };

  public static buildFromFactory = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    className: TypeName,
    appliesOn: AppliesOnDefaultFactory[]
  ): string => {
    return FactoryBlock.build(config, node, appliesOn, className);
  };

  public static buildFromNamedFactory = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    className: TypeName,
    factoryName: TypeName,
    appliesOn: AppliesOnNamedFactory[]
  ): string => {
    return FactoryBlock.build(config, node, appliesOn, className, factoryName);
  };
}
