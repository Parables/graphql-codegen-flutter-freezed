import { EnumTypeDefinitionNode, EnumValueDefinitionNode } from 'graphql';
import { TypeName, FieldName } from '../config/pattern-new';
import { FlutterFreezedPluginConfig } from '../config/plugin-config';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Block } from './index';
import { Config } from '../config/config-value';
import { atJsonKeyDecorator } from '../utils';

export class EnumBlock {
  public static build(config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string {
    const typeName = TypeName.fromString(node.name.value);

    let block = '';

    block += Block.buildComment(node);

    block += this.buildDecorators();

    block += this.buildHeader(config, typeName);

    block += this.buildBody(config, node);

    block += this.buildFooter();

    return block;
  }

  public static buildDecorators = (): string => {
    return '';
  };

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const enumTypeName = Block.buildBlockName(config, typeName.value, typeName, undefined, 'PascalCase', ['enum']);
    return `enum ${enumTypeName} {\n`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string => {
    const typeName = TypeName.fromString(node.name.value);
    return (node.values ?? [])
      ?.map((enumValue: EnumValueDefinitionNode) => {
        const fieldName = FieldName.fromString(enumValue.name.value);
        const enumValueName = Block.buildBlockName(
          config,
          fieldName.value,
          typeName,
          fieldName,
          Config.camelCasedEnums(config),
          ['enum_value']
        );

        const comment = Block.buildComment(enumValue);
        const decorators = [atJsonKeyDecorator(fieldName.value, enumValueName)].join('');
        return indent(`${comment}${decorators}${enumValueName},\n`);
      })
      .join('');
  };

  public static buildFooter = (): string => {
    return '}\n\n';
  };
}
