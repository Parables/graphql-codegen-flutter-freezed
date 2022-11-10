import { FlutterFreezedPluginConfig } from '../config';
import {
  buildBlockComment,
  buildBlockDecorators,
  buildBlockHeader,
  buildBlockBody,
  buildBlockFooter,
  NodeType,
} from '../utils';

export class FreezedFactoryBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    blockType: 'factory' | 'named_factory',
    namedConstructor = ''
  ): string {
    let block = '';

    // TODO: Implement comments(multi-line) and decoratos

    // block += buildBlockComment(node);
    // block += buildBlockDecorators(node, config);
    block += buildBlockHeader(config, node, blockType, undefined, namedConstructor);
    block += buildBlockBody(config, node, blockType);
    block += buildBlockFooter(config, node, blockType);
    return block;
  }

  public static factoryPlaceholder = (blockName: string): string => {
    return `==>factory==>${blockName}`;
  };

  public static namedFactoryPlaceholder = (blockName: string, namedConstructor: string): string => {
    return `==>named_factory==>${blockName}==>${namedConstructor}`;
  };

  public static buildFromFactory = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    return FreezedFactoryBlock.build(config, node, 'factory');
  };

  public static buildFromNamedFactory = (
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    namedConstructor: string
  ): string => {
    return FreezedFactoryBlock.build(config, node, 'named_factory', namedConstructor);
  };
}
