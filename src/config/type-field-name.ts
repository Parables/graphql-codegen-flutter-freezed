/**
 * A list of GraphQL Type Names
 */
type TypeNames = string | string[] | TypeName | TypeName[];

/**
 * A list of field names of a GraphQL Type
 */
type FieldNames = string | string[] | FieldName | FieldName[];

class GraphqlTypeFieldName {
  private _value: string;

  constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }
  public static get anyTypeName(): string {
    return '@*TypeNames';
  }

  public static get anyFieldName(): string {
    return '@*FieldNames';
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
    return typeof value === 'string' ? this.trimNameList(value) : value.map(field => this.trimNameList(field)).join();
  };

  public static trimNameList = (name: string): string => {
    if (name.length < 1) {
      throw new Error('Name cannot be empty');
    }
    return name
      .split(/\s*,\s*/gim)
      .map(n => n.trim())
      .filter(type => type.length > 0)
      .join();
  };

  public static matchAll = (parent: string, child: string, matchAll = false) => {
    const parentList = parent.split(/\s*,\s*/gim).filter(p => p.length > 0);
    const childList = child.split(/\s*,\s*/gim).filter(p => p.length > 0);
    return matchAll
      ? childList.every(c => parentList.find(p => p === c))
      : childList.some(c => parentList.find(p => p === c));
  };
}

