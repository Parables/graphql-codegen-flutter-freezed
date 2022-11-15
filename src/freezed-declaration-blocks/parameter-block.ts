import { AppliesOnParameters, FieldType, FlutterFreezedPluginConfig, NodeType } from '../config';
import { TypeName } from '../models/type-field-name';
import { buildBlockComment, buildBlockDecorators, buildBlockHeader } from '../utils';

export class FreezedParameterBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    appliesOn: AppliesOnParameters[],
    field: FieldType
  ): string {
    const typeName = TypeName.fromString(node.name.value);
    let block = '';

    block += buildBlockComment(node);
    block += buildBlockDecorators(config, node, appliesOn);
    block += buildBlockHeader(config, node, appliesOn, typeName, undefined, field);
    return block;
  }
}
