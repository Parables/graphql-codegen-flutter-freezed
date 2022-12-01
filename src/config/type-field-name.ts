/**
 * A list of GraphQL Type Names
 */
type TypeNames = string | string[] | TypeName[];

/**
 * A list of field names of a GraphQL Type
 */
type FieldNames = string | string[] | FieldName[];

class GraphqlTypeFieldName {
  private _value: string;

  constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }
  public static get anyTypeName(): string {
    return '@*TypeName';
  }

  public static get anyFieldName(): string {
    return '@*FieldName';
  }

  public static valueOf = (value: string | string[] | GraphqlTypeFieldName | GraphqlTypeFieldName[]) => {
    if (Array.isArray(value)) {
      return value
        .map((v: string | GraphqlTypeFieldName) => {
          if (v instanceof GraphqlTypeFieldName) {
            return this.fromStringOrArray(v.value);
          }
          return this.fromStringOrArray(v);
        })
        .join();
    }
    return value instanceof GraphqlTypeFieldName ? this.fromStringOrArray(value.value) : this.fromStringOrArray(value);
  };

  public static fromStringOrArray = (value: string | string[]) => {
    return typeof value === 'string' ? this.normalize(value) : value.map(field => this.normalize(field)).join();
  };

  public static normalize = (name: string): string => {
    if (name.length < 1) {
      throw new Error('Name cannot be empty');
    }
    return name
      .split(/\s*,\s*/gim)
      .filter(type => type.length > 0)
      .join();
  };

  /**
   * checks whether the child contains every element in parent
   * @param parent contains all the elements
   * @param child contains some or all elements in parent but may not be in any order as parent
   * @param matchAll if true, will return true if every child element is found in parent, otherwise false.
   * Defaults to false for the scope of this project since the schema visitor would have only one element at a time so we can't do a full match
   * @returns boolean
   */
  public static matchAll = (parent: string, child: string, matchAll = false) => {
    const parentList = parent.split(',');
    const childList = child.split(',');
    return matchAll
      ? childList.every(c => parentList.find(p => p === c))
      : childList.some(c => parentList.find(f => f === c));
  };
}

/**
 * @name TypeName
 * @description represents a valid GraphQL Type Name used in the GraphQL Schema provided
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // set the value
 * let typeName: TypeName = TypeName.fromString('Droid');
 *
 * // the following will throw an error
 * let typeName: TypeName = FieldName.fromString('Droid, Starship');
 *
 *  let typeName: TypeName = TypeName.fromString('');
 * ```
 */
export class TypeName extends GraphqlTypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  public static fromString = (value: string): TypeName => {
    if (value.length < 1) {
      throw new Error('TypeName requires a GraphQL Type name');
    } else if (value.includes(',')) {
      throw new Error('TypeName cannot contain multiple GraphQL Type names');
    }
    return new TypeName(value);
  };

  //#region `'TypeName, TypeName' or [TypeName, TypeName]`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'TypeName.[fieldNames]'`
   */
  public static multipleTypeNames = (typeNames: TypeNames): string => {
    return this.valueOf(typeNames);
  };

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param typeNames
   * @returns boolean
   */
  static matchesMultipleTypeNames = (typeFieldName: string | TypeFieldName, typeNames: TypeNames, matchAll = false) => {
    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(typeNames);

    return this.matchAll(_typeFieldName, _typeNames, matchAll);
  };

  //#endregion

  //#region `'@*TypeName'`
  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @returns boolean
   */
  static matchesAnyTypeName = (typeFieldName: string | TypeFieldName) => {
    return this.anyTypeName === typeFieldName;
  };

  //#endregion
}

/**
 * @name FieldName
 * @description Just like TypeName but instead used for the field name of a GraphQL Type.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // set the value
 * let fieldName: FieldName = FieldName.fromString('id');
 *
 * // the following will throw an error
 * let fieldName: FieldName = FieldName.fromString('id, name');
 *
 * let fieldName: FieldName = FieldName.fromString('');
 * ```
 */
