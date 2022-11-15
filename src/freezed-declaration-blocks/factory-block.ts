import {
  AppliesOnDefaultFactory,
  AppliesOnFactory,
  AppliesOnNamedFactory,
  FlutterFreezedPluginConfig,
  NodeType,
} from 'src/config';
import { TypeName } from 'src/models/type-field-name';
import {
  buildBlockComment,
  buildBlockDecorators,
  buildBlockHeader,
  buildBlockBody,
  buildBlockFooter,
  NodeRepository,
} from '../utils';

export class FreezedFactoryBlock {
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
    buildBlockOutput: string[]
  ): string => {
    return buildBlockOutput
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
      return FreezedFactoryBlock.buildFromFactory(config, node, typeName, appliesOn);
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
      return FreezedFactoryBlock.buildFromNamedFactory(config, node, typeName, namedConstructor, appliesOn);
    }

    return '';
  };

  public static buildFromFactory = (
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    typeName: TypeName,
    appliesOn: AppliesOnDefaultFactory[]
  ): string => {
    return FreezedFactoryBlock.build(config, node, appliesOn, typeName);
  };

  public static buildFromNamedFactory = (
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    typeName: TypeName,
    namedConstructor: string,
    appliesOn: AppliesOnNamedFactory[]
  ): string => {
    return FreezedFactoryBlock.build(config, node, appliesOn, typeName, namedConstructor);
  };

  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    appliesOn: AppliesOnFactory[],
    typeName: TypeName,

    namedConstructor = ''
  ): string {
    let block = '';

    block += buildBlockComment(node);

    block += buildBlockDecorators(config, node, appliesOn);

    block += buildBlockHeader(config, node, appliesOn, typeName, namedConstructor);

    block += buildBlockBody(config, node, appliesOn);

    const _namedConstructor = appliesOn.includes('default_factory') ? node.name.value : namedConstructor;
    block += buildBlockFooter(config, node, appliesOn, _namedConstructor);

    return block;
  }
}
