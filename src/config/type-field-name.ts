import type { StringOr } from './plugin-config';

// eslint-disable-next-line @typescript-eslint/ban-types
export function frozen(target: Function): void {
  Object.freeze(target);
  Object.freeze(target.prototype);
}

/**
 * A list of GraphQL Type Names
 */
type TypeNames = StringOr<string[] | TypeName | TypeName[]>;

/**
 * A list of field names of a GraphQL Type
 */
type FieldNames = StringOr<string[] | FieldName | FieldName[]>;

// @frozen
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

  static valueOf(value: StringOr<string[] | GraphqlTypeFieldName | GraphqlTypeFieldName[]>) {
    if (Array.isArray(value)) {
      return value
        .map((v: StringOr<GraphqlTypeFieldName>) => {
          if (v instanceof GraphqlTypeFieldName) {
            return GraphqlTypeFieldName.fromStringOrArray(v.value);
          }
          return GraphqlTypeFieldName.fromStringOrArray(v);
        })
        .join();
    }
    return value instanceof GraphqlTypeFieldName
      ? GraphqlTypeFieldName.fromStringOrArray(value.value)
      : GraphqlTypeFieldName.fromStringOrArray(value);
  }

  static fromStringOrArray(value: StringOr<string[]>) {
    return typeof value === 'string'
      ? GraphqlTypeFieldName.trimNameList(value)
      : value.map(field => GraphqlTypeFieldName.trimNameList(field)).join();
  }

  static trimNameList(name: string) {
    if (name.length < 1) {
      throw new Error('Name cannot be empty');
    }
    return name
      .split(/\s*,\s*/gim)
      .map(n => n.trim())
      .filter(type => type.length > 0)
      .join();
  }

  static matchAll(parent: string, child: string, matchAll = false) {
    const parentList = parent.split(/\s*,\s*/gim).filter(p => p.length > 0);
    const childList = child.split(/\s*,\s*/gim).filter(p => p.length > 0);
    return matchAll
      ? childList.every(c => parentList.find(p => p === c))
      : childList.some(c => parentList.find(p => p === c));
  }
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
// @frozen
export class TypeName extends GraphqlTypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  static fromString(value: string) {
    if (value.length < 1) {
      throw new Error('TypeName requires a GraphQL Type name');
    } else if (value.includes(',') || value.includes(';')) {
      throw new Error('TypeName cannot contain multiple GraphQL Type names');
    }
    return new TypeName(value.trim());
  }

  static fromTypeNames(typeNames: TypeNames) {
    return strToList(TypeName.valueOf(typeNames).replace(/\s*,|;\s*/gm, ','))
      .map(value => TypeName.fromString(value).value)
      .join();
  }

  static toPattern(value: StringOr<TypeName>) {
    return new TypeName(TypeName.valueOf(value)).value + ';';
  }
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
// @frozen
export class FieldName extends GraphqlTypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  static fromString(value: string) {
    if (value.length < 1) {
      throw new Error('FieldName requires a name of a field in GraphQL Type');
    } else if (value.includes(',') || value.includes(';')) {
      throw new Error('FieldName cannot contain multiple GraphQL Field names');
    }
    return new FieldName(value.trim());
  }

  static fromFieldNames(fieldNames: TypeNames) {
    return strToList(FieldName.valueOf(fieldNames).replace(/\s*,|;\s*/gm, ','))
      .map(value => FieldName.fromString(value).value)
      .join();
  }
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
 * const typeFieldName = TypeFieldName.buildAllTypeNames();
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
// @frozen
export class TypeFieldName extends GraphqlTypeFieldName {
  //#region `'TypeName;AnotherTypeName;'`

  static buildTypeNames(typeNames: TypeNames) {
    typeNames = TypeName.fromTypeNames(typeNames).replace(/\s*,|;\s*/gm, ';');
    return typeNames.endsWith(';') ? typeNames : typeNames + ';';
  }

  public static regexpForTypeNames = /\b(?!TypeNames|FieldNames\b)(?<typeName>\w+;)/gim;