/**
 * @name TypeName
 * @description represents a single valid GraphQL Type Name used in the GraphQL Schema provided
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // returns a TypeName
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
    } else if (value.includes(',') || value.includes(';')) {
      throw new Error('TypeName cannot contain multiple GraphQL Type names');
    }
    return new TypeName(value.trim());
  };
}

/**
 * @name FieldName
 * @description Represents a single valid name of a field belong to a Graphql Type.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // returns a FieldName
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
    } else if (value.includes(',') || value.includes(';')) {
      throw new Error('FieldName cannot contain multiple GraphQL Field names');
    }
    return new FieldName(value.trim());
  };
}

/**
 * @name TypeFieldName
 * @description A compact string of patterns used in the config for granular configuration for each Graphql Type and/or its fieldNames
 *
 * The string can contain more than one pattern, each pattern ends with a semi-colon`;`.
 *
 * A dot `.` separates the TypeName from the FieldNames in each pattern
 *
 * To apply an option to any TypeName or FieldName, use the anyTypeName(`@*TypeNames`) and anyFieldName(`@*FieldNames`) tokens respectively
 *
 * To specify more than one TypeName or FieldName, use `[]` to specify what should be included and `-[]` for what should be excluded
 *
 * Manually typing out a pattern may be prone to typos and invalid patterns therefore this class exposes some builder methods
 *
 * Wherever a builder method accepts parameter with a type signature of [`TypeNames`]() or [`FieldNames`](), you can use any of the following:
 * 1. a single string. E.g: 'Droid'
 * ```ts
 * // using a string
 * const typeFieldName = TypeFieldName.buildTypeName('Droid');
 * console.log(typeFieldName) // "Droid;"
 * ```
 * 2. a comma-separated string for multiple types/fields. E.g: 'Droid, Starship, Human'
 * The rest of this guide uses this approach wherever a builder method accepts a parameter with a type signature of [`TypeNames`]() or [`FieldNames`]()
 * ```ts
 * // using a comma-separated string
 * const typeFieldName = TypeFieldName.buildTypeName('Droid, Starship, Human');
 * console.log(typeFieldName) // "Droid;Starship;Human;"
 * ```
 * 3. an array of strings. E.g: `['Droid', 'Starship']`
 * ```ts
 * // using an array of strings
 * const typeFieldName = TypeFieldName.buildTypeName(['Droid', 'Starship', 'Human']);
 * console.log(typeFieldName) // "Droid;Starship;Human;"
 * ```
 * 4. a single TypeName or FieldName. E.g: `TypeName.fromString('Droid')`
 * ```ts
 * // using a TypeFieldName/FieldName
 * let typeName = TypeName.fromString('Droid');
 * const typeFieldName = TypeFieldName.buildTypeName(typeName)
 * console.log(typeFieldName) // "Droid;" 
 * ```
 5. an array of TypeName or FieldName. E.g:  `[TypeName.fromString('Droid'), [TypeName.fromString('Starship')]]`
 * ```ts
 * // using an array of TypeFieldName
 * let Droid = TypeName.fromString('Droid');
 * let Starship = TypeName.fromString('Starship');
 * let Human = TypeName.fromString('Human');
 * const typeFieldName = TypeFieldName.buildTypeName([Droid, Starship, Human])
 * console.log(typeFieldName) // "Droid;Starship;Human;"
 * ```

 * > The first usage example below demonstrates a builder that accepts a parameter with a type signature of `TypeNames`.
 * >
 * > For brevity, this guide uses a comma-separated string wherever `TypeNames` or `FieldNames` is required
 *
 * @exampleMarkdown
 * ## Usage for Graphql Types
 * ### Configuration for Type Name(s)
 * You can explicity list out the names of the Graphql Types that you want to configure.
 * ```ts
 * const typeFieldName = TypeFieldName.buildTypeName('Droid, Starship, Human');
 * console.log(typeFieldName) // "Droid;Starship;Human;"
 * ```
 *
 * ### Configuration for Any/All TypeName
 * Instead of manually listing out **all** the types in the Graphql Schema, use this to configure any/all the Graphql Types in the Schema
 * ```ts
 * let typeFieldName = TypeFieldName.buildAnyTypeName() // TODO: Create this builder
 * console.log(typeFieldName) // "@*TypeNames;"
 * ```
 *
 * ### Configuration for Any/All TypeName Except Some TypeNames
 * This would apply the configuration to any/all GraphQL Types except those specified.
 *
 * In the example below, the configuration will be applied to any/all the Graphql Types in the Schema except the `Droid` and `Starship` types
 * ```ts
 * let typeFieldName = TypeFieldName.buildAnyTypeNameExceptTypeNames('Droid, Starship');
 * console.log(typeFieldName) // "@*TypeNames-['Droid,Starship]';"
 * ```
 * ## Usage for fields of Graphql Types
 * For each of the 3 builder methods available for configuring Graphql Types, there is also similar builder methods for configuring fields belong to that Graphql Type
 * 
 * ### Configuration for fields of Type Name(s)
 * You can explicity list out the names of the fields of the Graphql Types that you want to configure.
 * ```ts
 * const typeFieldName = TypeFieldName.buildFieldNamesOfTypeName('Droid', 'id, name, friends');
 * console.log(typeFieldName) // "Droid.[id,name,friends];"
 * ```
 * 
 * ### Configuration for any fields of Type Name(s)
 * Instead of manually listing out **all** the fields of the Graphql Type, use this to configure any/all the fields of the Graphql Type.
 * ```ts
 * const typeFieldName = TypeFieldName.buildAnyFieldNameOfTypeName('Droid');
 * console.log(typeFieldName) // "Droid.@*FieldNames;"
 * ```
 * 
 * ### Configuration for fields Any/All TypeName
 * You can explicity list out the names of the fields of any Graphql Types that you want to configure. 
 * 
 * If field name that doesn't exists, it would be ignored.
 * ```ts
 * let typeFieldName = TypeFieldName.buildFieldNamesOfAnyTypeName('id, name, friends') // TODO: Create this builder
 * console.log(typeFieldName) // "@*TypeNames.[id,name,friends];"
 * ```
 *
 * ### Configuration for Any/All TypeName Except Some TypeNames
 * This would apply the configuration to any/all GraphQL Types except those specified.
 *
 * In the example below, the configuration will be applied to any/all the Graphql Types in the Schema except the `Droid` and `Starship` types
 * ```ts
 * let typeFieldName = TypeFieldName.buildAnyTypeNameExceptTypeNames('Droid, Starship');
 * console.log(typeFieldName) // "@*TypeNames-['Droid,Starship]';"
 * ```
 * TODO: Update the following documentation
 
 *
 * ### Configuring the fields of GraphQL Types
 * ```ts
 * let typeFieldName1 = 'Droid.[id,friends]' // in an array, specify one or more fields for that GraphQL Type. This example applies on the `id` and `friends` fields of the Droid GraphQL Type
 *
 * let typeFieldName2 = 'Droid.[id,friends]; Starship.[id]; @*TypeNames.[id];' // same as `typeFieldName1` but for multiple patterns
 *
 * let typeFieldName3 = 'Droid.@*FieldNames' // applies on all fields of the Droid GraphQL Type
 *
 * let typeFieldName4 = 'Droid.@*FieldNames-[name,appearsIn]' // if there are many fields to be specified, use this to specify those to be **excluded**. This example applies on all of the fields of the Droid GraphQL Type except the `name` and `appearsIn` fields
 *
 *
 * let typeFieldName5 = '@*TypeNames.[id]' // applies on the `id` field of any GraphQL Types
 *
 *
 * let typeFieldName6 = '@*TypeNames-[Human,Starship].[id]' // applies on the `id` field of any GraphQL Types except the `Human` and `Starship` types
 *
 * let typeFieldName7 = '@*TypeNames.@*FieldNames' // applies on all of the fields of the GraphQL Types
 *
 * let typeFieldName8 = '@*TypeNames-[Human,Starship].@*FieldNames' // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types
 *
 * let typeFieldName9 = '@*TypeNames.@*FieldNames-[id,name]' // applies on all of the fields of the GraphQL Types except the `id` and `name` fields
 *
 * let typeFieldName10 = '@*TypeNames-[Human,Movie].@*FieldNames-[id,name]' // applies on all of the fields of the GraphQL Types except the `Human` and `Starship` types and the `id` and `name` fields
 * ```
 * */
