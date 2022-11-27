import { indent } from '@graphql-codegen/visitor-plugin-common';
import { camelCase } from 'change-case-all';
import { Kind } from 'graphql';
import { FlutterFreezedPluginConfig, NodeType, TypeName, Config } from '../config';
import { buildComment } from '.';
import { BlockName } from './block-name';
import { FactoryBlock } from './factory-block';

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

    const privateEmptyConstructor = Config.privateEmptyConstructor(config, typeName)
      ? indent(`const ${className}._();\n\n`)
      : '';

    return `class ${className} with _$${className} {\n${privateEmptyConstructor}`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const typeName = TypeName.fromString(node.name.value);

    const mergeWithTypeNames = Config.mergeInputs(config, typeName);

    if (node.kind === Kind.UNION_TYPE_DEFINITION) {
      return (
        node.types
          ?.map(value => {
            const namedConstructor = value.name.value;
            return FactoryBlock.serializeNamedFactory(typeName, namedConstructor, [
              'factory',
              'named_factory',
              'named_factory_for_union_types',
            ]);
          })
          .join('') ?? ''
      );
    } else if (node.kind === Kind.OBJECT_TYPE_DEFINITION && mergeWithTypeNames.length > 0) {
      return [FactoryBlock.serializeFactory(typeName, ['factory', 'default_factory'])]
        .concat(
          mergeWithTypeNames.map(mergeWithTypeName => {
            let namedConstructor = undefined;
            let separator = undefined;

            if (mergeWithTypeName.includes('$')) {
              separator = '$';
            } else if (mergeWithTypeName.includes(typeName.value)) {
              separator = mergeWithTypeName;
            }

            if (separator) {
              namedConstructor = camelCase(mergeWithTypeName.split(separator).join('_'));
            } else {
              namedConstructor = camelCase(mergeWithTypeName);
            }

            return FactoryBlock.serializeNamedFactory(typeName, namedConstructor, [
              'factory',
              'named_factory',
              'named_factory_for_merged_types',
            ]);
          })
        )
        .join('');
    }
    return '';
  };

  public static buildFooter = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const blockName = BlockName.asClassName(config, typeName);
    const fromJsonToJson = true; // TODO: GEt this from config

    if (fromJsonToJson) {
      return indent(`factory ${blockName}.fromJson(Map<String, dynamic> json) => _$${blockName}FromJson(json);\n}\n\n`);
    }
    return '}\n\n';
  };

  //#endregion
}
