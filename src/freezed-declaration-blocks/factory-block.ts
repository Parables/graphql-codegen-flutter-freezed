import { FlutterFreezedPluginConfig } from '../config';
import {
  buildBlockComment,
  // buildBlockDecorators,
  buildBlockHeader,
  buildBlockBody,
  buildBlockFooter,
  NodeType,
  NodeRepository,
} from '../utils';

export class FreezedFactoryBlock {
  public static serializeFactory = (blockName: string): string => {
    return `==>factory==>${blockName}\n`;
  };

  public static serializeNamedFactory = (blockName: string, namedConstructor: string): string => {
    return `==>named_factory==>${blockName}==>${namedConstructor}\n`;
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
            const blockName = token.replace('==>factory==>', '').trim();
            return this.deserializeFactory(config, nodeRepository, blockName);
          });
        } else if (block.includes('==>named_factory==>')) {
          return block.replace(/==>named_factory==>.+\n/gm, token => {
            const pattern = token.replace('==>named_factory==>', '').trim();
            const [blockName, namedConstructor] = pattern.split('==>');
            return this.deserializeNamedFactory(config, nodeRepository, blockName, namedConstructor);
          });
        }
        return block;
      })
      .join('');
  };

  public static deserializeFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    blockName: string
  ): string => {
    const node = nodeRepository.get(blockName);

    if (node) {
      return FreezedFactoryBlock.buildFromFactory(config, node, blockName);
    }

    return '';
  };

  public static deserializeNamedFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    blockName: string,
    namedConstructor: string
  ): string => {
    const node = nodeRepository.get(namedConstructor);

    if (node) {
      return FreezedFactoryBlock.buildFromNamedFactory(config, node, blockName, namedConstructor);
    }

    return '';
  };

  public static buildFromFactory = (config: FlutterFreezedPluginConfig, node: NodeType, blockName: string): string => {
    return FreezedFactoryBlock.build(config, node, 'factory', blockName);
  };

  public static buildFromNamedFactory = (
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    blockName: string,
    namedConstructor: string
  ): string => {
    return FreezedFactoryBlock.build(config, node, 'named_factory', blockName, namedConstructor);
  };

  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    blockType: 'factory' | 'named_factory',
    blockName: string,
    namedConstructor = ''
  ): string {
    let block = '';

    // TODO: Implement comments(multi-line) and decorators

    block += buildBlockComment(node);
    // block += buildBlockDecorators(node, config);
    block += buildBlockHeader(config, node, blockType, blockName, namedConstructor);
    block += buildBlockBody(config, node, blockType);
    block += buildBlockFooter(config, node, blockType, blockType === 'factory' ? node.name.value : namedConstructor);
    return block;
  }
}
