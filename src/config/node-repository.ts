//#region NodeRepository classes

import { ObjectType } from './config';

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