export class FieldName extends GraphqlTypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  public static fromString = (value: string): TypeName => {
    if (value.length < 1) {
      throw new Error('FieldName requires a name of a field in GraphQL Type');
    } else if (value.includes(',')) {
      throw new Error('FieldName cannot contain multiple GraphQL Field names');
    }
    return new FieldName(value);
  };
}

/**
 * @name TypeFieldName
 * @description A compact string of GraphQL Type and Field Names used in the config for specifying options for a list of Graphql Types and Fields
 * The string can contain more than one pattern, each pattern separated by a semi-colon(`;`).
 * Each pattern consists of TypeName and FieldName separated by a dot(`.`)
 * Both TypeName and FieldName can specify a list of values to be included(`[]`) or excluded(`-[]`)
 * To apply an option to any TypeName or FieldName, use the anyTypeName(`@*TypeName`) and anyFieldName(`@*FieldName`) tokens respectively
 * @exampleMarkdown
 * ### Configuring GraphQL Types
 * ```ts
 *  let typeName3:TypeFieldName = '@*TypeName' //  This example applies for all GraphQL Types
 *
 *  let typeName4:TypeFieldName = '@*TypeName-[Human,Movie]' // if there are many types to be specified, use this to specify those to be **excluded**. This example applies on all types in the GraphQL Schema except the `Human` and `Movie` types
 *
 * let typeName1:TypeFieldName = 'Droid' // This example applies on the Droid GraphQL Type
 *
 * let typeName2:TypeFieldName = 'Droid; Starship' // a comma-separated string of GraphQL Type names. This example applies on the Droid and Starship GraphQL Types
 *
 * ```
 *
 * ### Configuring the fields of GraphQL Types
 * ```ts
 * let typeFieldName1:TypeFieldName = 'Droid.[id,friends]' // in an array, specify one or more fields for that GraphQL Type. This example applies on the `id` and `friends` fields of the Droid GraphQL Type
 *
 * let typeFieldName2:TypeFieldName = 'Droid.[id,friends]; Starship.[id]; @*TypeName.[id]' // same as `typeFieldName1` but for multiple patterns
 *
 * let typeFieldName3:TypeFieldName = 'Droid.@*FieldName' // applies on all fields of the Droid GraphQL Type
 *
 * let typeFieldName4:TypeFieldName = 'Droid.@*FieldName-[name,appearsIn]' // if there are many fields to be specified, use this to specify those to be **excluded**. This example applies on all of the fields of the Droid GraphQL Type except the `name` and `appearsIn` fields
 *
 *
 * let typeFieldName5:TypeFieldName = '@*TypeName.[id]' // applies on the `id` field of any GraphQL Types
 *
 *
 * let typeFieldName6:TypeFieldName = '@*TypeName-[Human,Starship].[id]' // applies on the `id` field of any GraphQL Types except the `Human` and `Starship` types
 *
 * let typeFieldName7:TypeFieldName = '@*TypeName.@*FieldName' // applies on all of the fields of the GraphQL Types
 *
 * let typeFieldName8:TypeFieldName = '@*TypeName-[Human,Starship].@*FieldName' // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types
 *
 * let typeFieldName9:TypeFieldName = '@*TypeName.@*FieldName-[id,name]' // applies on all of the fields of the GraphQL Types except the `id` and `name` fields
 *
 * let typeFieldName10:TypeFieldName = '@*TypeName-[Human,Movie].@*FieldName-[id,name]' // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types and the `id` and `name` fields
 * ```
 * */
