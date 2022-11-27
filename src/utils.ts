//#region helpers

import { camelCase, pascalCase, snakeCase } from 'change-case-all';
import { AppliesOn, DartIdentifierCasing } from './config';
import { DefinitionNode, ObjectTypeDefinitionNode, InputObjectTypeDefinitionNode, Kind } from 'graphql';

export const nodeIsObjectType = (
  node: DefinitionNode
): node is ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode =>
  node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;

export const appliesOnBlock = <T extends AppliesOn>(appliesOn: T[], expected: readonly T[], matchSome = false) => {
  return matchSome ? appliesOn.some(a => a in expected) : appliesOn.every(a => a in expected);
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
