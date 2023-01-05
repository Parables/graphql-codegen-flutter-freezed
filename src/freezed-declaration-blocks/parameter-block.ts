import { indent } from '@graphql-codegen/visitor-plugin-common';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, TypeNode } from 'graphql';
import { Config } from '../config/config-value';
import { FieldName, TypeName } from '../config/pattern-new';
import { AppliesOnParameters, FieldType, FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config';
import { BlockName } from './block-name';
import { buildComment } from './index';

export class ParameterBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    appliesOn: AppliesOnParameters[],
    field: FieldType
  ): string {
    let block = '';

    block += buildComment(node);

    block += this.buildDecorators();

    block += this.buildParameter(config, node, field, appliesOn);

    return block;
  }

  //#region Step 03.04. Build Parameter Block
  public static buildDecorators = (): string => {
    // TODO: add decorator for unionValueName
    return '';
  };

  public static buildParameter = (
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    field: FieldType,
    appliesOn: AppliesOnParameters[]
  ): string => {
    const typeName = TypeName.fromString(node.name.value);
    const fieldName = FieldName.fromString(field.name.value);

    const required = this.isNonNullType(field.type) ? 'required ' : '';
    const final = Config.final() ? 'final ' : '';
    const dartType = this.parameterType(config, field.type);
    const name = BlockName.asParameterName(config, typeName, fieldName);

    return indent(`${required}${final}${dartType} ${name},\n`, 2);
  };

  public static parameterType = (config: FlutterFreezedPluginConfig, type: TypeNode, parentType?: TypeNode): string => {
    if (this.isNonNullType(type)) {
      return this.parameterType(config, type.type, type);
    }

    if (this.isListType(type)) {
      const T = this.parameterType(config, type.type, type);
      return `List<${T}>${this.isNonNullType(parentType) ? '' : '?'}`;
    }

    if (this.isNamedType(type)) {
      return `${Config.customScalars(config, type.name.value)}${this.isNonNullType(parentType) ? '' : '?'}`;
    }

    return '';
  };

  public static isListType = (type?: TypeNode): type is ListTypeNode => type?.kind === 'ListType';

  public static isNonNullType = (type?: TypeNode): type is NonNullTypeNode => type?.kind === 'NonNullType';

  public static isNamedType = (type?: TypeNode): type is NamedTypeNode => type?.kind === 'NamedType';

  //#endregion
}
