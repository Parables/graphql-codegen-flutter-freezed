import { indent, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { camelCase, pascalCase, snakeCase } from 'change-case-all';
import {
  ArgumentNode,
  DefinitionNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  InputObjectTypeDefinitionNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from 'graphql';
import {
  AppliesOn,
  FlutterFreezedPluginConfig,
  DART_SCALARS,
  DartIdentifierCasing,
  OptionInTypeConfig,
  defaultFreezedPluginConfig,
  CustomDecoratorConfig,
  defaultTypeConfig,
  FieldType,
  NodeType,
  ObjectType,
  AppliesOnEnum,
  AppliesOnClass,
  AppliesOnFactory,
  AppliesOnParameters,
  AppliesOnEnumValue,
  AppliesOnNamedFactory,
  AppliesOnDefaultFactory,
  MergeInputs,
  DeprecatedFields,
} from './config-olf';
import { FreezedDeclarationBlock, FreezedFactoryBlock } from './freezed-declaration-blocks';
import { FreezedParameterBlock } from './freezed-declaration-blocks/parameter-block';
import { BlockName } from './models/block-name';
import { TypeName, FieldName } from './models/type-field-name';

//#region helpers

export const nodeIsObjectType = (
  node: DefinitionNode
): node is ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode =>
  node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;

export const appliesOnBlock = <T extends AppliesOn>(appliesOn: T[], expected: T[]) => {
  return appliesOn.every(a => expected.includes(a));
};

export const appliesOnEnumBlock = <T extends AppliesOn>(appliesOn: T[]) => {
  return appliesOnBlock(appliesOn, ['enum'] as T[]);
};

export const appliesOnEnumValue = <T extends AppliesOn>(appliesOn: T[]) => {
  return appliesOnBlock(appliesOn, ['enum_value'] as T[]);
};

export const appliesOnClassBlock = <T extends AppliesOn>(appliesOn: T[]) => {
  return appliesOnBlock(appliesOn, ['class'] as T[]);
};

export const appliesOnFactoryBlock = <T extends AppliesOn>(appliesOn: T[]) => {
  return appliesOnBlock(appliesOn, [
    'factory',
    'default_factory',
    'named_factory',
    'named_factory_for_merged_types',
    'named_factory_for_union_types',
  ] as T[]);
};

export const appliesOnParameterBlock = <T extends AppliesOn>(appliesOn: T[]) => {
  return appliesOnBlock(appliesOn, [
    'parameter',
    'default_factory_parameter',
    'named_factory_parameter',
    'named_factory_parameter_for_merged_types',
    'named_factory_parameter_for_union_types',
  ] as T[]);
};

export const mergeConfig = (
  baseConfig?: Partial<FlutterFreezedPluginConfig>,
  newConfig?: Partial<FlutterFreezedPluginConfig>
): FlutterFreezedPluginConfig => {
  return {
    camelCasedEnums:
      newConfig?.camelCasedEnums ?? baseConfig?.camelCasedEnums ?? defaultFreezedPluginConfig.camelCasedEnums,
    customScalars: { ...(baseConfig?.customScalars ?? {}), ...(newConfig?.customScalars ?? {}) },
    fileName: newConfig?.fileName ?? baseConfig?.fileName ?? defaultFreezedPluginConfig.fileName,
    globalName: newConfig?.globalName ?? baseConfig?.globalName ?? defaultFreezedPluginConfig.globalName,
    ignoreTypes: [...(baseConfig?.ignoreTypes ?? []), ...(newConfig?.ignoreTypes ?? [])],
    typeConfig: {
      ...(baseConfig?.typeConfig ?? {}),
      ...(newConfig?.typeConfig ?? {}),
    },
  };
};

/* export const optionFromConfigOrDefault = <T>(
  config: FlutterFreezedPluginConfig,
  option: OptionInConfig
): T | undefined => {
  return (config?.[option] ?? defaultFreezedPluginConfig?.[option]) as T | undefined;
}; */

export const getTypeConfigOption = <T>(
  config: FlutterFreezedPluginConfig,
  typeName: TypeName,
  option: OptionInTypeConfig,
  defaultValue?: T
): T | undefined => {
  return (
    ((config.typeConfig?.[typeName.value]?.[option] ?? defaultTypeConfig?.[option]) as unknown as T) ?? defaultValue
  );
};

export const optionFromAnyConfig = <
  T extends Record<string, any>,
  U extends string = Exclude<'number' | 'symbol', keyof T>
>(
  config: T,
  option: U,
  defaultValue?: T[U]
): T[U] | undefined => {
  return config[option] ?? defaultValue;
};

// TODO: TEst this function
export const findOptionWithTypeFieldName = (config: Record<string, any>, typeFieldName: string, option: string) => {
  // get all options for
  const commaSeparatedKey = Object.keys(config);
  return commaSeparatedKey
    .filter(key => key.includes(typeFieldName))
    .map(key => {
      return { [option]: config[key][option], key, typeFieldName };
    });
};

/**
 *  Returns a string of import statements placed at the top of the file that contains generated models
 * @param fileName The name of the file where the generated Freezed models will be saved to. This is used to import the library part files generated by Freezed. This value must be set in the plugin's config
 * @returns a string of import statements
 */
export const buildImportStatements = (fileName: string) => {
  if (fileName.length < 1) {
    throw new Error('fileName is required and must not be empty');
  }
  const segments = fileName.split('/');
  const target = segments[segments.length - 1];
  const expectedFileName = snakeCase(target.replace(/\.dart/g, ''));
  return [
    `import 'package:freezed_annotation/freezed_annotation.dart';\n`,
    `import 'package:flutter/foundation.dart';\n\n`,
    `part '${expectedFileName}.freezed.dart';\n`,
    `part '${expectedFileName}.g.dart';\n\n`,
  ].join('');
};

export const dartCasing = (name: string, casing?: DartIdentifierCasing): string => {
  if (casing === 'camelCase') {
    return camelCase(name);
  } else if (casing === 'PascalCase') {
    return pascalCase(name);
  } else if (casing === 'snake_case') {
    return snakeCase(name);
  }
  return name;
};
//#endregion

//#region Step 01. Start Here
/**
 * Transforms the AST nodes into  Freezed classes/models
 * @param config The plugin configuration object
 * @param node the AST node passed by the schema visitor
 * @param nodeRepository A map that stores the name of the Graphql Type as the key and it AST node as the value. Used to build FactoryBlocks from placeholders for mergedInputs and Union Types
 * @returns a string output of a `FreezedDeclarationBlock` which represents a Freezed class/model in Dart
 */
export const buildBlock = (config: FlutterFreezedPluginConfig, node: NodeType, nodeRepository: NodeRepository) => {
  // ignore these...
  if (['Query', 'Mutation', 'Subscription', ...(config?.ignoreTypes ?? [])].includes(node.name.value)) {
    return '';
  }

  // registers all the ObjectTypes
  if (nodeIsObjectType(node)) {
    nodeRepository.register(node);
  }

  return FreezedDeclarationBlock.build(config, node);
};

//#endregion

//#region Step 02. Build Comments

// TODO: handle multiline comment
// TODO: Change param `node` to string for easy testing
export const buildBlockComment = (node?: NodeType | EnumValueDefinitionNode): string => {
  const comment = node?.description?.value;

  return comment && comment?.length > 0 ? `${comment.replace(/^\s*#/gm, '///')} \n` : '';
};

//#endregion

//#region Step 03. Build Decorators

// TODO: modify this for factory blocks too
export const buildBlockDecorators = (
  config: FlutterFreezedPluginConfig,
  node: NodeType | EnumValueDefinitionNode,
  appliesOn: AppliesOn[],
  field?: FieldType
): string => {
  if (node.kind === Kind.ENUM_VALUE_DEFINITION) {
    if (appliesOnEnumValue(appliesOn)) {
      return buildEnumValueDecorators(config, node, appliesOn);
    }
  } else {
    if (appliesOnEnumBlock(appliesOn)) {
      return buildEnumBlockDecorators(config, node, appliesOn);
    } else if (appliesOnClassBlock(appliesOn)) {
      // return buildClassBlockDecorators(config, node, appliesOn as AppliesOnClass[]);
    } else if (appliesOnFactoryBlock(appliesOn)) {
      return buildFactoryBlockDecorators(config, node, appliesOn);
    } else if (appliesOnParameterBlock(appliesOn) && field) {
      return buildParameterBlockDecorators(config, node, field, appliesOn);
    }
  }

  return '';
};

export const buildEnumValueDecorators = (
  config: FlutterFreezedPluginConfig,
  node: EnumValueDefinitionNode,
  appliesOn: AppliesOn[]
): string => {
  return '';
};

export const buildEnumBlockDecorators = (
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  appliesOn: AppliesOn[]
): string => {
  return '';
};

export const buildClassBlockDecorators = (
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  appliesOn: AppliesOnClass[]
) => {
  const typeName = TypeName.fromConfig(config, node.name.value);
  const globalTypeName = TypeName.fromGlobalName(config);
  const rootBlock = TypeName.rootBlockFromGlobalName(config);

  const customDecoratorsForAllTypes = findOptionWithTypeFieldName(
    config['typeConfig'] ?? {},
    globalTypeName.value,
    'customDecorators'
  );
  const customDecoratorsForTypeName = findOptionWithTypeFieldName(
    config['typeConfig'] ?? {},
    typeName.value,
    'customDecorators'
  );

  const mergedCustomDecorators = [...customDecoratorsForAllTypes, ...customDecoratorsForTypeName];

  // const decoratorsForClassBlock: CustomDecoratorConfig[] =
  return mergedCustomDecorators
    .filter(d => d['customDecorators'][rootBlock.value])
    .map(d => d['customDecorators'][rootBlock.value]);

  // no need to check applies on since there is only one case for it

  // return '';
};

export const parseDecorators = (node: NodeType, listOfCustomDecoratorConfig: CustomDecoratorConfig[]) => {
  return listOfCustomDecoratorConfig.map(config => {
    return Object.keys(config).map(decorator => {
      const decoratorConfig = config[decorator];
      if (decoratorConfig.mapsToFreezedAs === 'directive') {
        // find the directive in the node and use it arguments to create the decorator
        const directiveNode = node.directives?.find(directive => directive.name.value === decorator);
        const args = decoratorConfig.arguments
          ?.map(a => (directiveNode?.arguments ?? [])[argToInt(a)].value ?? '')
          .join('');
        return `${decorator}${args}`;
      } else if (decoratorConfig.mapsToFreezedAs === 'custom') {
        const args = (decoratorConfig.arguments ?? []).join('');
        return `${decorator}${args}`;
      }
    });
  });
};

export const buildFactoryBlockDecorators = (
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  appliesOn: AppliesOn[]
): string => {
  return '';
};

export const buildParameterBlockDecorators = (
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  field: FieldType,
  appliesOn: AppliesOn[]
): string => {
  return '';
};

export const buildFreezedDecorator = (config: FlutterFreezedPluginConfig, node: NodeType) => {
  // this is the start of the pipeline of decisions to determine which Freezed decorator to use
  return decorateAsUnfreezed(config, node);
};

export const decorateAsUnfreezed = (config: FlutterFreezedPluginConfig, node: NodeType) => {
  const typeName = node.name.value;
  const immutable = config?.typeConfig?.[typeName]?.immutable ?? defaultTypeConfig.immutable;
  const mutableInputs = config?.typeConfig?.[typeName]?.mutableInputs ?? defaultTypeConfig.mutableInputs;
  const mutable = !immutable || (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && mutableInputs);

  return mutable ? '@unfreezed\n' : decorateAsFreezed(config, node);
};

export const decorateAsFreezed = (config: FlutterFreezedPluginConfig, node: NodeType) => {
  const typeName = TypeName.fromConfig(config, node.name.value);

  if (isCustomizedFreezed(config, typeName)) {
    const copyWith = getTypeConfigOption<boolean>(config, typeName, 'copyWith');
    const equal = getTypeConfigOption<boolean>(config, typeName, 'equal');
    const makeCollectionsUnmodifiable = getTypeConfigOption<boolean>(config, typeName, 'makeCollectionsUnmodifiable');
    const unionKey = getTypeConfigOption<string>(config, typeName, 'unionKey');
    const unionValueCase = getTypeConfigOption<'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal'>(
      config,
      typeName,
      'unionValueCase'
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
  // else fallback to the normal `@freezed` decorator
  return '@freezed\n';
};

export const isCustomizedFreezed = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
  return (
    getTypeConfigOption<boolean>(config, typeName, 'copyWith') !== undefined ||
    getTypeConfigOption<boolean>(config, typeName, 'equal') !== undefined ||
    getTypeConfigOption<boolean>(config, typeName, 'makeCollectionsUnmodifiable') !== undefined ||
    getTypeConfigOption<string>(config, typeName, 'unionKey') !== undefined ||
    getTypeConfigOption<'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal'>(config, typeName, 'unionValueCase') !==
      undefined
  );
};

/**
 * @description filters the customDirectives to return those that are applied on a list of blocks
 */
/* export function getCustomDecorators(
  config: FlutterFreezedPluginConfig,
  appliesOn: AppliesOn[],
  typeName: TypeName,
  fieldName?: FieldName
): CustomDecorators {
  const filteredCustomDecorators: CustomDecorators = {};
  const customDecoratorsForAllTypes = getTypeConfigOption<CustomDecorators>(
    config,
    TypeName.fromGlobalName(config),
    'customDecorators',
    {}
  );
  const customDecoratorsForSpecificType = getTypeConfigOption<CustomDecorators>(
    config,
    typeName,
    'customDecorators',
    {}
  );

  let customDecorators: CustomDecorators = { ...customDecoratorsForAllTypes, ...customDecoratorsForSpecificType };

  if (fieldName) {
    const customDecoratorsForSpecificFields = getTypeConfigOption<CustomDecorators>(
      config,
      fieldName,
      'customDecorators',
      {}
    );

    customDecorators = { ...customDecorators, ...customDecoratorsForSpecificFields };
  }

  Object.entries(customDecorators).forEach(([key, value]) =>
    value?.appliesOn?.forEach(a => {
      if (appliesOn.includes(a)) {
        filteredCustomDecorators[key] = value;
      }
    })
  );

  return filteredCustomDecorators;
}
 */

/* export function transformCustomDecorators(
  customDecoratorConfig: CustomDecoratorConfig,
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
        const value = customDecoratorConfig[key] ?? customDecoratorConfig[`@${key}`];
        if (value && value.mapsToFreezedAs !== 'custom') {
          return true;
        }
        return false;
      })
      // transform each directive to string
      .map(d => directiveToString(d, customDecoratorConfig)),
  ];

  // for  decorators that mapsToFreezedAs === 'custom'
  Object.entries(customDecoratorConfig).forEach(([key, value]) => {
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
 */
/**
 * transforms the directive into a decorator array
 * this decorator array might contain a `final` string which would be filtered out
 * and used to mark the parameter block as final
 */
/* function directiveToString(directive: DirectiveNode, customDecorators: CustomDecorators) {
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
 */
/** transforms string template: "$0" into an integer: 1 */
function argToInt(arg: string) {
  const parsedIndex = Number.parseInt(arg.replace('$', '').trim() ?? '0'); // '$1 => 1
  return parsedIndex ? parsedIndex : 0;
}

//#endregion

//#region Step 03. Build Blocks

export const buildBlockHeader = (
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  appliesOn: AppliesOn[],
  typeName: TypeName,
  namedConstructor = '',
  field?: FieldType
): string => {
  if (appliesOnEnumBlock(appliesOn)) {
    return buildEnumHeader(config, typeName);
  } else if (appliesOnClassBlock(appliesOn)) {
    const withPrivateEmptyConstructor = getTypeConfigOption<boolean>(config, typeName, 'privateEmptyConstructor');
    return buildClassHeader(config, typeName, withPrivateEmptyConstructor);
  } else if (appliesOnFactoryBlock(appliesOn)) {
    const immutable = getTypeConfigOption<boolean>(config, typeName, 'immutable');
    return buildFactoryHeader(config, typeName, namedConstructor, immutable);
  } else if (appliesOnParameterBlock(appliesOn) && field) {
    return buildParameterHeader(config, node, field, appliesOn as AppliesOnParameters[]);
  }
  return '';
};

export const buildBlockBody = (config: FlutterFreezedPluginConfig, node: NodeType, appliesOn: AppliesOn[]): string => {
  if (appliesOnEnumBlock(appliesOn) && node.kind === Kind.ENUM_TYPE_DEFINITION) {
    return buildEnumBody(config, node);
  } else if (appliesOnClassBlock(appliesOn)) {
    return buildClassBody(config, node);
  } else if (appliesOnFactoryBlock(appliesOn) && nodeIsObjectType(node)) {
    return buildFactoryBody(config, node, appliesOn as AppliesOnFactory[]);
  }
  return '';
};

export const buildBlockFooter = (
  config: FlutterFreezedPluginConfig,
  node: NodeType | FieldType,
  appliesOn: AppliesOn[],
  namedConstructor = ''
): string => {
  const typeName = TypeName.fromConfig(config, node.name.value);

  if (appliesOnEnumBlock(appliesOn)) {
    return buildEnumFooter();
  } else if (appliesOnClassBlock(appliesOn)) {
    const fromJsonToJson = getTypeConfigOption<boolean>(config, typeName, 'fromJsonToJson');
    return buildClassFooter(config, typeName, fromJsonToJson);
  } else if (
    appliesOn.includes('default_factory') ||
    ((appliesOn.includes('named_factory_for_union_types') || appliesOn.includes('named_factory_for_merged_types')) &&
      namedConstructor.length > 0)
  ) {
    return buildFactoryFooter(config, appliesOn as AppliesOnFactory[], namedConstructor);
  }
  return '';
};
//#endregion

//#region Step 03.01. Build Enum Block

export const buildEnumHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
  return `enum ${BlockName.asEnumTypeName(config, typeName)} {\n`;
};

export const buildEnumBody = (config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string => {
  const typeName = TypeName.fromConfig(config, node.name.value);
  return (
    node.values
      ?.map((enumValue: EnumValueDefinitionNode) => {
        const fieldName = FieldName.fromConfig(config, enumValue.name.value);
        const blockName = BlockName.asEnumValueName(config, typeName, fieldName);

        const decorators = buildBlockDecorators(config, enumValue, ['enum_value'] as AppliesOnEnumValue[]);

        return indentMultiline(`${decorators}${buildBlockComment(enumValue)}${blockName},\n`);
      })
      .join('') ?? ''
  );
};

export const buildEnumFooter = (): string => {
  return '}\n\n';
};

//#endregion

//#region Step 03.02. Build Class Block

export const buildClassHeader = (
  config: FlutterFreezedPluginConfig,
  typeName: TypeName,
  withPrivateEmptyConstructor = true
): string => {
  const className = BlockName.asClassName(config, typeName);

  const privateEmptyConstructor = withPrivateEmptyConstructor ? indent(`const ${className}._();\n\n`) : '';

  return `class ${className} with _$${className} {\n${privateEmptyConstructor}`;
};

export const buildClassBody = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
  const typeName = TypeName.fromConfig(config, node.name.value);

  const typeMergeInputs = getTypeConfigOption<string[]>(config, typeName, 'mergeInputs', []);
  const globalMergeInputs = getTypeConfigOption<string[]>(config, TypeName.fromGlobalName(config), 'mergeInputs', []);

  const mergeInputs = [...(typeMergeInputs ?? []), ...(globalMergeInputs ?? [])];

  if (node.kind === Kind.UNION_TYPE_DEFINITION) {
    return (
      node.types
        ?.map(value => {
          const namedConstructor = value.name.value;
          return FreezedFactoryBlock.serializeNamedFactory(typeName, namedConstructor, [
            'factory',
            'named_factory',
            'named_factory_for_union_types',
          ] as AppliesOnNamedFactory[]);
        })
        .join('') ?? ''
    );
  } else if (node.kind === Kind.OBJECT_TYPE_DEFINITION && (mergeInputs?.length ?? 0) > 0) {
    return [FreezedFactoryBlock.serializeFactory(typeName, ['factory', 'default_factory'] as AppliesOnDefaultFactory[])]
      .concat(
        mergeInputs.map(pattern => {
          const separator = pattern.includes('$') ? '$' : typeName.value;
          const namedConstructor = camelCase(pattern.split(separator).join('_'));
          return FreezedFactoryBlock.serializeNamedFactory(typeName, namedConstructor, [
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

export const buildClassFooter = (
  config: FlutterFreezedPluginConfig,
  typeName: TypeName,
  fromJsonToJson = true
): string => {
  const blockName = BlockName.asClassName(config, typeName);

  if (fromJsonToJson) {
    return indent(`factory ${blockName}.fromJson(Map<String, dynamic> json) => _$${blockName}FromJson(json);\n}\n\n`);
  }
  return '}\n\n';
};

//#endregion

//#region Step 03.03. Build Factory Block

export const buildFactoryHeader = (
  config: FlutterFreezedPluginConfig,
  typeName: TypeName,
  namedConstructor = '',
  immutable = true
) => {
  const constFactory = immutable ? indent('const factory') : indent('factory');
  if (namedConstructor.length > 0) {
    return `${constFactory} ${BlockName.asNamedConstructor(config, typeName, namedConstructor)}({\n`;
  }

  return `${constFactory} ${BlockName.asClassName(config, typeName)}({\n`;
};

export const buildFactoryBody = (
  config: FlutterFreezedPluginConfig,
  node: ObjectType,
  appliesOn: AppliesOnFactory[]
): string => {
  let appliesOnParameters: AppliesOnParameters[] = [];
  if (appliesOn.includes('default_factory')) {
    appliesOnParameters = ['parameter', 'default_factory_parameter'];
  } else if (appliesOn.includes('named_factory_for_union_types')) {
    appliesOnParameters = ['parameter', 'named_factory_parameter', 'named_factory_parameter_for_union_types'];
  } else if (appliesOn.includes('named_factory_for_merged_types')) {
    appliesOnParameters = ['parameter', 'named_factory_parameter', 'named_factory_parameter_for_merged_types'];
  }

  return (
    node.fields
      ?.map(field => {
        return FreezedParameterBlock.build(config, node, appliesOnParameters, field);
      })
      .join('') ?? ''
  );
};

export const buildFactoryFooter = (
  config: FlutterFreezedPluginConfig,
  appliesOn: AppliesOnFactory[],
  namedConstructor: string
) => {
  const typeName = TypeName.fromConfig(config, namedConstructor);
  const prefix = appliesOn.includes('default_factory') ? '_' : '';
  const factoryFooterName = BlockName.asClassName(config, typeName);
  return indent(`}) = ${prefix}${factoryFooterName};\n\n`);
};

//#endregion

//#region Step 03.04. Build Parameter Block

export const buildParameterHeader = (
  config: FlutterFreezedPluginConfig,
  node: NodeType,
  field: FieldType,
  appliesOn: AppliesOnParameters[]
): string => {
  const typeName = TypeName.fromConfig(config, node.name.value);
  const fieldName = TypeName.fromConfig(config, field.name.value);

  const decorators = buildBlockDecorators(config, node, appliesOn);

  const applyFinalOn = getTypeConfigOption(config, typeName, 'final', defaultTypeConfig.final)?.[fieldName.value];
  const markedFinal =
    decorators.includes('final') || (applyFinalOn?.filter(a => appliesOn.includes(a)).length ?? 0) > 0;

  const required = isNonNullType(field.type) ? 'required ' : '';
  const final = markedFinal ? 'final ' : '';
  const type = parameterType(config, field.type);
  const name = BlockName.asParameterName(config, typeName, fieldName);

  return indent(`${required}${final}${type} ${name},\n`, 2);
};

export const parameterType = (config: FlutterFreezedPluginConfig, type: TypeNode, parentType?: TypeNode): string => {
  if (isNonNullType(type)) {
    return parameterType(config, type.type, type);
  }

  if (isListType(type)) {
    const T = parameterType(config, type.type, type);
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

//#region NodeRepository classes
/**
 * stores an instance of  `ObjectTypeDefinitionNode` or `InputObjectTypeDefinitionNode` using the node name as the key
 * and returns that node when replacing placeholders
 * */
export class NodeRepository {
  private _store: Record<string, ObjectType> = {};

  get(key: string): ObjectType | undefined {
    return this._store[key];
  }

  register(node: ObjectType): ObjectType {
    this._store[node.name.value] = node;
    return node;
  }
}

//#endregion
