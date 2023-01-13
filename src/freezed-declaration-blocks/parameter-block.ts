import { indent } from '@graphql-codegen/visitor-plugin-common';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, TypeNode } from 'graphql';
import { Config } from '../config/config-value';
import { FieldName, TypeName } from '../config/pattern-new';
import { AppliesOnParameters, FieldType, FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config';
import { Block } from './index';

export class ParameterBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    field: FieldType,
    appliesOn: AppliesOnParameters[]
  ): string {
    let block = '';

    block += Block.buildComment(node);

    block += this.buildDecorators();

    block += this.buildParameter(config, node, field, appliesOn);

    return block;
  }

  //#region Step 03.04. Build Parameter Block
  public static buildDecorators = (): string => {
    // TODO: add decorator for unionValueName
    // TODO: @deprecated
    // TODO: @Default
    // TODO: @JsonKey(name: 'name', fromJson: someClassOrFunc, toJson: someClassOrFunc)
    return '';
  };

  public static buildParameter = (
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    field: FieldType,
    blockAppliesOn: AppliesOnParameters[]
  ): string => {
    const typeName = TypeName.fromString(node.name.value);
    const fieldName = FieldName.fromString(field.name.value);

    const required = this.isNonNullType(field.type) ? 'required ' : '';
    const final = Config.final(config, typeName, fieldName, blockAppliesOn) ? 'final ' : '';
    const dartType = this.parameterType(config, field.type);
    const name = Block.buildBlockName(config, fieldName.value, typeName, fieldName, 'camelCase', blockAppliesOn);

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