  static matchesTypeNames(pattern: string, typeName: StringOr<TypeName>) {
    const regexp = TypeFieldName.regexpForTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.toPattern(typeName);

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeName = result.groups.typeName;

      if (foundTypeName === typeName) {
        return matchFound(regexp);
      }
    }
    return matchFound(regexp, false);
  }
  //#endregion

  //#region `'@*TypeNames;'`

  static buildAllTypeNames() {
    return `${TypeFieldName.allTypeNames};`;
  }

  public static regexpForAllTypeNames = /(?<allTypeNames>@\*TypeNames;)/gm;

  static matchesAllTypeNames = (pattern: string) => {
    const regexp = TypeFieldName.regexpForAllTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);

    if (regexp.test(pattern)) {
      resetIndex(regexp);
      return matchFound(regexp, true);
    }
    return matchFound(regexp, false);
  };

  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames];'`

  public static buildAllTypeNamesExcludeTypeNames = (typeNames: TypeNames): string => {
    typeNames = TypeName.fromTypeNames(typeNames);
    return `${TypeFieldName.allTypeNames}-[${typeNames}];`;
  };

  public static regexpForAllTypeNamesExcludeTypeNames = /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\];/gim;

  static matchesAllTypeNamesExcludeTypeNames = (pattern: string, typeName: StringOr<TypeName>) => {
    const regexp = TypeFieldName.regexpForAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);

      if (foundTypeNames.find(_typeName => _typeName === typeName)) {
        return matchFound(regexp, false);
      }
    }
    return matchFound(regexp, true);
  };

  //#endregion

  //#region `'TypeName.[fieldNames];'`

  public static buildFieldNamesOfTypeName = (typeNames: TypeNames, fieldNames: FieldNames): string => {
    typeNames = TypeName.fromTypeNames(typeNames);
    fieldNames = FieldName.fromFieldNames(fieldNames);
    return strToList(typeNames)
      .map(typeName => {
        return `${typeName}.[${fieldNames}];`;
      })
      .join('');
  };

  public static regexpForFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesFieldNamesOfTypeName = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    const regexp = TypeFieldName.regexpForFieldNamesOfTypeName;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;
    fieldName = FieldName.fromString(TypeFieldName.valueOf(fieldName)).value;

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeName = result.groups.typeName;
      const foundFieldNames = strToList(result.groups.fieldNames);

      if (foundTypeName === typeName && foundFieldNames.find(_fieldName => _fieldName === fieldName)) {
        return matchFound(regexp);
      }
    }
    return matchFound(regexp, false);
  };

  //#endregion

  //#region `'TypeName.@*FieldNames;'`

  public static buildAllFieldNamesOfTypeName = (typeNames: TypeNames): string => {
    typeNames = TypeName.fromTypeNames(typeNames);
    return strToList(typeNames)
      .map(typeName => `${typeName}.${TypeFieldName.allFieldNames};`)
      .join('');
  };

  public static regexpForAllFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim;

  static matchesAllFieldNamesOfTypeName = (pattern: string, typeName: StringOr<TypeName>) => {
    const regexp = TypeFieldName.regexpForAllFieldNamesOfTypeName;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeName = result.groups.typeName;

      if (foundTypeName === typeName) {
        return matchFound(regexp);
      }
    }
    return matchFound(regexp, false);
  };

  //#endregion

  //#region `'TypeName.@*FieldNames-[excludeFieldNames];'`

  public static buildAllFieldNamesExcludeFieldNamesOfTypeName = (
    typeNames: TypeNames,
    fieldNames: FieldNames
  ): string => {
    typeNames = TypeName.fromTypeNames(typeNames);
    fieldNames = FieldName.fromFieldNames(fieldNames);
    return strToList(typeNames)
      .map(typeName => `${typeName}.${TypeFieldName.allFieldNames}-[${fieldNames}];`)
      .join('');
  };

  public static regexpForAllFieldNamesExcludeFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesAllFieldNamesExcludeFieldNamesOfTypeName = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    const regexp = TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfTypeName;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;
    fieldName = FieldName.fromString(TypeFieldName.valueOf(fieldName)).value;

    let result: RegExpExecArray | null;
    const expandedPattern: Record<string, string[]> = {};

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeName = result.groups.typeName;
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundFieldNames.forEach(_fieldName => {
        expandedPattern['excludes'] = [...(expandedPattern['excludes'] ?? []), `${foundTypeName}.${_fieldName}`];
      });

      expandedPattern['typeNames'] = [...(expandedPattern['typeNames'] ?? []), foundTypeName];
    }
    return matchFound(
      regexp,
      !expandedPattern?.['excludes']?.includes(`${typeName}.${fieldName}`) &&
        expandedPattern?.['typeNames']?.includes(typeName)
    );
  };

  //#endregion

  //#region `'@*TypeNames.[fieldNames];'`

  public static buildFieldNamesOfAllTypeNames = (fieldNames: FieldNames): string => {
    fieldNames = FieldName.fromFieldNames(fieldNames);
    return `${TypeFieldName.allTypeNames}.[${fieldNames}];`;
  };

  public static regexpForFieldNamesOfAllTypeNames = /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesFieldNamesOfAllTypeNames = (pattern: string, fieldName: StringOr<FieldName>) => {
    const regexp = TypeFieldName.regexpForFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    fieldName = FieldName.fromString(TypeFieldName.valueOf(fieldName)).value;

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern)) !== null) {
      const foundFieldNames = strToList(result.groups.fieldNames);

      if (foundFieldNames.find(_fieldName => _fieldName === fieldName)) {
        return matchFound(regexp);
      }
    }
    return matchFound(regexp, false);
  };

  //#endregion

  //#region `'@*TypeNames.@*FieldNames;'`

  public static buildAllFieldNamesOfAllTypeNames = (): string => {
    return `${TypeFieldName.allTypeNames}.${TypeFieldName.allFieldNames};`;
  };

  public static regexpForAllFieldNamesOfAllTypeNames = /@\*TypeNames\.@\*FieldNames;/gim;

  static matchesAllFieldNamesOfAllTypeNames = (pattern: string) => {
    const regexp = TypeFieldName.regexpForAllFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);

    return matchFound(regexp, regexp.test(pattern));
  };

  //#endregion

  //#region `'@*TypeNames.@*FieldNames-[excludeFieldNames];'`

  public static buildAllFieldNamesExcludeFieldNamesOfAllTypeNames = (fieldNames: FieldNames): string => {
    fieldNames = FieldName.fromFieldNames(fieldNames);
    return `${TypeFieldName.allTypeNames}.${TypeFieldName.allFieldNames}-[${fieldNames}];`;
  };

  public static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames =
    /@\*TypeNames\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames = (pattern: string, fieldName: StringOr<FieldName>) => {
    const regexp = TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    fieldName = FieldName.fromString(TypeFieldName.valueOf(fieldName)).value;

    let result: RegExpExecArray | null;
    let expandedPattern: string[];

    while ((result = regexp.exec(pattern)) !== null) {
      const foundFieldNames = strToList(result.groups.fieldNames);
      expandedPattern = [...(expandedPattern ?? []), ...foundFieldNames];
    }

    return matchFound(regexp, !expandedPattern.includes(fieldName));
  };

  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].[fieldNames];'`

  public static buildFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeNames: TypeNames,
    fieldNames: FieldNames
  ): string => {
    typeNames = TypeName.fromTypeNames(typeNames);
    fieldNames = FieldName.fromFieldNames(fieldNames);
    return `${TypeFieldName.allTypeNames}-[${typeNames}].[${fieldNames}];`;
  };

  public static regexpForFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    const regexp = TypeFieldName.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;
    fieldName = FieldName.fromString(TypeFieldName.valueOf(fieldName)).value;

    let result: RegExpExecArray | null;
    const expandedPattern: Record<string, string[]> = {};

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundTypeNames.forEach(_typeName =>
        foundFieldNames.forEach(_fieldName => {
          expandedPattern['excludes'] = [...(expandedPattern['excludes'] ?? []), `${_typeName}.${_fieldName}`];
        })
      );

      expandedPattern['fieldNames'] = [...(expandedPattern['fieldNames'] ?? []), ...(foundFieldNames ?? [])];
    }

    return matchFound(
      regexp,
      !expandedPattern?.['excludes']?.includes(`${typeName}.${fieldName}`) &&
        expandedPattern?.['fieldNames']?.includes(fieldName)
    );
  };

  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames;'`

  public static buildAllFieldNamesOfAllTypeNamesExcludeTypeNames = (typeNames: TypeNames): string => {
    typeNames = TypeName.fromTypeNames(typeNames);
    return `${TypeFieldName.allTypeNames}-[${typeNames}].${TypeFieldName.allFieldNames};`;
  };

  public static regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim;

  static matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames = (pattern: string, typeName: StringOr<TypeName>) => {
    const regexp = TypeFieldName.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;

    let result: RegExpExecArray | null;
    let expandedPattern: string[];

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      expandedPattern = [...(expandedPattern ?? []), ...foundTypeNames];
    }

    if (!expandedPattern.includes(typeName)) {
      return matchFound(regexp);
    }
    return matchFound(regexp, false);
  };

  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames-[excludeFieldNames];'`

  public static buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeNames: TypeNames,
    fieldNames: FieldNames
  ): string => {
    typeNames = TypeName.fromTypeNames(typeNames);
    fieldNames = FieldName.fromFieldNames(fieldNames);
    return `${TypeFieldName.allTypeNames}-[${typeNames}].${TypeFieldName.allFieldNames}-[${fieldNames}];`;
  };

  public static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    const regexp = TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    pattern = TypeFieldName.valueOf(pattern);
    typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;
    fieldName = FieldName.fromString(TypeFieldName.valueOf(fieldName)).value;

    let result: RegExpExecArray | null;
    let expandedPattern: string[];

    while ((result = regexp.exec(pattern)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundTypeNames.forEach(_typeName =>
        foundFieldNames.forEach(_fieldName => {
          expandedPattern = [...(expandedPattern ?? []), `${_typeName}.${_fieldName}`];
        })
      );
    }

    return matchFound(regexp, !expandedPattern?.includes(`${typeName}.${fieldName}`));
  };
  //#endregion

  public static shouldBeConfigured = (pattern: string, typeName: TypeName, fieldName?: FieldName): boolean => {
    pattern = TypeFieldName.valueOf(pattern);

    const regexpFor = (baseName: string): RegExp => TypeFieldName[`regexpFor${baseName}`];

    const matches = (
      baseName: string,
      pattern: string,
      typeName?: StringOr<TypeName>,
      fieldName?: StringOr<FieldName>
    ): boolean => TypeFieldName[`matches${baseName}`]?.(pattern, typeName, fieldName);

    const matchList: [baseName: string, shouldInclude: boolean][] = [
      ['TypeNames', true],
      ['AllTypeNames', true], // tested
      ['AllTypeNamesExcludeTypeNames', false], //tested
      ['FieldNamesOfTypeName', true],
      ['AllFieldNamesOfTypeName', true],
      ['AllFieldNamesExcludeFieldNamesOfTypeName', false],
      ['FieldNamesOfAllTypeNames', true],
      ['AllFieldNamesOfAllTypeNames', true],
      ['AllFieldNamesExcludeFieldNamesOfAllTypeNames', false],
      ['FieldNamesOfAllTypeNamesExcludeTypeNames', false],
      ['AllFieldNamesOfAllTypeNamesExcludeTypeNames', false],
      ['AllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames', false], // tested
    ];

    let shouldConfigure: boolean;

    for (let i = 0; i < matchList.length; i++) {
      const [baseName] = matchList[i];

      if (regexpFor(baseName).test(pattern)) {
        shouldConfigure = matches(baseName, pattern, typeName, fieldName);
        break;
      }
    }
    return shouldConfigure;
  };
}

//#region helper methods
export const strToList = (str: string) => str.split(/\s*,\s*/gim).filter(s => s.length > 0);

export const resetIndex = (regexp: RegExp) => (regexp.lastIndex = 0);

export const matchFound = (regexp: RegExp, returnValue = true) => {
  resetIndex(regexp);
  return returnValue;
};

// #endregion
