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
} from '../config/plugin-config';
import { NodeRepository } from './node-repository';
import { buildComment } from './index';
import { BlockName } from './block-name';
import { ParameterBlock } from './parameter-block';

export class FactoryBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    appliesOn: AppliesOnFactory[],
    typeName: TypeName,
    namedConstructor = ''
  ): string {
    let block = '';

    block += buildComment(node);

    block += this.buildDecorators();

    block += this.buildHeader(config, typeName, namedConstructor);

    block += this.buildBody(config, node, appliesOn);

    const _namedConstructor = appliesOn.includes('default_factory') ? node.name.value : namedConstructor;
    block += this.buildFooter(config, appliesOn, _namedConstructor);

    return block;
  }

  //#region Step 03.03. Build Factory Block
  public static buildDecorators = (): string => {
    return '';
  };

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName, namedConstructor?: string) => {
    const immutable = Config.immutable(/* config, typeName */);
    const constFactory = immutable ? indent('const factory') : indent('factory');

    if (namedConstructor && namedConstructor?.length > 0) {
      return `${constFactory} ${BlockName.asNamedConstructor(config, typeName, namedConstructor)}({\n`;
    }

    return `${constFactory} ${BlockName.asClassName(config, typeName)}({\n`;
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
        ?.map(field => {
          return ParameterBlock.build(config, node, appliesOnParameters, field);
        })
        .join('') ?? ''
    );
  };

  public static buildFooter = (
    config: FlutterFreezedPluginConfig,
    appliesOn: AppliesOnFactory[],
    namedConstructor: string
  ) => {
    const typeName = TypeName.fromString(namedConstructor);
    const _ = appliesOn.includes('default_factory') ? '_' : '';
    const factoryFooterName = BlockName.asClassName(config, typeName);
    return indent(`}) = ${_}${factoryFooterName};\n\n`);
  };

  //#endregion

  public static serializeFactory = (typeName: TypeName, appliesOn: AppliesOnDefaultFactory[]): string => {
    return `==>factory==>${typeName.value}==>${appliesOn.join(',')}\n`;
  };

  public static serializeNamedFactory = (
    typeName: TypeName,
    namedConstructor: string,
    appliesOn: AppliesOnNamedFactory[]
  ): string => {
    return `==>named_factory==>${typeName.value}==>${namedConstructor}==>${appliesOn.join(',')}\n`;
  };

  public static extractAndReplaceTokens = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    generatedBlocks: string[]
  ): string => {
    return generatedBlocks
      .map(block => {
        if (block.includes('==>factory==>')) {
          return block.replace(/==>factory==>.+\n?/gm, token => {
            const pattern = token.replace('==>factory==>', '').trim();
            const [typeName, appliesOn] = pattern.split('==>');
            return this.deserializeFactory(
              config,
              nodeRepository,
              TypeName.fromString(typeName),
              appliesOn.split(',') as AppliesOnDefaultFactory[]
            );
          });
        } else if (block.includes('==>named_factory==>')) {
          return block.replace(/==>named_factory==>.+\n/gm, token => {
            const pattern = token.replace('==>named_factory==>', '').trim();
            const [typeName, namedConstructor, appliesOn] = pattern.split('==>');
            return this.deserializeNamedFactory(
              config,
              nodeRepository,
              TypeName.fromString(typeName),
              namedConstructor,
              appliesOn.split(',') as AppliesOnNamedFactory[]
            );
          });
        }
        return block;
      })
      .join('');
  };

  public static deserializeFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    typeName: TypeName,
    appliesOn: AppliesOnDefaultFactory[]
  ): string => {
    const node = nodeRepository.get(typeName.value);

    if (node) {
      return FactoryBlock.buildFromFactory(config, node, typeName, appliesOn);
    }

    return '';
  };

  public static deserializeNamedFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    typeName: TypeName,
    namedConstructor: string,
    appliesOn: AppliesOnNamedFactory[]
  ): string => {
    const node = nodeRepository.get(namedConstructor);

    if (node) {
      return FactoryBlock.buildFromNamedFactory(config, node, typeName, namedConstructor, appliesOn);
    }

    return '';
  };

  public static buildFromFactory = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    typeName: TypeName,
    appliesOn: AppliesOnDefaultFactory[]
  ): string => {
    return FactoryBlock.build(config, node, appliesOn, typeName);
  };

  public static buildFromNamedFactory = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    typeName: TypeName,
    namedConstructor: string,
    appliesOn: AppliesOnNamedFactory[]
  ): string => {
    return FactoryBlock.build(config, node, appliesOn, typeName, namedConstructor);
  };
}
