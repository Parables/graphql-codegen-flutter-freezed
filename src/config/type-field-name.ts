import { GraphQLTypeFieldName } from './config';

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

  public static normalize = (name: string): string => {
    return name
      .split(/\s*,\s*/gim)
      .filter(type => type.length > 0)
      .join();
  };

  public static fromStringOrArray = (value: string | string[]) => {
    return typeof value === 'string' ? this.normalize(value) : value.map(field => this.normalize(field)).join();
  };
}

/**
 * @name TypeName
 * @description A valid GraphQL Type Name used in the GraphQL Schema provided
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // set the value
 * let typeName: TypeName = TypeName.fromString('Droid');
 *
 * // throws an error
 * let typeName: TypeName = TypeName.fromString('');
 * ```
 */
export class TypeName extends TypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  public static fromString = (value: string, multipleNames = true): TypeName => {
    if (value.length < 1) {
      throw new Error('TypeName cannot be an empty string. A valid GraphQL name is required');
    } else if (!multipleNames && value.includes(',')) {
      throw new Error('TypeName cannot cannot contain multiple GraphQL Type names');
    }
    return new TypeFieldName(this.normalize(value));
  };

  public static get anyTypeName(): string {
    return '@*TypeName';
  }

  public static anyTypeNameExceptTypeNames = (typeNames: string | string[]): string => {
    const _typeNames = this.fromStringOrArray(typeNames);
    return `${this.anyTypeName}-[${this.fromString(_typeNames).value}]`;
  };

  public static byPrecedence = (graphqlTypName: string, commaSeparatedNames: string | string[]) => {
    const found =
      commaSeparatedNames === graphqlTypName || commaSeparatedNames.includes(graphqlTypName ?? this.anyTypeName);

    if (found) {
      return TypeName.fromString(graphqlTypName);
    }

    return undefined;
  };
}

/**
 * @name FieldName
 * @description Just like TypeName but instead used for the field name of a GraphQL Type.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // set the value
 * let fieldName: FieldName = FieldName.fromString('id');
 *
 * // throws an error
 * let fieldName: FieldName = FieldName.fromString('');
 * ```
 */
export class FieldName extends TypeFieldName {
  private constructor(value: string) {
    super(value);
  }
  public static get anyFieldName(): string {
    return '@*FieldName';
  }

  public static fromString = (value: string, multipleNames = true): TypeName => {
    if (value.length < 1) {
      throw new Error('FieldName cannot be an empty string. A valid name of a field in GraphQL Type is required');
    } else if (!multipleNames && value.includes(',')) {
      throw new Error('FieldName cannot cannot contain multiple GraphQL Field names');
    }
    return new TypeFieldName(this.normalize(value));
  };

  public static fieldNamesOfTypeName = (typeName: string, fieldNames: string | string[]): string => {
    const _typeName = TypeName.fromString(typeName, false);
    const _fieldNames = FieldName.fromString(this.fromStringOrArray(fieldNames));
    return `${_typeName.value}.[${_fieldNames.value}]`;
  };

  public static anyFieldNameOfTypeName = (typeName: string): string => {
    const _typeName = TypeName.fromString(typeName, false);
    return `${_typeName.value}.${this.anyFieldName}`;
  };

  public static anyFieldNameExceptFieldNamesOfTypeName = (
    typeName: string,
    exceptFieldNames: string | string[]
  ): string => {
    const _typeName = TypeName.fromString(typeName, false);
    const _fieldNames = FieldName.fromString(this.fromStringOrArray(exceptFieldNames));
    return `${_typeName.value}.${this.anyFieldName}-[${_fieldNames.value}]`;
  };

  public static fieldNamesOfAnyTypeName = (fieldNames: string | string[]): string => {
    const _fieldNames = FieldName.fromString(this.fromStringOrArray(fieldNames));
    return `${TypeName.anyTypeName}.[${_fieldNames.value}]`;
  };

  public static fieldNamesOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: string | string[],
    fieldNames: string | string[]
  ): string => {
    const _typeNames = TypeName.fromString(this.fromStringOrArray(exceptTypeNames));
    const _fieldNames = FieldName.fromString(this.fromStringOrArray(fieldNames));
    return `${TypeName.anyTypeName}-[${_typeNames.value}].[${_fieldNames.value}]`;
  };

  public static anyFieldNameOfAnyTypeName = (): string => {
    return `${TypeName.anyTypeName}.${this.anyFieldName}`;
  };

  public static anyFieldNameOfAnyTypeNameExceptTypeNames = (exceptTypeNames: string | string[]): string => {
    const _typeNames = TypeName.fromString(this.fromStringOrArray(exceptTypeNames));
    return `${TypeName.anyTypeName}-[${_typeNames.value}].[${FieldName.anyFieldName}]`;
  };

  public static anyFieldNameOfAnyTypeNameExceptFieldNames = (exceptFieldName: string | string[]): string => {
    const _fieldNames = FieldName.fromString(this.fromStringOrArray(exceptFieldName));
    return `${TypeName.anyTypeName}.${FieldName.anyFieldName}-[${_fieldNames.value}]`;
  };

  public static anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: string | string[],
    exceptFieldNames: string | string[]
  ): string => {
    const _typeNames = TypeName.fromString(this.fromStringOrArray(exceptTypeNames));
    const _fieldNames = FieldName.fromString(this.fromStringOrArray(exceptFieldNames));
    return `${TypeName.anyTypeName}-[${_typeNames.value}].${FieldName.anyFieldName}-[${_fieldNames.value}]`;
  };

  public static regexForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*((\w+?,?\s*)*)\]\s*.\s*@\s*\*\s*FieldName\s*-\s*\[\s*((\w+?,?\s*)*)\]/gim;

  static matchesAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = (
    typeFieldName: GraphQLTypeFieldName,
    exceptTypeNames: TypeName,
    exceptFieldNames: FieldName
  ) => {
    const pattern = this.regexForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames;
    if (pattern.test(typeFieldName)) {
      const res = pattern.exec(typeFieldName);
      console.log(res);
    }
  };
}
