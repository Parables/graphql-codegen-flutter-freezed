import { PatternType } from './plugin-config';

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
  public static get allTypeNames(): string {
    return '@*TypeNames';
  }

  public static get allFieldNames(): string {
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

  public static toPattern = (value: string | TypeName) => {
    return new TypeName(this.valueOf(value)).value + ';';
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
 *  @name TypeFieldName
 *
 * @description A compact string of patterns used in the config for granular configuration for each Graphql Type and/or its fieldNames
 *
 * The string can contain one or more patterns, each pattern ends with a semi-colon (`;`).
 *
 * A dot (`.`) is used to separate the TypeName from the FieldNames in each pattern.
 *
 * To apply an option to all Graphql Types or all fields, use the allTypeNames (`@*TypeNames`) and allFieldNames (`@*FieldNames`) tokens respectively.
 *
 * Wherever you use the allTypeNames and the allFieldNames, know very well that you can make some exceptions. After all, to every rule, there is an exception.
 *
 * A **square bracket** (`[]`) is used to specify what should be included and a **negated square bracket** (`-[]`) is used to specify what should be excluded.
 *
 * Manually typing out a pattern may be prone to typos resulting in invalid patterns therefore the [`TypeFieldName`]() class exposes some builder methods which you can use in your plugin config file.
 *
 * ## Available Builder Methods and the patterns they make
 * ```ts
 * const typeFieldName = TypeFieldName.buildTypeNames('Droid, Starship, Human');
 * console.log(typeFieldName); // "Droid;Starship;Human;"
 *
 * const typeFieldName = TypeFieldName.buildAllTypeNames(); // TODO: Create this builder
 * console.log(typeFieldName); // "@*TypeNames';
 *
 * let typeFieldName = TypeFieldName.buildAllTypeNamesExcludeTypeNames('Droid, Starship');
 * console.log(typeFieldName); // "@*TypeNames-['Droid,Starship]';"
 *
 * const typeFieldName = TypeFieldName.buildFieldNamesOfTypeName('Droid', 'id, name');
 * console.log(typeFieldName); // "Droid.[id,name,friends];"
 *
 * const typeFieldName = TypeFieldName.buildAllFieldNamesOfTypeName('Droid');
 * console.log(typeFieldName); // "Droid.@*FieldNames;"
 *
 * const typeFieldName = TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName('Droid', 'id, name');
 * console.log(typeFieldName); // "Droid.@*FieldNames-[id,name];"
 *
 * const typeFieldName = TypeFieldName.buildFieldNamesOfAllTypeNames('id, name');
 * console.log(typeFieldName); // "@*TypeNames.[id,name];"
 *
 * const typeFieldName = TypeFieldName.buildAllFieldNamesOfAllTypeNames();
 * console.log(typeFieldName); // "@*TypeNames.@*FieldNames;"
 *
 * const typeFieldName = TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfAllTypeNames('id, name');
 * console.log(typeFieldName); // "@*TypeNames.@*FieldNames-[id,name];"
 *
 * const typeFieldName = TypeFieldName.buildFieldNamesOfAllTypeNamesExcludeTypeNames('Droid, Starship', 'id, name');
 * console.log(typeFieldName); // "@*TypeNames-[Droid,Starship].[id,name];"
 *
 * const typeFieldName = TypeFieldName.buildAllFieldNamesOfAllTypeNamesExcludeTypeNames('Droid Starship', 'id, name');
 * console.log(typeFieldName); // "@*TypeNames-[Droid,Starship].@*FieldNames;"
 *
 * const typeFieldName = TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames('Droid Starship', 'id, name');
 * console.log(typeFieldName); // "@*TypeNames-[Droid,Starship].@*FieldNames-[id,name];"
 * ```
 *
 */
export class TypeFieldName extends GraphqlTypeFieldName {
  //#region `'TypeName;AnotherTypeName;'`

  public static buildTypeNames = (typeNames: TypeNames): string => {
    const _typeNames = this.valueOf(typeNames).replace(/\s*,|;\s*/gm, ';');
    return _typeNames.endsWith(';') ? _typeNames : _typeNames + ';';
  };

  public static regexpForTypeNames = /\b(?!TypeNames|FieldNames\b)(?<typeNamePattern>\w+;)/gim;

  static matchesTypeNames = (typeFieldNamePatterns: string | string[] | TypeFieldName, typeName: TypeName) => {
    const regexp = this.regexpForTypeNames;

    const _typeFieldNamePatterns = this.valueOf(typeFieldNamePatterns);
    const _typeNamePattern = TypeName.toPattern(typeName);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = regexp.exec(_typeFieldNamePatterns)) !== null) {
      const typeNamePattern = result.groups.typeNamePattern;

      matchFound = typeNamePattern === _typeNamePattern;

      if (matchFound) break;
    }
    this.resetIndex(regexp);
    return matchFound;
  };
  //#endregion

  //#region `'@*TypeNames;'`

  public static buildAllTypeNames = (): string => {
    return `${this.allTypeNames};`;
  };

  public static regexpForAllTypeNames = /(?<allTypeNames>@\*TypeNames;)/gm;

  /*
  static matchesAllTypeNames = (typeFieldName: string | TypeFieldName) => {
    const pattern = this.regexpForTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);

    if (pattern.test(_typeFieldName)) {
      this.resetIndex(pattern);
      return true;
    }
    return false;
  };
  */
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames];'`

  public static buildAllTypeNamesExcludeTypeNames = (excludeTypeNames: TypeNames): string => {
    const _typeNames = this.valueOf(excludeTypeNames);
    return `${this.allTypeNames}-[${_typeNames}];`;
  };

  public static regexpForAllTypeNamesExcludeTypeNames = /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\];/gim;

  static matchesAllTypeNamesExcludeTypeNames = (
    typeFieldName: string | TypeFieldName,
    excludeTypeNames: TypeNames,
    matchAllTypeNames = false
  ) => {
    const pattern = this.regexpForAllTypeNamesExcludeTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(excludeTypeNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.excludeTypeNames;

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
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

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

  public static buildAllFieldNamesOfTypeName = (typeName: string | TypeName): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    return `${_typeName}.${this.allFieldNames};`;
  };

  public static regexpForAllFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim;

  static matchesAllFieldNamesOfTypeName = (typeFieldName: string | TypeFieldName, typeName: string | TypeName) => {
    const pattern = this.regexpForAllFieldNamesOfTypeName;

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

  //#region `'TypeName.@*FieldNames-[excludeFieldNames];'`

  public static buildAllFieldNamesExcludeFieldNamesOfTypeName = (
    typeName: string | TypeName,
    excludeFieldNames: FieldNames
  ): string => {
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(excludeFieldNames);
    return `${_typeName}.${this.allFieldNames}-[${_fieldNames}];`;
  };

  public static regexpForAllFieldNamesExcludeFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<excludeFieldNames>(\w+,?\s*)*)\];/gim;

  static matchesAllFieldNamesExcludeFieldNamesOfTypeName = (
    typeFieldName: string | TypeFieldName,
    typeName: string | TypeName,
    excludeFieldNames: FieldNames,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForAllFieldNamesExcludeFieldNamesOfTypeName;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeName = TypeName.fromString(this.valueOf(typeName)).value; // ensures that there is no comma-separated TypeNames in there
    const _fieldNames = this.valueOf(excludeFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeName = result.groups.typeName;
      const fieldNames = result.groups.excludeFieldNames;

      matchFound = typeName === _typeName && this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames.[fieldNames];'`

  public static buildFieldNamesOfAllTypeNames = (fieldNames: FieldNames): string => {
    const _fieldNames = this.valueOf(fieldNames);
    return `${this.allTypeNames}.[${_fieldNames}];`;
  };

  public static regexpForFieldNamesOfAllTypeNames = /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesFieldNamesOfAllTypeNames = (
    typeFieldName: string | TypeFieldName,
    fieldNames: FieldNames,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForFieldNamesOfAllTypeNames;

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

  public static buildAllFieldNamesOfAllTypeNames = (): string => {
    return `${this.allTypeNames}.${this.allFieldNames};`;
  };

  public static regexpForAllFieldNamesOfAllTypeNames = /@\*TypeNames\.@\*FieldNames;/gim;

  /*
  static matchesAllFieldNamesOfAllTypeNames = (typeFieldName: string | TypeFieldName) => {
    const pattern = this.regexpForAllFieldNamesOfAllTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);

    return pattern.test(_typeFieldName);
  };
  */

  //#endregion

  //#region `'@*TypeNames.@*FieldNames-[excludeFieldNames];'`

  public static buildAllFieldNamesExcludeFieldNamesOfAllTypeNames = (excludeFieldName: FieldNames): string => {
    const _fieldNames = this.valueOf(excludeFieldName);
    return `${this.allTypeNames}.${this.allFieldNames}-[${_fieldNames}];`;
  };

  public static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames =
    /@\*TypeNames\.@\*FieldNames-\[\s*(?<excludeFieldNames>(\w+,?\s*)*)\];/gim;

  static matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames = (
    typeFieldName: string | TypeFieldName,
    excludeFieldNames: FieldNames,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _fieldNames = this.valueOf(excludeFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const fieldNames = result.groups.excludeFieldNames;

      matchFound = this.matchAll(fieldNames, _fieldNames, matchAllFieldNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].[fieldNames];'`

  public static buildFieldNamesOfAllTypeNamesExcludeTypeNames = (
    excludeTypeNames: TypeNames,
    fieldNames: FieldNames
  ): string => {
    const _typeNames = this.valueOf(excludeTypeNames);
    const _fieldNames = this.valueOf(fieldNames);
    return `${this.allTypeNames}-[${_typeNames}].[${_fieldNames}];`;
  };

  public static regexpForFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeFieldName: string | TypeFieldName,
    excludeTypeNames: TypeNames,
    fieldNames: FieldNames,
    matchAllTypeNames = false,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(excludeTypeNames);
    const _fieldNames = this.valueOf(fieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.excludeTypeNames;
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

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames;'`

  public static buildAllFieldNamesOfAllTypeNamesExcludeTypeNames = (excludeTypeNames: TypeNames): string => {
    const _typeNames = this.valueOf(excludeTypeNames);
    return `${this.allTypeNames}-[${_typeNames}].${this.allFieldNames};`;
  };

  public static regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim;

  static matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeFieldName: string | TypeFieldName,
    excludeTypeNames: TypeNames,
    matchAllTypeNames = false
  ) => {
    const pattern = this.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(excludeTypeNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.excludeTypeNames;

      matchFound = this.matchAll(typeNames, _typeNames, matchAllTypeNames);

      if (matchFound) break;
    }
    this.resetIndex(pattern);
    return matchFound;
  };

  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames-[excludeFieldNames];'`

  public static buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    excludeTypeNames: TypeNames,
    excludeFieldNames: FieldNames
  ): string => {
    const _typeNames = this.valueOf(excludeTypeNames);
    const _fieldNames = this.valueOf(excludeFieldNames);
    return `${this.allTypeNames}-[${_typeNames}].${this.allFieldNames}-[${_fieldNames}];`;
  };

  public static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<excludeFieldNames>(\w+,?\s*)*)\];/gim;

  static matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeFieldName: string | TypeFieldName,
    excludeTypeNames: TypeNames,
    excludeFieldNames: FieldNames,
    matchAllTypeNames = false,
    matchAllFieldNames = false
  ) => {
    const pattern = this.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;

    const _typeFieldName = this.valueOf(typeFieldName);
    const _typeNames = this.valueOf(excludeTypeNames);
    const _fieldNames = this.valueOf(excludeFieldNames);

    let result: RegExpExecArray | null;
    let matchFound: boolean;

    while ((result = pattern.exec(_typeFieldName)) !== null) {
      const typeNames = result.groups.excludeTypeNames;
      const fieldNames = result.groups.excludeFieldNames;

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
    fieldName?: FieldName
  ) => {
    return this.attemptIncludes(typeFieldName, typeName, fieldName);
  };

  public static attemptIncludes = (
    typeFieldName: string | TypeFieldName,
    typeName: TypeName,
    fieldName?: FieldName
  ) => {
    const _typeFieldName = this.valueOf(typeFieldName);
    const patternType = 'include';

    if (this.regexpForTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForTypeNames);
      const patternMatches = this.matchesTypeNames(_typeFieldName, typeName);
      return this.attemptResult(patternType, patternMatches);
    } else if (this.regexpForAllTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAllTypeNames);
      const patternMatches = true;
      return this.attemptResult(patternType, patternMatches);
    } else if (fieldName && this.regexpForFieldNamesOfTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForFieldNamesOfTypeName);
      const patternMatches = this.matchesFieldNamesOfTypeName(_typeFieldName, typeName, fieldName);
      return this.attemptResult(patternType, patternMatches);
    } else if (this.regexpForAllFieldNamesOfTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAllFieldNamesOfTypeName);
      const patternMatches = this.matchesAllFieldNamesOfTypeName(_typeFieldName, typeName);
      return this.attemptResult(patternType, patternMatches);
    } else if (fieldName && this.regexpForFieldNamesOfAllTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForFieldNamesOfAllTypeNames);
      const patternMatches = this.matchesFieldNamesOfAllTypeNames(_typeFieldName, fieldName);
      return this.attemptResult(patternType, patternMatches);
    } else if (this.regexpForAllFieldNamesOfAllTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAllFieldNamesOfAllTypeNames);
      const patternMatches = true;
      return this.attemptResult(patternType, patternMatches);
    }
    return this.attemptExcludes(_typeFieldName, typeName, fieldName);
  };

  public static attemptExcludes = (
    typeFieldName: string | TypeFieldName,
    typeName: TypeName,
    fieldName?: FieldName
  ) => {
    const _typeFieldName = this.valueOf(typeFieldName);
    const patternType = 'exclude';

    if (this.regexpForAllTypeNamesExcludeTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAllTypeNamesExcludeTypeNames);
      const patternMatches = this.matchesAllTypeNamesExcludeTypeNames(_typeFieldName, typeName);
      return this.attemptResult(patternType, patternMatches);
    } else if (fieldName && this.regexpForAllFieldNamesExcludeFieldNamesOfTypeName.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAllFieldNamesExcludeFieldNamesOfTypeName);
      const patternMatches = this.matchesAllFieldNamesExcludeFieldNamesOfTypeName(_typeFieldName, typeName, fieldName);
      return this.attemptResult(patternType, patternMatches);
    } else if (fieldName && this.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames);
      const patternMatches = this.matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames(_typeFieldName, fieldName);
      return this.attemptResult(patternType, patternMatches);
    } else if (fieldName && this.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames);
      const patternMatches = this.matchesFieldNamesOfAllTypeNamesExcludeTypeNames(_typeFieldName, typeName, fieldName);
      return this.attemptResult(patternType, patternMatches);
    } else if (this.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames.test(_typeFieldName)) {
      this.resetIndex(this.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames);
      const patternMatches = this.matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames(_typeFieldName, typeName);
      return this.attemptResult(patternType, patternMatches);
    } else if (
      fieldName &&
      this.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames.test(_typeFieldName)
    ) {
      this.resetIndex(this.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames);
      const patternMatches = this.matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(
        _typeFieldName,
        typeName,
        fieldName
      );
      return this.attemptResult(patternType, patternMatches);
    }

    return this.attemptResult('exclude', false);
  };

  private static attemptResult = (patternType: PatternType, patternMatches = true) => {
    return {
      patternType,
      patternMatches,
    };
  };
}
