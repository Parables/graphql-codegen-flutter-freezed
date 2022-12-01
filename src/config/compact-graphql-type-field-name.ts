class GraphqlTypeFieldName {
  private _value: string;

  constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
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
 * @description A compact string of GraphQL Type and Field Names separated with a  dot(`.`) used in the config for specifying options for a list of Graphql Types and Fields
 * @exampleMarkdown
 * ### Configuring GraphQL Types
 * ```ts
 *  let typeName3:TypeFieldName = '@*TypeName' //  This example applies for all GraphQL Types
 *
 *  let typeName4:TypeFieldName = '@*TypeName-[Human,Movie]' // if there are many types to be specified, use this to specify those to be **excluded**. This example applies on all types in the GraphQL Schema except the `Human` and `Movie` types
 *
 * let typeName1:TypeFieldName = 'Droid' // This example applies on the Droid GraphQL Type
 *
 * let typeName2:TypeFieldName = 'Droid, Starship' // a comma-separated string of GraphQL Type names. This example applies on the Droid and Starship GraphQL Types
 *
 * ```
 *
 * ### Configuring the fields of GraphQL Types
 * ```ts
 * let typeFieldName1:TypeFieldName = 'Droid.[id,friends]' // in an array, specify one or more fields for that GraphQL Type. This example applies on the `id` and `friends` fields of the Droid GraphQL Type
 *
 * let typeFieldName2:TypeFieldName = 'Droid.[id,friends], Starship.[id], @*TypeName.[id]' // same as `typeFieldName1` but for more than one GraphQL Type
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
  public static get anyTypeName(): string {
    return '@*TypeName';
  }
  public static get anyFieldName(): string {
    return '@*FieldName';
  }

  //#region `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some types and its fields
   * @param exceptTypeNames type names to be excluded
   * @param exceptFieldNames field names to be excluded
   * @returns `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: string | string[] | TypeName[],
    exceptFieldNames: string | string[] | FieldName[]
  ): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(exceptFieldNames);
    return `${this.anyTypeName}-[${_typeNames}].${this.anyFieldName}-[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static regexForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptTypeNames` and `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptTypeNames
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = (
    typeFieldName: TypeFieldName | string,
    exceptTypeNames: string | string[] | TypeName[],
    exceptFieldNames: string | string[] | FieldName[]
  ) => {
    const pattern = this.regexForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(exceptFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.typeNames;
      const fieldNames = result.groups.fieldNames;

      matchFound = typeNames.includes(_typeNames) && fieldNames.includes(_fieldNames);

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
  public static anyFieldNameOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: string | string[] | TypeName[]
  ): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    return `${this.anyTypeName}-[${_typeNames}].${this.anyFieldName}`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static regexForAnyFieldNameOfAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptTypeNames` and `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptTypeNames
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameOfAnyTypeNameExceptTypeNames = (
    typeFieldName: TypeFieldName | string,
    exceptTypeNames: string | string[] | TypeName[]
  ) => {
    const pattern = this.regexForAnyFieldNameOfAnyTypeNameExceptTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(exceptTypeNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.typeNames;

      matchFound = typeNames.includes(_typeNames);

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
    exceptTypeNames: string | string[] | TypeName[],
    fieldNames: string | string[] | FieldName[]
  ): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(fieldNames);
    return `${this.anyTypeName}-[${_typeNames}].[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
   */
  public static regexForFieldNamesOfAnyTypeNameExceptTypeNames =
    /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptTypeNames` and `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptTypeNames
   * @param fieldNames
   * @returns boolean
   */
  static matchesFieldNamesOfAnyTypeNameExceptTypeNames = (
    typeFieldName: TypeFieldName | string,
    exceptTypeNames: string | string[] | TypeName[],
    fieldNames: string | string[] | FieldName[]
  ) => {
    const pattern = this.regexForFieldNamesOfAnyTypeNameExceptTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(fieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.typeNames;
      const fieldNames = result.groups.fieldNames;

      matchFound = typeNames.includes(_typeNames) && fieldNames.includes(_fieldNames);

      if (matchFound) break;
    }
    return matchFound;
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
    exceptFieldName: string | string[] | FieldName[]
  ): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(exceptFieldName);
    return `${_typeName}.${this.anyFieldName}-[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexForAnyFieldNameExceptFieldNamesOfTypeName =
    /[^@*TypeName](?<typeName>(\w+?))\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameExceptFieldNamesOfTypeName = (
    typeFieldName: TypeFieldName | string,
    typeName: string | TypeName,
    exceptFieldNames: string | string[] | FieldName[]
  ) => {
    const pattern = this.regexForAnyFieldNameExceptFieldNamesOfTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(exceptFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;
      const fieldNames = result.groups.fieldNames;

      matchFound = typeName === _typeName && fieldNames.includes(_fieldNames);

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
  public static anyFieldNameOfAnyTypeNameExceptFieldNames = (
    exceptFieldName: string | string[] | FieldName[]
  ): string => {
    const _fieldNames = this.valueOf(exceptFieldName);
    return `${this.anyTypeName}.${this.anyFieldName}-[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexForAnyFieldNameExceptFieldNamesOfAnyTypeName =
    /@\s*\*\s*TypeName\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameExceptFieldNamesOfAnyTypeName = (
    typeFieldName: TypeFieldName | string,
    exceptFieldNames: string | string[] | FieldName[]
  ) => {
    const pattern = this.regexForAnyFieldNameExceptFieldNamesOfAnyTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _fieldNames = this.valueOf(exceptFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const fieldNames = result.groups.fieldNames;

      matchFound = fieldNames.includes(_fieldNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'TypeName.[fieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'TypeName.[fieldNames]'`
   */
  public static fieldNamesOfTypeName = (
    typeName: string | TypeName,
    fieldName: string | string[] | FieldName[]
  ): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(fieldName);
    return `${_typeName}.[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexForFieldNamesOfTypeName =
    /[^@*TypeName](?<typeName>(\w+?))\s*\.\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param typeName
   * @param fieldNames
   * @returns boolean
   */
  static matchesFieldNamesOfTypeName = (
    typeFieldName: TypeFieldName | string,
    typeName: string | TypeName,
    fieldNames: string | string[] | FieldName[]
  ) => {
    const pattern = this.regexForFieldNamesOfTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(fieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;
      const fieldNames = result.groups.fieldNames;

      matchFound = typeName === _typeName && fieldNames.includes(_fieldNames);

      if (matchFound) break;
    }
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeName.[fieldNames]'`

  /**
   * Use this in the config to specify an option that applies on **any** field of **any** type **excluding** some of its fields
   * @param exceptFieldNames field names to be excluded
   * @returns `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static fieldNamesOfAnyTypeName = (fieldName: string | string[]): string => {
    const _fieldNames = this.valueOf(fieldName);
    return `${this.anyTypeName}.[${_fieldNames}]`;
  };

  /**
   * returns a RegExp that you can use to test if a string matches `'@*TypeName.@*FieldName-[exceptFieldNames]'`
   */
  public static regexForFieldNamesOfAnyTypeName = /@\s*\*\s*TypeName\s*\.\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param fieldNames
   * @returns boolean
   */
  static matchesFieldNamesOfAnyTypeName = (
    typeFieldName: TypeFieldName | string,
    fieldNames: string | string[] | FieldName[]
  ) => {
    const pattern = this.regexForFieldNamesOfAnyTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _fieldNames = this.valueOf(fieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const fieldNames = result.groups.fieldNames;

      matchFound = fieldNames.includes(_fieldNames);

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
  public static regexForAnyFieldNameOfTypeName =
    /[^@*TypeName](?<typeName>(\w+?))\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameOfTypeName = (typeFieldName: TypeFieldName | string, typeName: string | TypeName) => {
    const pattern = this.regexForAnyFieldNameOfAnyTypeName;

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
  public static regexForAnyFieldNameOfAnyTypeName = /@\s*\*\s*TypeName\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeName.@*FieldName-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
   * @param typeFieldName
   * @param exceptFieldNames
   * @returns boolean
   */
  static matchesAnyFieldNameOfAnyTypeName = (typeFieldName: TypeFieldName | string) => {
    const pattern = this.regexForAnyFieldNameOfAnyTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);

    return pattern.test(_typeFieldName);
  };

  //#endregion

  //   public static anyTypeNameExceptTypeNames = (typeNames: string | string[]): string => {
  //     const _typeNames = this.valueOf(typeNames);
  //     return `${this.anyTypeName}-[${this.fromString(_typeNames).value}]`;
  //   };
}
