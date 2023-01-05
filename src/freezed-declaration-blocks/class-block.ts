import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Kind } from 'graphql';
import { Config } from '../config/config-value';
import { FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config';
import { buildComment } from '.';
import { BlockName } from './block-name';
import { FactoryBlock } from './factory-block';
import { TypeName } from 'src/config/pattern-new';

export class ClassBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const typeName = TypeName.fromString(node.name.value);

    let block = '';

    block += buildComment(node);

    block += this.buildDecorators();

    block += this.buildHeader(config, typeName);

    block += this.buildBody(config, node);

    block += this.buildFooter(config, typeName);

    return block;
  }

  //#region Step 03.02. Build Class Block
  public static buildDecorators = (): string => {
    return '';
  };

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const className = BlockName.asClassName(config, typeName);

    const privateEmptyConstructor = Config.privateEmptyConstructor(/* config, typeName */)
      ? indent(`const ${className}._();\n\n`)
      : '';

    return `class ${className} with _$${className} {\n${privateEmptyConstructor}`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const typeName = TypeName.fromString(node.name.value);

    let body = '';

    if (node.kind === Kind.OBJECT_TYPE_DEFINITION) {
      body += FactoryBlock.serializeFactory(typeName, ['factory', 'default_factory']);
    } else if (node.kind === Kind.UNION_TYPE_DEFINITION) {
      body += (node.types ?? [])
        .map(value => {
          const namedConstructor = value.name.value;
          return FactoryBlock.serializeNamedFactory(typeName, namedConstructor, [
            'factory',
            'named_factory',
            'named_factory_for_union_types',
          ]);
        })
        .join('');
    }

    // const mergeWithTypeNames = Config.mergeInputs(/* config, typeName */);
    // TODO: Handle mergeInputs: TODO: Rename to mergeWith

    return body;
  };

  public static buildFooter = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const blockName = BlockName.asClassName(config, typeName);
    const fromJsonToJson = Config.fromJsonToJson();

    if (fromJsonToJson) {
      return indent(`factory ${blockName}.fromJson(Map<String, dynamic> json) => _$${blockName}FromJson(json);\n}\n\n`);
    }
    return '}\n\n';
  };

  //#endregion
}