export class TypeFieldName extends GraphqlTypeFieldName {
  //#region `'TypeName.[fieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'TypeName.[fieldNames]'`
   */
  public static fieldNamesOfTypeName = (typeName: string | TypeName, fieldNames: FieldNames): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(fieldNames);
    return `${_typeName}.[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForFieldNamesOfTypeName =
    /(?<typeName>\w+)(?<!@\s*\*\s*TypeName)\s*\.\s*\[\s*(?<fieldNames>(\w+?,?\s*)*)\]/gim;

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static RegExpForFieldNamesOfTypeName = (
    typeName: string | TypeName,
    fieldName: string | FieldName
  ): RegExp => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldName = FieldName.fromString(this.valueOf(fieldName)).value;
    return new RegExp(
      `${_typeName}(?<!@\\s*\\*\\s*TypeName)\\s*\\.\\s*\\[\\s*.*\\s*(${_fieldName},?\\s*).*,?\\s*\\]`,
      'gim'
    );
  };

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param typeName
   * @param fieldNames
   * @returns boolean
   */
  static matchesFieldNamesOfTypeName = (
    typeFieldName: string | TypeFieldName,
    typeName: string | TypeName,
    fieldNames: FieldNames,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForFieldNamesOfTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(fieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;
      const fieldNames = result.groups.fieldNames;

      matchFound = typeName === _typeName && this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    pattern.lastIndex = 0;
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName.[fieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static fieldNamesOfAnyTypeName = (fieldNames: FieldNames): string => {
    const _fieldNames = this.valueOf(fieldNames);
    return `${this.anyTypeName}.[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForFieldNamesOfAnyTypeName = /@\s*\*\s*TypeName\s*\.\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param fieldNames
   * @returns boolean
   */
  static matchesFieldNamesOfAnyTypeName = (
    typeFieldName: string | TypeFieldName,
    fieldNames: FieldNames,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForFieldNamesOfAnyTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _fieldNames = this.valueOf(fieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const fieldNames = result.groups.fieldNames;

      matchFound = this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'TypeName.@*FieldName'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'TypeName.@*FieldName'`
   */
  public static anyFieldNameOfTypeName = (typeName: string | TypeName): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    return `${_typeName}.${this.anyFieldName}`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForAnyFieldNameOfTypeName =
    /(?<typeName>\w+?)(?<!@\s*\*\s*TypeName)\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameOfTypeName = (typeFieldName: string | TypeFieldName, typeName: string | TypeName) => {
    const pattern = this.regexpForAnyFieldNameOfAnyTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;

      matchFound = typeName === _typeName;

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName.@*FieldName'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static anyFieldNameOfAnyTypeName = (): string => {
    return `${this.anyTypeName}.${this.anyFieldName}`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForAnyFieldNameOfAnyTypeName = /@\s*\*\s*TypeName\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameOfAnyTypeName = (typeFieldName: string | TypeFieldName) => {
    const pattern = this.regexpForAnyFieldNameOfAnyTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);

    return pattern.test(_typeFieldName);
  };

  //#endregion

  //#region `'TypeName.@*FieldName-[exceptFieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static anyFieldNameOfTypeNameExceptFieldNames = (
    typeName: string | TypeName,
    exceptFieldNames: FieldNames
  ): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(exceptFieldNames);
    return `${_typeName}.${this.anyFieldName}-[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForAnyFieldNameExceptFieldNamesOfTypeName =
    /(?<typeName>\w+?)(?<!@\s*\*\s*TypeName)\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>(\w+?,?\s*)*)\]/gim;

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static RegExpForAnyFieldNameExceptFieldNamesOfTypeName = (
    typeName: string | TypeName,
    exceptFieldName: string | FieldName
  ): RegExp => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldName = FieldName.fromString(this.valueOf(exceptFieldName));
    return new RegExp(
      `${_typeName}(?<!@\\s*\\*\\s*TypeName)\\s*\\.\\s*@\\s*\\*\\s*FieldName\\s\\*-\\s*\\[\\s*(?<fieldName>\\w+,?\\s*)${_fieldName}\\k<fieldName>\\]`,
      'gim'
    );
  };
  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameExceptFieldNamesOfTypeName = (
    typeFieldName: string | TypeFieldName,
    typeName: string | TypeName,
    exceptFieldNames: FieldNames,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForAnyFieldNameExceptFieldNamesOfTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(exceptFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;
      const fieldNames = result.groups.fieldNames;

      matchFound = typeName === _typeName && this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName.@*FieldName-[exceptFieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static anyFieldNameOfAnyTypeNameExceptFieldNames = (exceptFieldName: FieldNames): string => {
    const _fieldNames = this.valueOf(exceptFieldName);
    return `${this.anyTypeName}.${this.anyFieldName}-[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForAnyFieldNameExceptFieldNamesOfAnyTypeName =
    /@\s*\*\s*TypeName\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameExceptFieldNamesOfAnyTypeName = (
    typeFieldName: string | TypeFieldName,
    exceptFieldNames: FieldNames,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _fieldNames = this.valueOf(exceptFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const fieldNames = result.groups.fieldNames;

      matchFound = this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName-[exceptTypeNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some types and its fields
   * @param exceptTypeNames type names to be excluded
   * @param fieldNames field names to be excluded
   * @returns `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static anyTypeNameExceptTypeNames = (exceptTypeNames: TypeNames): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    return `${this.anyTypeName}-[${_typeNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*,?[^-.\s*]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptTypeNames` and `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptTypeNames
   * @param fieldNames
   * @returns boolean
   */
  static matchesAnyTypeNameExceptTypeNames = (
    typeFieldName: string | TypeFieldName,
    exceptTypeNames: TypeNames,
    matchAllTypeNames = false
  ) => {
    const pattern = this.regexpForAnyTypeNameExceptTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(exceptTypeNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.typeNames;

      matchFound = this.matchAll(typeNames, _typeNames, matchAllTypeNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName-[exceptTypeNames].[fieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some types and its fields
   * @param exceptTypeNames type names to be excluded
   * @param fieldNames field names to be excluded
   * @returns `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static fieldNamesOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: TypeNames,
    fieldNames: FieldNames
  ): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(fieldNames);
    return `${this.anyTypeName}-[${_typeNames}].[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForFieldNamesOfAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptTypeNames` and `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptTypeNames
   * @param fieldNames
   * @returns boolean
   */
  static matchesFieldNamesOfAnyTypeNameExceptTypeNames = (
    typeFieldName: string | TypeFieldName,
    exceptTypeNames: TypeNames,
    fieldNames: FieldNames,
    matchAllTypeNames = false,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForFieldNamesOfAnyTypeNameExceptTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(fieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.typeNames;
      const fieldNames = result.groups.fieldNames;

      matchFound =
        this.matchAll(typeNames, _typeNames, matchAllTypeNames) &&
        this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName-[exceptTypeNames].@*FieldName'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some types
   * @param exceptTypeNames type names to be excluded
   * @returns `'@*TypeName-[exceptTypeNames].@*FieldName'`
   */
  public static anyFieldNameOfAnyTypeNameExceptTypeNames = (exceptTypeNames: TypeNames): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    return `${this.anyTypeName}-[${_typeNames}].${this.anyFieldName}`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForAnyFieldNameOfAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptTypeNames` and `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptTypeNames
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameOfAnyTypeNameExceptTypeNames = (
    typeFieldName: string | TypeFieldName,
    exceptTypeNames: TypeNames,
    matchAllTypeNames = false
  ) => {
    const pattern = this.regexpForAnyFieldNameOfAnyTypeNameExceptTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(exceptTypeNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.typeNames;

      matchFound = this.matchAll(typeNames, _typeNames, matchAllTypeNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some types and its fields
   * @param exceptTypeNames type names to be excluded
   * @param exceptFieldNames field names to be excluded
   * @returns `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: TypeNames,
    exceptFieldNames: FieldNames
  ): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(exceptFieldNames);
    return `${this.anyTypeName}-[${_typeNames}].${this.anyFieldName}-[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static regexpForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptTypeNames` and `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptTypeNames
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = (
    typeFieldName: string | TypeFieldName,
    exceptTypeNames: TypeNames,
    exceptFieldNames: FieldNames,
    matchAllTypeNames = false,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(exceptFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.typeNames;
      const fieldNames = result.groups.fieldNames;

      matchFound =
        this.matchAll(typeNames, _typeNames, matchAllTypeNames) &&
        this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion
}
