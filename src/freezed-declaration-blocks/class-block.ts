import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Kind } from 'graphql';
import { Config } from '../config/config-value';
import { FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config';
import { buildComment } from '.';
import { BlockName } from './block-name';
import { FactoryBlock } from './factory-block';
import { TypeName } from '../config/pattern-new';

export class ClassBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const typeName = TypeName.fromString(node.name.value);

    let block = '';

    block += buildComment(node);

    block += this.buildDecorators(config, node);

    block += this.buildHeader(config, typeName);

    block += this.buildBody(config, node);

    block += this.buildFooter(config, typeName);

    return block;
  }

  public static buildDecorators = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const freezedDecorator = ClassBlock.buildFreezedDecorator(config, node);
    // TODO: consider implementing custom decorators
    return [freezedDecorator].join('');
  };

  static buildFreezedDecorator = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    // this is the start of the pipeline of decisions to determine which Freezed decorator to use
    return ClassBlock.decorateAsUnfreezed(config, node);
  };

  static decorateAsUnfreezed = (config: FlutterFreezedPluginConfig, node: NodeType) => {
    const typeName = TypeName.fromString(node.name.value);
    const immutable = Config.immutable(config, typeName);
    const mutableInputs = Config.mutableInputs(config, typeName);
    const mutable = immutable !== true || (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && mutableInputs);

    return mutable ? '@unfreezed\n' : ClassBlock.decorateAsFreezed(config, typeName);
  };

  static decorateAsFreezed = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const { isCustomized, copyWith, equal, makeCollectionsUnmodifiable, unionKey, unionValueCase } =
      this.isCustomizedFreezed(config, typeName);
    if (isCustomized) {
      let atFreezed = '@Freezed(\n';

      if (copyWith !== undefined) {
        atFreezed += indent(`copyWith: ${copyWith},\n`);
      }

      if (equal !== undefined) {
        atFreezed += indent(`equal: ${equal},\n`);
      }

      if (makeCollectionsUnmodifiable !== undefined) {
        atFreezed += indent(`makeCollectionsUnmodifiable: ${makeCollectionsUnmodifiable},\n`);
      }

      if (unionKey !== undefined) {
        atFreezed += indent(`unionKey: ${unionKey},\n`);
      }

      if (unionValueCase !== undefined) {
        atFreezed += indent(`unionValueCase: '${unionValueCase}',\n`);
      }

      atFreezed += ')\n';

      return atFreezed;
    }
    // else fallback to the normal `@freezed` decorator
    return '@freezed\n';
  };

  static isCustomizedFreezed = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
    const copyWith = Config.copyWith(config, typeName);
    const equal = Config.equal(config, typeName);
    const makeCollectionsUnmodifiable = Config.makeCollectionsUnmodifiable(config, typeName);
    const unionKey = Config.unionKey();
    const unionValueCase = Config.unionValueCase();
    const isCustomized =
      copyWith !== undefined ||
      equal !== undefined ||
      makeCollectionsUnmodifiable !== undefined ||
      unionKey !== undefined ||
      unionValueCase !== undefined;
    return { copyWith, equal, makeCollectionsUnmodifiable, unionKey, unionValueCase, isCustomized };
  };

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const className = BlockName.asClassName(config, typeName).value;

    const privateEmptyConstructor = Config.privateEmptyConstructor(config, typeName)
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

    // const mergeWithTypeNames = Config.mergeTypes(/* config, typeName */);
    // TODO: Handle mergeTypes: TODO: Rename to mergeWith

    return body;
  };

  public static buildFooter = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const blockName = BlockName.asClassName(config, typeName).value;
    const fromJsonToJson = Config.fromJsonToJson();

    if (fromJsonToJson) {
      return indent(`factory ${blockName}.fromJson(Map<String, dynamic> json) => _$${blockName}FromJson(json);\n}\n\n`);
    }
    return '}\n\n';
  };
}
