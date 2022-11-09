import { indent } from '@graphql-codegen/visitor-plugin-common';
import { camelCase, pascalCase } from 'change-case-all';
import {
  ArgumentNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  TypeNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import {
  ApplyDecoratorOn,
  CustomDecorator,
  FreezedConfig,
  FlutterFreezedPluginConfig,
  TypeSpecificFreezedConfig,
} from './config';
import { FreezedDeclarationBlock, FreezedFactoryBlock } from './freezed-declaration-blocks';

export type FieldType = FieldDefinitionNode | InputValueDefinitionNode;

export type NodeType =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode;

export type ObjectType = ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode;

export const isObjectType = (node: NodeType): node is ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode =>
  node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;

export type OptionName =
  // FreezedClassConfig
  | 'alwaysUseJsonKeyName'
  | 'copyWith'
  | 'customDecorators'
  | 'equal'
  | 'fromJsonToJson'
  | 'immutable'
  | 'makeCollectionsUnmodifiable'
  | 'mergeInputs'
  | 'mutableInputs'
  | 'privateEmptyConstructor'
  | 'unionKey'
  | 'unionValueCase';

//#region helpers

/**
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
export function getFreezedConfigValue<T>(
  option: OptionName,
  config: FlutterFreezedPluginConfig,
  typeName?: string | undefined
): any {
  if (typeName) {
    return (
      (config?.typeSpecificFreezedConfig?.[typeName]?.config?.[option] as T) ??
      (getFreezedConfigValue(option, config) as T)
    );
  }
  return config?.globalFreezedConfig?.[option] as T;
}

/** returns freezed import statements */
export const buildImportStatements = (fileName: string) => {
  return [
    `import 'package:freezed_annotation/freezed_annotation.dart';\n`,
    `import 'package:flutter/foundation.dart';\n\n`,
    `part '${fileName.replace(/\.dart/g, '')}.freezed.dart';\n`,
    `part '${fileName.replace(/\.dart/g, '')}.g.dart';\n\n`,
  ].join('');
};

// TODO: get this from config or use default or build withPrefix or withSuffix
export const DART_KEYWORDS: Record<string, 'built-in' | 'context' | 'reserved' | 'async-reserved'> = {
  abstract: 'built-in',
  else: 'reserved',
  import: 'built-in',
  show: 'context',
  as: 'built-in',
  enum: 'reserved',
  in: 'reserved',
  static: 'built-in',
  assert: 'reserved',
  export: 'built-in',
  interface: 'built-in',
  super: 'reserved',
  async: 'context',
  extends: 'reserved',
  is: 'reserved',
  switch: 'reserved',
  await: 'async-reserved',
  extension: 'built-in',
  late: 'built-in',
  sync: 'context',
  break: 'reserved',
  external: 'built-in',
  library: 'built-in',
  this: 'reserved',
  case: 'reserved',
  factory: 'built-in',
  mixin: 'built-in',
  throw: 'reserved',
  catch: 'reserved',
  false: 'reserved',
  new: 'reserved',
  true: 'reserved',
  class: 'reserved',
  final: 'reserved',
  null: 'reserved',
  try: 'reserved',
  const: 'reserved',
  finally: 'reserved',
  on: 'context',
  typedef: 'built-in',
  continue: 'reserved',
  for: 'reserved',
  operator: 'built-in',
  var: 'reserved',
  covariant: 'built-in',
  Function: 'built-in',
  part: 'built-in',
  void: 'reserved',
  default: 'reserved',
  get: 'built-in',
  required: 'built-in',
  while: 'reserved',
  deferred: 'built-in',
  hide: 'context',
  rethrow: 'reserved',
  with: 'reserved',
  do: 'reserved',
  if: 'reserved',
  return: 'reserved',
  yield: 'async-reserved',
  dynamic: 'built-in',
  implements: 'built-in',
  set: 'built-in',
  // built-in types
  int: 'reserved',
  double: 'reserved',
  String: 'reserved',
  bool: 'reserved',
  List: 'reserved',
  Set: 'reserved',
  Map: 'reserved',
  Runes: 'reserved',
  Symbol: 'reserved',
  Object: 'reserved',
  Null: 'reserved',
  Never: 'reserved',
  Enum: 'reserved',
  Future: 'reserved',
  Iterable: 'reserved',
};

/**
 *
 * @param blockName
 * @param camelCased
 * @param atJsonKey wraps the name in a `@JsonKey(name: 'blockName') blockName` syntax
 * @returns
 */
export const buildBlockName = (blockName: string, camelCased = false, atJsonKey = false): string => {
  const escapedBlockName = escapeDartKeyword(blockName);

  const name = camelCased ? camelCase(escapedBlockName) : pascalCase(escapedBlockName);

  return atJsonKey ? `@JsonKey(name: '${blockName}') ${name}` : name;
};

// TODO: check if field.name is Dart keyword
export const escapeDartKeyword = (blockName: string): string => {
  return blockName;
};
//#endregion

//#region Step 01. Start Here
export const buildBlock = (
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  objectTypeNodeRepository: ObjectTypeNodeRepository
) => {
  // ignore these...
  if (['Query', 'Mutation', 'Subscription', ...(config?.ignoreTypes ?? [])].includes(node.name.value)) {
    return '';
  }

  if (isObjectType(node)) {
    objectTypeNodeRepository.register(node);
  }

  return FreezedDeclarationBlock.build(config, node);
};

//#endregion

//#region Step 02. Build Comments

// TODO: handle multiline comment
// TODO: Change param `node` to string for easy testing
export const buildBlockComment = (node?: NodeType | EnumValueDefinitionNode): string => {
  const comment = node?.description?.value;

  return comment && comment?.length > 0 ? `/// ${comment} \n` : '';
};

//#endregion

//#region Step 03. Build Decorators

// TODO: modify this for factory blocks too
export const buildBlockDecorators = (node: NodeType, config: FlutterFreezedPluginConfig): string => {
  const name = node.name.value;

  // determine if should mark as deprecated
  const isDeprecated = config.typeSpecificFreezedConfig?.[name]?.deprecated;

  const decorators =
    node.kind === Kind.ENUM_TYPE_DEFINITION
      ? [...transformCustomDecorators(getCustomDecorators(config, ['enum'], name), node)]
      : [
          buildFreezedDecorator(node, config),
          ...transformCustomDecorators(getCustomDecorators(config, ['class'], name), node),
        ];

  return decorators
    .filter(d => d !== '@deprecated')
    .concat(isDeprecated ? ['@deprecated\n'] : [])
    .join('');
};

export const buildFreezedDecorator = (node: NodeType, config: FlutterFreezedPluginConfig) => {
  // this is the start of the pipeline of decisions to determine which Freezed decorator to use
  return decorateAsUnfreezed(node, config);
};

export const decorateAsUnfreezed = (node: NodeType, config: FlutterFreezedPluginConfig) => {
  const mutable =
    !getFreezedConfigValue('immutable', config) ||
    (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && getFreezedConfigValue('mutableInputs', config));

  return mutable ? '@unfreezed\n' : decorateAsFreezed(config);
};

export const decorateAsFreezed = (config: FlutterFreezedPluginConfig) => {
  if (isCustomizedFreezed(config)) {
    const copyWith = getFreezedConfigValue<boolean>('copyWith', config);
    const equal = getFreezedConfigValue<boolean>('equal', config);
    const makeCollectionsUnmodifiable = getFreezedConfigValue<boolean>('makeCollectionsUnmodifiable', config);
    const unionKey = getFreezedConfigValue<string>('unionKey', config);
    const unionValueCase = getFreezedConfigValue<'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal'>(
      'unionValueCase',
      config
    );

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
  // else fallback to the normal @freezed decorator
  return '@freezed\n';
};

export const isCustomizedFreezed = (config: FlutterFreezedPluginConfig) => {
  return (
    getFreezedConfigValue<boolean>('copyWith', config) !== undefined ||
    getFreezedConfigValue<boolean>('equal', config) !== undefined ||
    getFreezedConfigValue<boolean>('makeCollectionsUnmodifiable', config) !== undefined ||
    getFreezedConfigValue<string>('unionKey', config) !== undefined ||
    getFreezedConfigValue<'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal'>('unionValueCase', config) !== undefined
  );
};

/**
 * @description filters the customDirectives to return those that are applied on a list of blocks
 */
export function getCustomDecorators(
  config: FlutterFreezedPluginConfig,
  appliesOn: ApplyDecoratorOn[],
  nodeName?: string | undefined,
  fieldName?: string | undefined
): CustomDecorator {
  const filteredCustomDecorators: CustomDecorator = {};
  const globalCustomDecorators = config?.globalFreezedConfig?.customDecorators ?? {};
  let customDecorators: CustomDecorator = { ...globalCustomDecorators };

  if (nodeName) {
    const typeConfig = config?.typeSpecificFreezedConfig?.[nodeName];
    const typeSpecificCustomDecorators = typeConfig?.config?.customDecorators ?? {};
    customDecorators = { ...customDecorators, ...typeSpecificCustomDecorators };

    if (fieldName) {
      const fieldSpecificCustomDecorators = typeConfig?.fields?.[fieldName]?.customDecorators ?? {};
      customDecorators = {
        ...customDecorators,
        ...fieldSpecificCustomDecorators,
      };
    }
  }

  Object.entries(customDecorators).forEach(([key, value]) =>
    value?.applyOn?.forEach(a => {
      if (appliesOn.includes(a)) {
        filteredCustomDecorators[key] = value;
      }
    })
  );

  return filteredCustomDecorators;
}

export function transformCustomDecorators(
  customDecorators: CustomDecorator,
  node?: NodeType | undefined,
  field?: FieldType | undefined
): string[] {
  let result: string[] = [];

  result = [
    ...result,
    ...(node?.directives ?? [])
      .concat(field?.directives ?? [])
      // extract only the directives whose names were specified as keys
      // and have values that not undefined or null in the customDecorator record
      .filter(d => {
        const key = d.name.value;
        const value = customDecorators[key] ?? customDecorators[`@${key}`];
        if (value && value.mapsToFreezedAs !== 'custom') {
          return true;
        }
        return false;
      })
      // transform each directive to string
      .map(d => directiveToString(d, customDecorators)),
  ];

  // for  decorators that mapsToFreezedAs === 'custom'
  Object.entries(customDecorators).forEach(([key, value]) => {
    if (value.mapsToFreezedAs === 'custom') {
      const args = value?.arguments;
      // if the custom directives have arguments,
      if (args && args.length > 0) {
        // join them with a comma in the parenthesis
        result = [...result, `${key}(${args.join(', ')})\n`];
      } else {
        // else return the customDecorator key just as it is
        result = [...result, key + '\n'];
      }
    }
  });

  return result;
}

/**
 * transforms the directive into a decorator array
 * this decorator array might contain a `final` string which would be filtered out
 * and used to mark the parameter block as final
 */
function directiveToString(directive: DirectiveNode, customDecorators: CustomDecorator) {
  const key = directive.name.value;
  const value = customDecorators[key];
  if (value.mapsToFreezedAs === 'directive') {
    // get the directive's arguments
    const directiveArgs: readonly ArgumentNode[] = directive?.arguments ?? [];
    // extract the directive's argument using the template index: ["$0", "$1", ...]
    // specified in the customDecorator.arguments array
    const args = value?.arguments
      ?.filter(a => directiveArgs[argToInt(a)])
      // transform the template index: ["$0", "$1", ...] into the arguments
      .map(a => directiveArgs[argToInt(a)])
      // transform the arguments into string array of ["name: value" , "name: value", ...]
      .map(a => `${a.name}: ${a.value}`);

    // if the args is not empty
    if (args && args.length > 0) {
      // returns "@directiveName(argName: argValue, argName: argValue ...)"
      return `@${directive.name.value}(${args?.join(', ')})\n`;
    }
  } else if (value.mapsToFreezedAs === '@Default') {
    const defaultValue = directive?.arguments?.[argToInt(value?.arguments?.[0] ?? '0')];
    if (defaultValue) {
      return `@Default(value: ${defaultValue})\n`;
    }
  }
  // returns either "@deprecated" || "final".
  // `final` to be filtered from the decorators array when applying the decorators
  return value.mapsToFreezedAs + '\n';
}

/** transforms string template: "$0" into an integer: 1 */
function argToInt(arg: string) {
  const parsedIndex = Number.parseInt(arg.replace('$', '').trim() ?? '0'); // '$1 => 1
  return parsedIndex ? parsedIndex : 0;
}

//#endregion

//#region Step 03. Build Blocks

export const buildBlockHeader = (
  blockType: 'enum' | 'class' | 'factory' | 'named_factory' | 'parameter',
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  field?: FieldType,
  namedConstructor = ''
): string => {
  const blockName = node.name.value;

  if (blockType === 'enum') {
    return buildEnumHeader(blockName);
  } else if (blockType === 'class') {
    return buildClassHeader(blockName, getFreezedConfigValue<boolean>('privateEmptyConstructor', config));
  } else if (blockType === 'factory' || blockType === 'named_factory') {
    return buildFactoryHeader(blockName, namedConstructor, getFreezedConfigValue<boolean>('immutable', config));
  } else if (blockType === 'parameter' && field) {
    return buildParameterHeader(config, node, field);
  }
  return '';
};

export const buildBlockBody = (
  blockType: 'enum' | 'class' | 'factory' | 'named_factory',
  config: FlutterFreezedPluginConfig,
  node: NodeType
): string => {
  if (blockType === 'enum' && node.kind === Kind.ENUM_TYPE_DEFINITION) {
    return buildEnumBody(config, node);
  } else if (blockType === 'class') {
    return buildClassBody(config, node);
  } else if ((blockType === 'factory' || blockType === 'named_factory') && isObjectType(node)) {
    return buildFactoryBody(config, node);
  }
  return '';
};

export const buildBlockFooter = (
  blockType: 'enum' | 'class' | 'factory' | 'named_factory',
  config: FlutterFreezedPluginConfig,
  node: NodeType | FieldType,
  namedConstructor = ''
): string => {
  const blockName = node.name.value;

  if (blockType === 'enum') {
    return buildEnumFooter();
  } else if (blockType === 'class') {
    return buildClassFooter(blockName, getFreezedConfigValue<boolean>('fromJsonToJson', config));
  } else if (blockType === 'factory' || blockType === 'named_factory') {
    return buildFactoryFooter(namedConstructor);
  }
  return '';
};
//#endregion

//#region Step 03.01. Build Enum Block

export const buildEnumHeader = (blockName: string): string => {
  return `enum ${buildBlockName(blockName)} {\n`;
};

export const buildEnumBody = (config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string => {
  return (
    node.values
      ?.map((field: EnumValueDefinitionNode) => {
        const camelCased = config.camelCasedEnums ?? true;

        const enumField = buildBlockName(field.name.value, camelCased, camelCased); // if camelCased === true, then use atJsonKey

        return indent(`${buildBlockComment(field)}${enumField},\n`);
      })
      .join('') ?? ''
  );
};

export const buildEnumFooter = (): string => {
  return '}\n\n';
};

//#endregion

//#region Step 03.02. Build Class Block

export const buildClassHeader = (blockName: string, withPrivateEmptyConstructor = true): string => {
  const privateEmptyConstructor = withPrivateEmptyConstructor
    ? indent(`const ${buildBlockName(blockName)}._();\n\n`)
    : '';

  return `class ${buildBlockName(blockName)} with _$${buildBlockName(blockName)} {\n${privateEmptyConstructor}`;
};

export const buildClassBody = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
  const blockName = node.name.value;

  if (node.kind === Kind.UNION_TYPE_DEFINITION) {
    return (
      node.types?.map(value => FreezedFactoryBlock.namedFactoryPlaceholder(blockName, value.name.value)).join('') ?? ''
    );
  } else if (isObjectType(node)) {
    return FreezedFactoryBlock.factoryPlaceholder(blockName);
    // TODO: Determine whether to mergeInputs
  }
  return '';
};

export const buildClassFooter = (blockName: string, fromJsonToJson = true): string => {
  if (fromJsonToJson) {
    return indent(`factory ${blockName}.fromJson(Map<String, dynamic> json) => _$${blockName}FromJson(json);\n}\n\n`);
  }
  return '}\n\n';
};

//#endregion

//#region Step 03.03. Build Factory Block

export const buildFactoryHeader = (blockName: string, namedConstructor = '', immutable = true) => {
  const constFactory = immutable ? 'const factory' : 'factory';

  const namedFactoryConstructor = namedConstructor.length > 0 ? `.${buildBlockName(namedConstructor, true)}` : '';

  return `${constFactory} ${buildBlockName(blockName)}${namedFactoryConstructor}({\n`;
};

export const buildFactoryBody = (config: FlutterFreezedPluginConfig, node: ObjectType): string => {
  return node.fields?.map(field => buildBlockHeader('parameter', config, node, field)).join('') ?? '';
};

export const buildFactoryFooter = (namedConstructor = '') => {
  return `}) = ${buildBlockName(namedConstructor)};\n`;
};

//#endregion

//#region Step 03.04. Build Parameter Block

export const buildParameterHeader = (config: FlutterFreezedPluginConfig, node: NodeType, field: FieldType): string => {
  const decorators = ''; // TODO: modify the buildBlockDecorators to be used here

  const required = isNonNullType(field.type) ? 'required ' : '';

  const markedFinal =
    decorators.includes('final') ||
    config.typeSpecificFreezedConfig?.[node.name.value]?.fields?.[field.name.value]?.final;

  const final = markedFinal ? 'final ' : '';

  const type = parameterType(config, field, field.type);

  return indent(`${required}${final} ${type} ${buildBlockName(field.name.value, true)},\n`, 2);
};

export const parameterType = (
  config: FlutterFreezedPluginConfig,
  field: FieldType,
  type: TypeNode,
  parentType?: TypeNode
): string => {
  if (isNonNullType(type)) {
    return parameterType(config, field, type.type, type);
  }

  if (isListType(type)) {
    const T = parameterType(config, field, type.type, type);
    return `List<${T}>${isNonNullType(parentType) ? '' : '?'}`;
  }

  if (isNamedType(type)) {
    return `${getScalarType(config, type.name.value)}${isNonNullType(parentType) ? '' : '?'}`;
  }

  return '';
};

export const isListType = (type?: TypeNode): type is ListTypeNode => type?.kind === 'ListType';

export const isNonNullType = (type?: TypeNode): type is NonNullTypeNode => type?.kind === 'NonNullType';

export const isNamedType = (type?: TypeNode): type is NamedTypeNode => type?.kind === 'NamedType';

/**
 * maps GraphQL scalar types to Dart's scalar types
 */
export const DART_SCALARS: Record<string, string> = {
  ID: 'String',
  String: 'String',
  Boolean: 'bool',
  Int: 'int',
  Float: 'double',
  DateTime: 'DateTime',
};

export const getScalarType = (config: FlutterFreezedPluginConfig, scalar: string): string => {
  if (config?.customScalars?.[scalar]) {
    return config.customScalars[scalar];
  }
  if (DART_SCALARS[scalar]) {
    return DART_SCALARS[scalar];
  }
  return scalar;
};

//#endregion

//#region helper classes
/**
 * stores an instance of  ObjectTypeDefinitionNode using the node names as the key
 * and returns that node when replacing placeholders
 * */
export class ObjectTypeNodeRepository {
  _store: Record<string, ObjectType> = {};

  get(key: string): ObjectType | undefined {
    return this._store[key];
  }

  register(node: ObjectType): ObjectType {
    this._store[node.name.value] = node;
    return node;
  }
}

/** initializes a FreezedPluginConfig with the defaults values */
export class DefaultFreezedPluginConfig implements FlutterFreezedPluginConfig {
  camelCasedEnums?: boolean;
  customScalars?: { [name: string]: string };
  fileName = 'app_models';
  globalFreezedConfig?: FreezedConfig;
  typeSpecificFreezedConfig?: Record<string, TypeSpecificFreezedConfig>;
  ignoreTypes?: string[];

  constructor(config: FlutterFreezedPluginConfig = { fileName: 'app_models' }) {
    Object.assign(this, {
      camelCasedEnums: config.camelCasedEnums ?? true,
      customScalars: config.customScalars ?? {},
      fileName: config.fileName,
      globalFreezedConfig: {
        ...new DefaultFreezedConfig(),
        ...(config.globalFreezedConfig ?? {}),
      },
      typeSpecificFreezedConfig: config.typeSpecificFreezedConfig ?? {},
      ignoreTypes: config.ignoreTypes ?? [],
    });
  }
}

/** initializes a FreezedConfig with the defaults values */
export class DefaultFreezedConfig implements FreezedConfig {
  alwaysUseJsonKeyName?: boolean;
  copyWith?: boolean;
  customDecorators?: CustomDecorator;
  equal?: boolean;
  fromJsonToJson?: boolean;
  immutable?: boolean;
  makeCollectionsUnmodifiable?: boolean;
  mergeInputs?: string[];
  mutableInputs?: boolean;
  privateEmptyConstructor?: boolean;
  unionKey?: string;
  unionValueCase?: 'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal';

  constructor() {
    Object.assign(this, {
      alwaysUseJsonKeyName: false,
      copyWith: undefined,
      customDecorators: {},
      equal: undefined,
      fromJsonToJson: true,
      immutable: true,
      makeCollectionsUnmodifiable: undefined,
      mergeInputs: [],
      mutableInputs: true,
      privateEmptyConstructor: true,
      unionKey: undefined,
      unionValueCase: undefined,
    });
  }
}

//#endregion

//#region deprecated
/**
 * stores an instance of  FreezedFactoryBlock using the node names as the key
 * and returns that instance when replacing tokens
 * */
/* export class objectTypeNodeRepository {
  _store: Record<string, FreezedFactoryBlock> = {};

  get(key: string): FreezedFactoryBlock | undefined {
    return this._store[key];
  }

  register(key: string, value: FreezedFactoryBlock): FreezedFactoryBlock {
    this._store[key] = value;
    return value;
  }

  retrieve(key: string, appliesOn: string, name: string, namedConstructor: string | undefined = undefined): string {
    console.log('key:-->', key, 'appliesOn:-->', appliesOn, 'name:-->', name, 'namedConstructor:-->', namedConstructor);

    return '';
  }
} */

/** a class variant of the getFreezedConfigValue helper function
 *
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
/*  export class FreezedConfigValue {
  constructor(private _config: FlutterFreezedPluginConfig, private _typeName: string | undefined) {
    this._config = _config;
    this._typeName = _typeName;
  }

  // 
  //  * returns the value of the FreezedConfig option
  //  * for a specific type if given typeName
  //  * or else fallback to the global FreezedConfig value
  //  
  get<T>(option: OptionName): T {
    return getFreezedConfigValue(option, this._config, this._typeName) as T;
  }
}
 */

//#endregion
