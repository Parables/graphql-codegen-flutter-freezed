import { AnyTypeName } from '../config';

export type TypeNameValue = string;
export type FieldNameValue = string;

class TypeFieldName {
  private _value: string;

  constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public static fromString = (value: string) => new TypeFieldName(value);
}

/**
 * @name TypeName
 * @description A comma-separated string of GraphQL Type Names.Use the `globalName` to apply the same config options to all GraphQL Types.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * TODO: add an example
 * ```
 * */
export class TypeName extends TypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  public static byPrecedence = (graphqlTypName: string, commaSeparatedNames: string | string[]) => {
    const found =
      commaSeparatedNames === graphqlTypName || commaSeparatedNames.includes(graphqlTypName ?? AnyTypeName.toString());

    if (found) {
      return TypeName.fromString(graphqlTypName);
    }

    return undefined;
  };
}

/**
 * @name FieldName
 * @description Just like TypeName but instead used for the fields names of a GraphQL Type. Use the `config.globalName` to apply the same config options to all fields.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * TODO: add an example
 * ```
 * */
export class FieldName extends TypeFieldName {
  private constructor(value: string) {
    super(value);
  }
}