export class TypeFieldName extends GraphqlTypeFieldName {
  //#region `'TypeName; AnotherTypeName;'`

  public static buildTypeName = (typeNames: TypeNames): string => {
    return this.valueOf(typeNames).replace(/\s*,|;\s*/, ';');
  };

  public static regexpForTypeName = /\b(?!TypeName|FieldName\b)(?<typeName>\w+;)/gim;

  static matchesTypeName = (typeFieldName: string | TypeFieldName, typeName: TypeName) => {
    const pattern = this.regexpForTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = this.valueOf(typeName);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;

      matchFound = typeName === _typeName;

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };
  //#endregion

  //#region `'@*TypeNames'`

  public static buildAnyTypeName = (typeNames: TypeNames): string => {
    return `${this.anyTypeName};`;
  };

  public static regexpForAnyTypeName = /(?<anyTypeName>@\*TypeName;)/gm;

  static matchesAnyTypeName = (typeFieldName: string | TypeFieldName) => {
    const pattern = this.regexpForTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);

    if (pattern.test(_typeFieldName)) {
      this.resetIndex(pattern);
      return true;
    }
    return false;
  };
  //#endregion

  //#region `'@*TypeNames-[exceptTypeNames];'`

  public static buildAnyTypeNameExceptTypeNames = (exceptTypeNames: TypeNames): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    return `${this.anyTypeName}-[${_typeNames}];`;
  };

  public static regexpForAnyTypeNameExceptTypeNames = /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\];/gim;

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
      const typeNames = result.groups.exceptTypeNames;

      matchFound = this.matchAll(typeNames, _typeNames, matchAllTypeNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'TypeName.[fieldNames];'`

  public static buildFieldNamesOfTypeName = (typeName: string | TypeName, fieldNames: FieldNames): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(fieldNames);
    return `${_typeName}.[${_fieldNames}];`;
  };

  public static regexpForFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

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
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'TypeName.@*FieldNames;'`

  public static buildAnyFieldNameOfTypeName = (typeName: string | TypeName): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    return `${_typeName}.${this.anyFieldName};`;
  };

  public static regexpForAnyFieldNameOfTypeName = /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.@\*FieldName;/gim;

  static matchesAnyFieldNameOfTypeName = (typeFieldName: string | TypeFieldName, typeName: string | TypeName) => {
    const pattern = this.regexpForAnyFieldNameOfTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;

      matchFound = typeName === _typeName;

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'TypeName.@*FieldNames-[exceptFieldNames];'`

  public static buildAnyFieldNameExceptFieldNamesOfTypeName = (
    typeName: string | TypeName,
    exceptFieldNames: FieldNames
  ): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(exceptFieldNames);
    return `${_typeName}.${this.anyFieldName}-[${_fieldNames}];`;
  };

  public static regexpForAnyFieldNameExceptFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim;

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
      const fieldNames = result.groups.exceptFieldNames;

      matchFound = typeName === _typeName && this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames.[fieldNames];'`

  public static buildFieldNamesOfAnyTypeName = (fieldNames: FieldNames): string => {
    const _fieldNames = this.valueOf(fieldNames);
    return `${this.anyTypeName}.[${_fieldNames}];`;
  };

  public static regexpForFieldNamesOfAnyTypeName = /@\*TypeName\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

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
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames.@*FieldNames;'`

  public static buildAnyFieldNameOfAnyTypeName = (): string => {
    return `${this.anyTypeName}.${this.anyFieldName};`;
  };

  public static regexpForAnyFieldNameOfAnyTypeName = /@\*TypeName\.@\*FieldName;/gim;

  /**
   * returns true or false if typeFieldName matches `'@*TypeNames.@*FieldNames-[exceptFieldNames]'` and the typeFieldName includes the `exceptFieldNames`.
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

  //#region `'@*TypeNames.@*FieldNames-[exceptFieldNames];'`

  public static buildAnyFieldNameExceptFieldNamesOfAnyTypeName = (exceptFieldName: FieldNames): string => {
    const _fieldNames = this.valueOf(exceptFieldName);
    return `${this.anyTypeName}.${this.anyFieldName}-[${_fieldNames}];`;
  };

  public static regexpForAnyFieldNameExceptFieldNamesOfAnyTypeName =
    /@\*TypeName\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim;

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
      const fieldNames = result.groups.exceptFieldNames;

      matchFound = this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames-[exceptTypeNames].[fieldNames];'`

  public static buildFieldNamesOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: TypeNames,
    fieldNames: FieldNames
  ): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(fieldNames);
    return `${this.anyTypeName}-[${_typeNames}].[${_fieldNames}];`;
  };

  public static regexpForFieldNamesOfAnyTypeNameExceptTypeNames =
    /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

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
      const typeNames = result.groups.exceptTypeNames;
      const fieldNames = result.groups.fieldNames;

      matchFound =
        this.matchAll(typeNames, _typeNames, matchAllTypeNames) &&
        this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames-[exceptTypeNames].@*FieldNames;'`

  public static buildAnyFieldNameOfAnyTypeNameExceptTypeNames = (exceptTypeNames: TypeNames): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    return `${this.anyTypeName}-[${_typeNames}].${this.anyFieldName};`;
  };

  public static regexpForAnyFieldNameOfAnyTypeNameExceptTypeNames =
    /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.@\*FieldName;/gim;

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
      const typeNames = result.groups.exceptTypeNames;

      matchFound = this.matchAll(typeNames, _typeNames, matchAllTypeNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames-[exceptTypeNames].@*FieldNames-[exceptFieldNames];'`

  public static buildAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = (
    exceptTypeNames: TypeNames,
    exceptFieldNames: FieldNames
  ): string => {
    const _typeNames = this.valueOf(exceptTypeNames);
    const _fieldNames = this.valueOf(exceptFieldNames);
    return `${this.anyTypeName}-[${_typeNames}].${this.anyFieldName}-[${_fieldNames}];`;
  };

  public static regexpForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames =
    /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim;

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
      const typeNames = result.groups.exceptTypeNames;
      const fieldNames = result.groups.exceptFieldNames;

      matchFound =
        this.matchAll(typeNames, _typeNames, matchAllTypeNames) &&
        this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  static resetIndex = (regexp: RegExp) => {
    regexp.lastIndex = 0;
  };

  public static attemptTypeFieldNameMatches = (
    typeFieldName: string | TypeFieldName,
    typeName: TypeName,
    fieldName: FieldName
  ) => {
    return this.attemptIncludes(typeFieldName, typeName, fieldName);
  };

  public static attemptIncludes = (typeFieldName: string | TypeFieldName, typeName: TypeName, fieldName: FieldName) => {
    const _typeFieldName = this.valueOf(typeFieldName);

    if (this.regexpForFieldNamesOfTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForFieldNamesOfTypeName);
      return this.matchesFieldNamesOfTypeName(_typeFieldName, typeName, fieldName);
    } else if (this.regexpForAnyFieldNameOfTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAnyFieldNameOfTypeName);
      return this.matchesAnyFieldNameOfTypeName(_typeFieldName, typeName);
    } else if (this.regexpForFieldNamesOfAnyTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForFieldNamesOfAnyTypeName);
      return this.matchesFieldNamesOfAnyTypeName(_typeFieldName, fieldName);
    } else if (this.regexpForAnyFieldNameOfAnyTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAnyFieldNameOfAnyTypeName);
      return this.matchesAnyFieldNameOfAnyTypeName(_typeFieldName);
    }
    return this.attemptExcludes(_typeFieldName, typeName, fieldName);
  };

  public static attemptExcludes = (typeFieldName: string | TypeFieldName, typeName: TypeName, fieldName: FieldName) => {
    const _typeFieldName = this.valueOf(typeFieldName);

    if (this.regexpForAnyFieldNameExceptFieldNamesOfTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAnyFieldNameExceptFieldNamesOfTypeName);
      return !this.matchesAnyFieldNameExceptFieldNamesOfTypeName(_typeFieldName, typeName, fieldName);
    } else if (this.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeName);
      return !this.matchesAnyFieldNameExceptFieldNamesOfAnyTypeName(_typeFieldName, fieldName);
    } else if (this.regexpForAnyTypeNameExceptTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAnyTypeNameExceptTypeNames);
      return !this.matchesAnyTypeNameExceptTypeNames(_typeFieldName, typeName);
    } else if (this.regexpForFieldNamesOfAnyTypeNameExceptTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForFieldNamesOfAnyTypeNameExceptTypeNames);
      return !this.matchesFieldNamesOfAnyTypeNameExceptTypeNames(_typeFieldName, typeName, fieldName);
    } else if (this.regexpForAnyFieldNameOfAnyTypeNameExceptTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAnyFieldNameOfAnyTypeNameExceptTypeNames);
      return !this.matchesAnyFieldNameOfAnyTypeNameExceptTypeNames(_typeFieldName, typeName);
    } else if (this.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames);
      return !this.matchesAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(_typeFieldName, typeName, fieldName);
    }
    return false;
  };
}
