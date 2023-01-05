//#region helpers

import { camelCase, pascalCase, snakeCase } from 'change-case-all';
import { DefinitionNode, ObjectTypeDefinitionNode, InputObjectTypeDefinitionNode, Kind } from 'graphql';
import { AppliesOn, DartIdentifierCasing } from './config/plugin-config';

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
//#endregion
