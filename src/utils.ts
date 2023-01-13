//#region helpers

import { camelCase, pascalCase, snakeCase } from 'change-case-all';
import { DefinitionNode, ObjectTypeDefinitionNode, InputObjectTypeDefinitionNode, Kind } from 'graphql';
import { Config } from './config/config-value';
import { FieldName, TypeName } from './config/pattern-new';
import { AppliesOn, DartIdentifierCasing, DART_KEYWORDS, FlutterFreezedPluginConfig } from './config/plugin-config';

export const strToList = (str: string) => (str.length < 1 ? [] : str.split(/\s*,\s*/gim).filter(s => s.length > 0));

export const arrayWrap = <T>(value: T | T[]) =>
  value === undefined ? [] : Array.isArray(value) ? value : ([value] as T[]);

export const resetIndex = (regexp: RegExp) => (regexp.lastIndex = 0);

export const nodeIsObjectType = (
  node: DefinitionNode
): node is ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode =>
  node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;

export const appliesOnBlock = <T extends AppliesOn>(
  configAppliesOn: T[],
  blockAppliesOn: readonly T[],
  matchSome = false
) => {
  return matchSome
    ? configAppliesOn.some(a => blockAppliesOn.includes(a))
    : configAppliesOn.every(a => blockAppliesOn.includes(a));
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
/**
 * checks whether name is a Dart Language keyword
 * @param identifier The name or identifier to be checked
 * @returns `true` if name is a Dart Language keyword, otherwise `false`
 */
export const isDartKeyword = (identifier: string) => Object.hasOwn(DART_KEYWORDS, identifier);

/**
 * Ensures that the blockName isn't a valid Dart language reserved keyword.
 * It wraps the identifier with the prefix and suffix then transforms the casing as specified in the config
 * @param config
 * @param name
 * @param typeName
 * @returns
 */
export const escapeDartKeyword = (
  config: FlutterFreezedPluginConfig,
  identifier: string,
  typeName?: TypeName,
  fieldName?: FieldName,
  blockAppliesOn: readonly AppliesOn[] = []
): string => {
  if (isDartKeyword(identifier)) {
    const [prefix, suffix] = Config.escapeDartKeywords(config, typeName, fieldName, blockAppliesOn);
    return `${prefix}${identifier}${suffix}`;
  }
  return identifier;
};

export const atJsonKeyDecorator = (originalIdentifier: string, transformedIdentifier: string, replaceToken = '') => {
  if (originalIdentifier === transformedIdentifier) {
    return ``;
  }
  // insert a leading comma if it is missing
  replaceToken = replaceToken.length > 0 && !replaceToken.startsWith(',') ? `, ${replaceToken}` : replaceToken;
  return `@JsonKey(name: '${originalIdentifier}'${replaceToken}) `;
};
//#endregion
