import { AppliesOnParameters, FieldType, FlutterFreezedPluginConfig, NodeType } from 'src/config';
import { TypeName } from 'src/models/type-field-name';
import { buildBlockComment, buildBlockDecorators, buildBlockHeader } from 'src/utils';

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
