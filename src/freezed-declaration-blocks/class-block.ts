import { Kind } from 'graphql';
import { FlutterFreezedPluginConfig } from '../config';
import {
  buildBlockComment,
  buildBlockDecorators,
  buildBlockHeader,
  buildBlockBody,
  buildBlockFooter,
  NodeType,
} from '../utils';

export class FreezedDeclarationBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const blockType = node.kind === Kind.ENUM_TYPE_DEFINITION ? 'enum' : 'class';

    let block = '';

    block += buildBlockComment(node);
    block += buildBlockDecorators(node, config);
    block += buildBlockHeader(blockType, config, node);
    block += buildBlockBody(blockType, config, node);
    block += buildBlockFooter(blockType, config, node);
    return block;
  }
}
