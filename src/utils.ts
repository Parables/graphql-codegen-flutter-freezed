//#region helpers

import { camelCase, pascalCase, snakeCase } from 'change-case-all';
import { DefinitionNode, ObjectTypeDefinitionNode, InputObjectTypeDefinitionNode, Kind } from 'graphql';
import { AppliesOn, DartIdentifierCasing, ObjectType } from './config/plugin-config';

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
    if (!nodeIsObjectType(node)) {
      throw new Error('Node is not an ObjectTypeDefinitionNode or InputObjectTypeDefinitionNode');
    }
    this._store[node.name.value] = node;
    return node;
  }
}

//#endregion
