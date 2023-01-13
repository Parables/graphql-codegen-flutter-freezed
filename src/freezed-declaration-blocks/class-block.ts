import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Kind } from 'graphql';
import { Config } from '../config/config-value';
import { APPLIES_ON_CLASS, FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config';
import { FactoryBlock } from './factory-block';
import { TypeName } from '../config/pattern-new';
import { Block } from './index';

export class ClassBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const typeName = TypeName.fromString(node.name.value);
    const className = Block.buildBlockName(config, typeName.value, typeName, undefined, 'PascalCase', APPLIES_ON_CLASS);

    let block = '';

    block += Block.buildComment(node);

    block += this.buildDecorators(config, node);

    block += this.buildHeader(config, typeName, className);

    block += this.buildBody(config, node);

    block += this.buildFooter(config, typeName, className);

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

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName, className: string): string => {
    const privateEmptyConstructor = Config.privateEmptyConstructor(config, typeName)
      ? indent(`const ${className}._();\n\n`)
      : '';

    return `class ${className} with _$${className} {\n${privateEmptyConstructor}`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const typeName = TypeName.fromString(node.name.value);

    let body = '';

    if (node.kind === Kind.OBJECT_TYPE_DEFINITION) {
      body += FactoryBlock.serializeDefaultFactory(typeName);
    } else if (node.kind === Kind.UNION_TYPE_DEFINITION) {
      body += (node.types ?? [])
        .map(value => {
          const unionTypeName = TypeName.fromString(value.name.value);
          return FactoryBlock.serializeUnionFactory(typeName, unionTypeName);
        })
        .join('');
    }

    body += Config.mergeTypes(config, typeName)
      .map(value => {
        const mergedTypeName = TypeName.fromString(value);
        return FactoryBlock.serializeMergedFactory(typeName, mergedTypeName);
      })
      .join('');

    return body;
  };

  public static buildFooter = (config: FlutterFreezedPluginConfig, typeName: TypeName, className: string): string => {
    const fromJsonToJson = Config.fromJsonToJson(config, typeName);

    if (fromJsonToJson) {
      return indent(`factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);\n}\n\n`);
    }
    return '}\n\n';
  };
}
