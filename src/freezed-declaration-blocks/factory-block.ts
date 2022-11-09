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
    blockType: 'factory' | 'named_factory',
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    namedConstructor = ''
  ): string {
    let block = '';

    block += buildBlockComment(node);
    block += buildBlockDecorators(node, config);
    block += buildBlockHeader(blockType, config, node, undefined, namedConstructor);
    block += buildBlockBody(blockType, config, node);
    block += buildBlockFooter(blockType, config, node);
    return block;
  }

  public static factoryPlaceholder = (blockName: string): string => {
    return `==>factory==>${blockName}`;
  };

  public static namedFactoryPlaceholder = (blockName: string, namedConstructor: string): string => {
    return `==>named_factory==>${blockName}==>${namedConstructor}`;
  };

  public static buildFromFactory = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    return FreezedFactoryBlock.build('factory', config, node);
  };

  public static buildFromNamedFactory = (
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    namedConstructor: string
  ): string => {
    return FreezedFactoryBlock.build('named_factory', config, node, namedConstructor);
  };
}
