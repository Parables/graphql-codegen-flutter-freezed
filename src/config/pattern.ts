import { strToList, arrayWrap, resetIndex } from '../utils';

// eslint-disable-next-line @typescript-eslint/ban-types
export function frozen(target: Function): void {
  Object.freeze(target);
  Object.freeze(target.prototype);
}

/**
 * A list of GraphQL Type Names
 */
type TypeNames = TypeName | TypeName[];

/**
 * A list of field names of a GraphQL Type
 */
type FieldNames = FieldName | FieldName[];

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
@frozen
export class TypeName {
  private _value: string;

  private constructor(value: string) {
    this._value = value;
  }
  get value(): string {
    return this._value;
  }

  static get allTypeNames(): string {
    return '@*TypeNames';
  }

  static fromString = (value: string) => {
    if (value === undefined || value.length < 1) {
      throw new Error('TypeName is the name of a GraphQL Type and it cannot be empty');
    } else if (/([^a-zA-Z0-9_])/gim.test(value)) {
      throw new Error('TypeName is the name of a GraphQL Type and it must consist of only AlphaNumeric characters');
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
@frozen
export class FieldName {
  private _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static get allFieldNames(): string {
    return '@*FieldNames';
  }

  static fromString = (value: string) => {
    if (value === undefined || value.length < 1) {
      throw new Error('FieldName is the name of a field in a GraphQL Type and it cannot be empty');
    } else if (/([^a-zA-Z0-9_])/gim.test(value)) {
      throw new Error(
        'FieldName is the name of a field in a GraphQL Type and it must consist of only AlphaNumeric characters'
      );
    }
    return new FieldName(value.trim());
  };
}

@frozen
export class Pattern {
  private _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  private static fromString = (value: string) => {
    if (value === undefined || value.length < 1) {
      throw new Error('Pattern cannot be created from an empty string');
    }

    return new Pattern(value.endsWith(';') ? value : `${value};`);
  };

  //#region `'TypeName;AnotherTypeName;'`
  static forTypeNames = (typeNames: TypeNames): Pattern => {
    typeNames = arrayWrap(typeNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were specified');
    }

    return Pattern.fromString(
      arrayWrap(typeNames)
        .map(typeName => `${typeName.value};`)
        .join('')
    );
  };

  static regexpForTypeNames = /\b(?!TypeNames|FieldNames\b)(?<typeName>\w+;)/gim; // TODO: fix this: regexp.test('@*TypeName;') returns true which shouldn't happen

  static matchAndConfigureTypeNames = (pattern: Pattern, typeName: TypeName) => {
    const regexp = Pattern.regexpForTypeNames;
    resetIndex(regexp);

    const typeNamePattern = Pattern.fromString(typeName.value);

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNamePattern = result.groups.typeName;

      if (foundTypeNamePattern === typeNamePattern.value) {
        return Pattern.resetMatchAndConfigure(regexp, true, true);
      }
    }
    return Pattern.resetMatchAndConfigure(regexp, false, false);
  };
  //#endregion

  //#region `'@*TypeNames;'`
  static forAllTypeNames = (): Pattern => Pattern.fromString(TypeName.allTypeNames);

  static regexpForAllTypeNames = /(?<allTypeNames>@\*TypeNames;)/gim;

  static matchAndConfigureAllTypeNames = (pattern: Pattern) => {
    const regexp = Pattern.regexpForAllTypeNames;
    resetIndex(regexp);

    if (regexp.test(pattern.value)) {
      resetIndex(regexp);
      return Pattern.resetMatchAndConfigure(regexp, true, true);
    }
    return Pattern.resetMatchAndConfigure(regexp, false, false);
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames];'`
  static forAllTypeNamesExcludeTypeNames = (typeNames: TypeNames): Pattern => {
    typeNames = arrayWrap(typeNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();

    return Pattern.fromString(`${TypeName.allTypeNames}-[${_typeNames}];`);
  };

  static regexpForAllTypeNamesExcludeTypeNames = /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllTypeNamesExcludeTypeNames = (pattern: Pattern, typeName: TypeName) => {
    const regexp = Pattern.regexpForAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);

      if (foundTypeNames.find(_typeName => _typeName === typeName.value)) {
        return Pattern.resetMatchAndConfigure(regexp, true, false);
      }
    }
    return Pattern.resetMatchAndConfigure(regexp, false, true);
  };
  //#endregion

  //#region `'TypeName.[fieldNames];'`
  static forFieldNamesOfTypeName = (data: [typeNames: TypeNames, fieldNames: FieldNames][]): Pattern => {
    const expandedPattern: Record<string, FieldName[]> = {};

    if (data.length < 1) {
      throw new Error('Pattern cannot be created... an empty array was passed as parameter');
    }

    data.forEach(([typeNames, fieldNames]) => {
      const _typeNames = arrayWrap(typeNames);
      const _fieldNames = arrayWrap(fieldNames);

      if (_typeNames.length < 1) {
        throw new Error('Pattern cannot be created... No TypeNames were specified');
      } else if (_fieldNames.length < 1) {
        throw new Error('Pattern cannot be created... No FieldNames were specified');
      }

      _typeNames.forEach(typeName => {
        expandedPattern[typeName.value] = [...(expandedPattern[typeName.value] ?? []), ..._fieldNames];
      });
    });

    return Pattern.fromString(
      Object.keys(expandedPattern)
        .map(_typeName => {
          const _fieldNames = expandedPattern[_typeName].map(fieldName => fieldName.value).join();
          return `${_typeName}.[${_fieldNames}];`;
        })
        .join('')
    );
  };

  static regexpForFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfTypeName = (pattern: Pattern, typeName: TypeName, fieldName: FieldName) => {
    const regexp = Pattern.regexpForFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeName = result.groups.typeName;
      const foundFieldNames = strToList(result.groups.fieldNames);

      if (foundTypeName === typeName.value && foundFieldNames.find(_fieldName => _fieldName === fieldName.value)) {
        return Pattern.resetMatchAndConfigure(regexp, true, true);
      }
    }
    return Pattern.resetMatchAndConfigure(regexp, false, false);
  };
  //#endregion

