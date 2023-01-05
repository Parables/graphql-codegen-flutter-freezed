import { indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { EnumTypeDefinitionNode, EnumValueDefinitionNode } from 'graphql';
import { TypeName, FieldName } from '../config/pattern-new';
import { FlutterFreezedPluginConfig } from '../config/plugin-config';
import { buildComment } from '.';
import { BlockName } from './block-name';

export class EnumBlock {
  public static build(config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string {
    const typeName = TypeName.fromString(node.name.value);

    let block = '';

    block += buildComment(node);

    block += this.buildDecorators();

    block += this.buildHeader(config, typeName);

    block += this.buildBody(config, node);

    block += this.buildFooter();

    return block;
  }

  //#region Step 03.01. Build Enum Block

  public static buildDecorators = (): string => {
    return '';
  };

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    return `enum ${BlockName.asEnumTypeName(config, typeName)} {\n`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string => {
    const typeName = TypeName.fromString(node.name.value);
    return (node.values ?? [])
      ?.map((enumValue: EnumValueDefinitionNode) => {
        const fieldName = FieldName.fromString(enumValue.name.value);
        const blockName = BlockName.asEnumValueName(config, typeName, fieldName);

        // const decorators = buildBlockDecorators(config, enumValue, ['enum_value'] as AppliesOnEnumValue[]);

        // return indentMultiline(`${decorators}${buildComment(enumValue)}${blockName},\n`);
        return indentMultiline(`${buildComment(enumValue)}${blockName},\n`);
      })
      .join('');
  };

  public static buildFooter = (): string => {
    return '}\n\n';
  };

  //#endregion
}
