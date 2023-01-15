import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Kind } from 'graphql';
import { Config } from '../config/config-value';
import { APPLIES_ON_CLASS, FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config';
import { FactoryBlock } from './factory-block';
import { TypeName } from '../config/pattern-new';
import { Block } from './index';
import { nodeIsObjectType } from '../utils';

export class ClassBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const typeName = TypeName.fromString(node.name.value);
    const _className = Block.buildBlockName(
      config,
      APPLIES_ON_CLASS,
      typeName.value,
      typeName,
      undefined,
      'PascalCase'
    );

    let block = '';

    // the comments should be  on the factory block instead
    // block += Block.buildComment(node);

    block += this.buildDecorators(config, node);

    block += this.buildHeader(config, typeName, _className);

    block += this.buildBody(config, node);

    block += this.buildFooter(config, typeName, _className);

    return block;
  }

  public static buildDecorators = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const freezedDecorator = ClassBlock.buildFreezedDecorator(config, node);
    // TODO: consider implementing custom decorators
    return [freezedDecorator].join('');
  };

  static buildFreezedDecorator = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    // this is the start of the pipeline of decisions to determine which Freezed decorator to use
    return ClassBlock.decorateAsFreezed(config, node);
  };

  static decorateAsFreezed = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const typeName = TypeName.fromString(node.name.value);
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
    return ClassBlock.decorateAsUnfreezed(config, node);
  };

  static decorateAsUnfreezed = (config: FlutterFreezedPluginConfig, node: NodeType) => {
    const typeName = TypeName.fromString(node.name.value);
    const immutable = Config.immutable(config, typeName);
    const mutableInputs = Config.mutableInputs(config, typeName);
    const mutable = immutable !== true || (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && mutableInputs);

    return mutable ? '@unfreezed\n' : '@freezed\n';
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

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName, _className: string): string => {
    const privateEmptyConstructor = Config.privateEmptyConstructor(config, typeName)
      ? indent(`const ${_className}._();\n\n`)
      : '';

    return `class ${_className} with _$${_className} {\n${privateEmptyConstructor}`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const className = TypeName.fromString(node.name.value);

    let body = '';

    if (nodeIsObjectType(node)) {
      body += FactoryBlock.serializeDefaultFactory(className);
    } else if (node.kind === Kind.UNION_TYPE_DEFINITION) {
      body += (node.types ?? [])
        .map(value => {
          const factoryName = TypeName.fromString(value.name.value);
          return FactoryBlock.serializeUnionFactory(className, factoryName);
        })
        .join('');
    }

    body += Config.mergeTypes(config, className)
      .map(value => {
        const factoryName = TypeName.fromString(value);
        return FactoryBlock.serializeMergedFactory(className, factoryName);
      })
      .join('');

    return body;
  };

  public static buildFooter = (config: FlutterFreezedPluginConfig, typeName: TypeName, _className: string): string => {
    return indent(`factory ${_className}.fromJson(Map<String, dynamic> json) => _$${_className}FromJson(json);\n}\n\n`);
  };
}