  //#region `'TypeName.@*FieldNames;'`
  static forAllFieldNamesOfTypeName = (typeNames: TypeNames): Pattern => {
    const _typeNames = arrayWrap(typeNames);

    if (_typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were specified');
    }

    return Pattern.fromString(_typeNames.map(_typeName => `${_typeName.value}.${FieldName.allFieldNames};`).join(''));
  };

  static regexpForAllFieldNamesOfTypeName = /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfTypeName = (pattern: Pattern, typeName: TypeName) => {
    const regexp = Pattern.regexpForAllFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    let expandedPattern: string[];

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeName = result.groups.typeName;
      expandedPattern = [...(expandedPattern ?? []), foundTypeName];
    }
    const matchFound = expandedPattern.includes(typeName.value);
    return Pattern.resetMatchAndConfigure(regexp, matchFound, matchFound);
  };
  //#endregion

  //#region `'TypeName.@*FieldNames-[excludeFieldNames];'`
  static forAllFieldNamesExcludeFieldNamesOfTypeName = (
    data: [typeNames: TypeNames, fieldNames: FieldNames][]
  ): Pattern => {
    const expandedPattern: Record<string, FieldName[]> = {};

    if (data.length < 1) {
      throw new Error('Pattern cannot be created... an empty array was passed as parameter');
    }

    data.forEach(([typeNames, fieldNames]) => {
      const _typeNames = arrayWrap(typeNames);
      const _fieldNames = arrayWrap(fieldNames);

      if (_typeNames.length < 1) {
        throw new Error('Pattern cannot be created... No TypeNames were specified');
      } else if (_fieldNames.length < 1) {
        throw new Error('Pattern cannot be created... No FieldNames were specified');
      }

      _typeNames.forEach(typeName => {
        expandedPattern[typeName.value] = [...(expandedPattern[typeName.value] ?? []), ..._fieldNames];
      });
    });

    return Pattern.fromString(
      Object.keys(expandedPattern)
        .map(_typeName => {
          const _fieldNames = expandedPattern[_typeName].map(fieldName => fieldName.value).join();
          return `${_typeName}.${FieldName.allFieldNames}-[${_fieldNames}];`;
        })
        .join('')
    );
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName = (
    pattern: Pattern,
    typeName: TypeName,
    fieldName: FieldName
  ) => {
    const regexp = Pattern.regexpForAllFieldNamesExcludeFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const expandedPattern: Record<string, string[]> = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeName = result.groups.typeName;
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundFieldNames.forEach(_fieldName => {
        expandedPattern['excludes'] = [...(expandedPattern['excludes'] ?? []), `${foundTypeName}.${_fieldName}`];
      });

      expandedPattern['typeNames'] = [...(expandedPattern['typeNames'] ?? []), foundTypeName];
    }

    const matchFound = expandedPattern['excludes'].includes(`${typeName.value}.${fieldName.value}`);

    const shouldConfigure = expandedPattern['typeNames'].includes(typeName.value) && !matchFound;

    return Pattern.resetMatchAndConfigure(regexp, matchFound, shouldConfigure);
  };
  //#endregion

  //#region `'@*TypeNames.[fieldNames];'`
  static forFieldNamesOfAllTypeNames = (fieldNames: FieldNames): Pattern => {
    fieldNames = arrayWrap(fieldNames);

    if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were specified');
    }

    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return Pattern.fromString(`${TypeName.allTypeNames}.[${_fieldNames}];`);
  };

  static regexpForFieldNamesOfAllTypeNames = /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfAllTypeNames = (pattern: Pattern, fieldName: FieldName) => {
    const regexp = Pattern.regexpForFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundFieldNames = strToList(result.groups.fieldNames);

      if (foundFieldNames.find(_fieldName => _fieldName === fieldName.value)) {
        return Pattern.resetMatchAndConfigure(regexp, true, true);
      }
    }
    return Pattern.resetMatchAndConfigure(regexp, false, false);
  };
  //#endregion

  //#region `'@*TypeNames.@*FieldNames;'`
  static forAllFieldNamesOfAllTypeNames = (): Pattern => {
    return Pattern.fromString(`${TypeName.allTypeNames}.${FieldName.allFieldNames};`);
  };

  static regexpForAllFieldNamesOfAllTypeNames = /@\*TypeNames\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfAllTypeNames = (pattern: Pattern) => {
    const regexp = Pattern.regexpForAllFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    const matchFound = regexp.test(pattern.value);
    return Pattern.resetMatchAndConfigure(regexp, matchFound, matchFound);
  };
  //#endregion

  //#region `'@*TypeNames.@*FieldNames-[excludeFieldNames];'`
  static forAllFieldNamesExcludeFieldNamesOfAllTypeNames = (fieldNames: FieldNames): Pattern => {
    fieldNames = arrayWrap(fieldNames);

    if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were excluded');
    }

    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return Pattern.fromString(`${TypeName.allTypeNames}.${FieldName.allFieldNames}-[${_fieldNames}];`);
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames =
    /@\*TypeNames\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames = (pattern: Pattern, fieldName: FieldName) => {
    const regexp = Pattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    let expandedPattern: string[];

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundFieldNames = strToList(result.groups.fieldNames);
      expandedPattern = [...(expandedPattern ?? []), ...foundFieldNames];
    }

    const matchFound = expandedPattern.includes(fieldName.value);
    return Pattern.resetMatchAndConfigure(regexp, matchFound, !matchFound);
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].[fieldNames];'`
  static forFieldNamesOfAllTypeNamesExcludeTypeNames = (typeNames: TypeNames, fieldNames: FieldNames): Pattern => {
    typeNames = arrayWrap(typeNames);
    fieldNames = arrayWrap(fieldNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    } else if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were specified');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();
    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return Pattern.fromString(`${TypeName.allTypeNames}-[${_typeNames}].[${_fieldNames}];`);
  };

  static regexpForFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: Pattern,
    typeName: TypeName,
    fieldName: FieldName
  ) => {
    const regexp = Pattern.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const expandedPattern: Record<string, string[]> = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundTypeNames.forEach(_typeName =>
        foundFieldNames.forEach(_fieldName => {
          expandedPattern['excludes'] = [...(expandedPattern['excludes'] ?? []), `${_typeName}.${_fieldName}`];
        })
      );

      expandedPattern['fieldNames'] = [...(expandedPattern['fieldNames'] ?? []), ...(foundFieldNames ?? [])];
    }

    const matchFound = expandedPattern?.['excludes'].includes(`${typeName.value}.${fieldName.value}`);
    const shouldConfigure = expandedPattern?.['fieldNames'].includes(fieldName.value) && !matchFound;

    return Pattern.resetMatchAndConfigure(regexp, matchFound, shouldConfigure);
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames;'`
  static forAllFieldNamesOfAllTypeNamesExcludeTypeNames = (typeNames: TypeNames): Pattern => {
    typeNames = arrayWrap(typeNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();

    return Pattern.fromString(`${TypeName.allTypeNames}-[${_typeNames}].${FieldName.allFieldNames};`);
  };

  static regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames = (pattern: Pattern, typeName: TypeName) => {
    const regexp = Pattern.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    let expandedPattern: string[];

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      expandedPattern = [...(expandedPattern ?? []), ...foundTypeNames];
    }

    const matchFound = expandedPattern.includes(typeName.value);
    return Pattern.resetMatchAndConfigure(regexp, matchFound, !matchFound);
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames-[excludeFieldNames];'`
  static forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeNames: TypeNames,
    fieldNames: FieldNames
  ): Pattern => {
    typeNames = arrayWrap(typeNames);
    fieldNames = arrayWrap(fieldNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    } else if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were excluded');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();
    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return Pattern.fromString(`${TypeName.allTypeNames}-[${_typeNames}].${FieldName.allFieldNames}-[${_fieldNames}];`);
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: Pattern,
    typeName: TypeName,
    fieldName: FieldName
  ) => {
    const regexp = Pattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    let expandedPattern: string[];

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundTypeNames.forEach(_typeName =>
        foundFieldNames.forEach(_fieldName => {
          expandedPattern = [...(expandedPattern ?? []), `${_typeName}.${_fieldName}`];
        })
      );
    }
    const matchFound = expandedPattern.includes(`${typeName.value}.${fieldName.value}`);

    return Pattern.resetMatchAndConfigure(regexp, matchFound, !matchFound);
  };
  //#endregion

  // #region attemptMatchAndConfigure
  static attemptMatchAndConfigure = (pattern: Pattern, ...typeNameOrFieldName: (TypeName | FieldName)[]) => {
    if (pattern.value.split(';').filter(_pattern => _pattern.length > 0).length !== 1) {
      throw new Error(
        'attemptMatchAndConfigure can only handle one pattern at a time... use the `splitPatterns(...)` helper function to split your patterns into a list and loop over the list calling the `attemptMatchAndConfigure(...)`  for each single pattern'
      );
    }

    const regexpFor = (baseName: string): RegExp => Pattern[`regexpFor${baseName}`];

    const matchAndConfigure = (
      baseName: string,
      pattern: Pattern,
      ...typeNameOrFieldName: (TypeName | FieldName)[]
    ): { matchFound: boolean; shouldBeConfigured: boolean } | undefined =>
      Pattern[`matchAndConfigure${baseName}`](pattern, ...typeNameOrFieldName);

    const matchList: string[] = Pattern.getMatchList();
    for (let i = 0; i < matchList.length; i++) {
      const baseName = matchList[i];

      if (regexpFor(baseName).test(pattern.value)) {
        console.log(baseName, pattern);
        return matchAndConfigure(baseName, pattern, ...typeNameOrFieldName);
      }
    }
    return undefined;
  };
  //#endregion

  //#region helper methods
  static getMatchList = () =>
    Object.getOwnPropertyNames(Pattern)
      .filter(property => Pattern[property] instanceof RegExp)
      .map(regexpForName => regexpForName.slice(9))
      .reverse(); // runs more specific patterns first(in asc order)

  static resetMatchAndConfigure = (regexp: RegExp, matchFound: boolean, shouldBeConfigured: boolean) => {
    resetIndex(regexp);
    return { matchFound, shouldBeConfigured };
  };
  //#endregion
}
