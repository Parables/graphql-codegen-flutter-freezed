import { Kind } from 'graphql';
import { AppliesOnClass, AppliesOnEnum, FlutterFreezedPluginConfig, NodeType } from '../config';
import { TypeName } from '../models/type-field-name';
import { buildBlockComment, buildBlockDecorators, buildBlockHeader, buildBlockBody, buildBlockFooter } from '../utils';

export class FreezedDeclarationBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const appliesOn: AppliesOnEnum[] | AppliesOnClass[] =
      node.kind === Kind.ENUM_TYPE_DEFINITION ? ['enum'] : ['class'];

    const typeName = TypeName.fromString(node.name.value);

    let block = '';

    block += buildBlockComment(node);

    block += buildBlockDecorators(config, node, appliesOn);

    block += buildBlockHeader(config, node, appliesOn, typeName);

    block += buildBlockBody(config, node, appliesOn);

    block += buildBlockFooter(config, node, appliesOn);

    return block;
  }
}
