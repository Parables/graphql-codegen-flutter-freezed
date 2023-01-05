import { arrayWrap, resetIndex, strToList } from '../utils';

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

  static fromAllTypeNames = (): TypeName => new TypeName(TypeName.allTypeNames);

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

  static fromAllFieldNames = (): FieldName => new FieldName(FieldName.allFieldNames);

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

/**
 *  @name Pattern
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
 * const Droid = TypeName.fromString('Droid');
 * const Starship = TypeName.fromString('Starship');
 * const Human = TypeName.fromString('Human');
 * const Movie = TypeName.fromString('Movie');
 *
 * const id = FieldName.fromString('id');
 * const name = FieldName.fromString('name');
 * const friends = FieldName.fromString('friends');
 * const friend = FieldName.fromString('friend');
 * const title = FieldName.fromString('title');
 * const episode = FieldName.fromString('episode');
 * const length = FieldName.fromString('length');
 *
 * // Configuring specific Graphql Types
 * const pattern = Pattern.forTypeNames([Droid, Starship]);
 * console.log(pattern); // "Droid;Starship;"
 *
 * // Configuring all Graphql Types
 * const pattern = Pattern.forAllTypeNames();
 * console.log(pattern); // "@*TypeNames;"
 
 * // Configuring all Graphql Types except those specified in the exclusion list of TypeNames
 * const pattern = Pattern.forAllTypeNamesExcludeTypeNames([Droid, Starship]);
 * console.log(pattern); // "@*TypeNames-[Droid,Starship];"
 *
 * // Configuring specific fields of a specific Graphql Type
 * const pattern = Pattern.forFieldNamesOfTypeName([
 *   [Droid, [id, name, friends]], // individual
 *   [Human, [id, name, title]], // individual
 *   [Starship, [name, length]], // individual
 * ]);
 * console.log(pattern); // "Droid.[id,name,friends];Human.[id,name,title];Starship.[name,length];"
 *
 * // Configuring all fields of a specific Graphql Type
 * const pattern = Pattern.forAllFieldNamesOfTypeName([Droid, Movie]);
 * console.log(pattern); // "Droid.@*FieldNames;Movie.@*FieldNames;"
 *
 * // Configuring all fields except those specified in the exclusion list of FieldNames for a specific GraphQL Type
 * const pattern = Pattern.forAllFieldNamesExcludeFieldNamesOfTypeName([
 *   [Droid, [id, name, friends]], // individual
 *   [Human, [id, name, title]], // individual
 *   [Starship, [name, length]], // individual
 * ]);
 * console.log(pattern); // "Droid.@*FieldNames-[id,name,friends];Human.@*FieldNames-[id,name,title];Starship.@*FieldNames-[name,length];"
 *
 * // Configuring specific fields of all Graphql Types
 * const pattern = Pattern.forFieldNamesOfAllTypeNames([id, name, friends]);
 * console.log(pattern); // "@*TypeNames.[id,name,friends];"
 *
 * // Configuring all fields of all Graphql Types
 * const pattern = Pattern.forAllFieldNamesOfAllTypeNames();
 * console.log(pattern); // "@*TypeNames.@*FieldNames;"
 *
 * // Configuring all fields except those specified in the exclusion list of FieldNames for all GraphQL Types
 * const pattern = Pattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames([id, name, friends]);
 * console.log(pattern); // "@*TypeNames.@*FieldNames-[id,name,friends];"
 *
 * // Configuring specific fields of all GraphQL Types except those specified in the exclusion list of TypeNames
 * const pattern = Pattern.forFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human], [id, name, friends]);
 * console.log(pattern); // "@*TypeNames-[Droid,Human].[id,name,friends];"
 *
 * // Configuring all fields of all GraphQL Types except those specified in the exclusion list of TypeNames
 * const pattern = Pattern.forAllFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human]);
 * console.log(pattern); // "@*TypeNames-[Droid,Human].@*FieldNames;"
 *
 * // Configuring all fields except those specified in the exclusion list of FieldNames of all GraphQL Types except those specified in the exclusion list of TypeNames
 * const pattern = Pattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(
 *   [Droid, Human],
 *   [id, name, friends]
 * );
 * console.log(pattern); // "@*TypeNames-[Droid,Human].@*FieldNames-[id,name,friends];"
 * ```
 *
 */

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

  static matchAndConfigureTypeNames = (pattern: Pattern, typeName: TypeName): MatchAndConfigure => {
    const regexp = Pattern.regexpForTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeName = result.groups.typeName.replace(';', '');

      const key = _typeName;
      const matchFound = _typeName === typeName.value;
      const shouldBeConfigured = matchFound;

      matchAndConfigure[key] = { matchFound, shouldBeConfigured };
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames;'`
  static forAllTypeNames = (): Pattern => Pattern.fromString(TypeName.allTypeNames);

  static regexpForAllTypeNames = /(?<allTypeNames>@\*TypeNames;)/gim;

  static matchAndConfigureAllTypeNames = (pattern: Pattern): MatchAndConfigure => {
    const regexp = Pattern.regexpForAllTypeNames;
    resetIndex(regexp);

    const matchAndConfigure: MatchAndConfigure = {};

    const key = TypeName.fromAllTypeNames().value;
    const matchFound = regexp.test(pattern.value);
    const shouldBeConfigured = matchFound;

    matchAndConfigure[key] = { matchFound, shouldBeConfigured };

    resetIndex(regexp);
    return matchAndConfigure;
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

  static matchAndConfigureAllTypeNamesExcludeTypeNames = (pattern: Pattern, typeName: TypeName): MatchAndConfigure => {
    const regexp = Pattern.regexpForAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);

      foundTypeNames.forEach(_typeName => {
        const key = _typeName;
        const matchFound = _typeName === typeName.value;
        const shouldBeConfigured = false;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
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

  static matchAndConfigureFieldNamesOfTypeName = (
    pattern: Pattern,
    typeName: TypeName,
    fieldName: FieldName
  ): MatchAndConfigure => {
    const regexp = Pattern.regexpForFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeName = result.groups.typeName;
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundFieldNames.forEach(_fieldName => {
        const key = `${foundTypeName}.${_fieldName}`;
        const matchFound = key === `${typeName.value}.${fieldName.value}`;
        const shouldBeConfigured = matchFound;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
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

  static matchAndConfigureAllFieldNamesOfTypeName = (pattern: Pattern, typeName: TypeName): MatchAndConfigure => {
    const regexp = Pattern.regexpForAllFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeName = result.groups.typeName;
      const key = `${foundTypeName}.${FieldName.fromAllFieldNames().value}`;
      const matchFound = foundTypeName === typeName.value;
      const shouldBeConfigured = matchFound;

      matchAndConfigure[key] = { matchFound, shouldBeConfigured };
    }

    resetIndex(regexp);
    return matchAndConfigure;
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
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeName = result.groups.typeName;
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundFieldNames.forEach(_fieldName => {
        const key = `${foundTypeName}.${_fieldName}`;
        const matchFound = key === `${typeName.value}.${fieldName.value}`;
        const shouldBeConfigured = !matchFound;
        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }
    resetIndex(regexp);
    return matchAndConfigure;
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

  static matchAndConfigureFieldNamesOfAllTypeNames = (pattern: Pattern, fieldName: FieldName): MatchAndConfigure => {
    const regexp = Pattern.regexpForFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundFieldNames.forEach(_fieldName => {
        const key = `${TypeName.fromAllTypeNames().value}.${_fieldName}`;
        const matchFound = _fieldName === fieldName.value;
        const shouldBeConfigured = matchFound;
        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames.@*FieldNames;'`
  static forAllFieldNamesOfAllTypeNames = (): Pattern => {
    return Pattern.fromString(`${TypeName.allTypeNames}.${FieldName.allFieldNames};`);
  };

  static regexpForAllFieldNamesOfAllTypeNames = /@\*TypeNames\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfAllTypeNames = (pattern: Pattern): MatchAndConfigure => {
    const regexp = Pattern.regexpForAllFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    const matchAndConfigure: MatchAndConfigure = {};

    const key = `${TypeName.fromAllTypeNames().value}.${FieldName.fromAllFieldNames().value}`;
    const matchFound = regexp.test(pattern.value);
    const shouldBeConfigured = matchFound;

    matchAndConfigure[key] = { matchFound, shouldBeConfigured };

    resetIndex(regexp);
    return matchAndConfigure;
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
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundFieldNames.forEach(_fieldName => {
        const key = `${TypeName.fromAllTypeNames().value}.${_fieldName}`;
        const matchFound = _fieldName === fieldName.value;
        const shouldBeConfigured = !matchFound;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
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
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundTypeNames.forEach(_typeName =>
        foundFieldNames.forEach(_fieldName => {
          const key = `${_typeName}.${_fieldName}`;
          const matchFound = key === `${typeName.value}.${fieldName.value}`;
          const shouldBeConfigured = foundFieldNames.includes(fieldName.value) && !matchFound;

          matchAndConfigure[key] = { matchFound, shouldBeConfigured };
        })
      );
    }

    resetIndex(regexp);
    return matchAndConfigure;
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
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);

      foundTypeNames.forEach(_typeName => {
        const key = `${_typeName}.${FieldName.fromAllFieldNames().value}`;
        const matchFound = _typeName === typeName.value;
        const shouldBeConfigured = !matchFound;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
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
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const foundTypeNames = strToList(result.groups.typeNames);
      const foundFieldNames = strToList(result.groups.fieldNames);

      foundTypeNames.forEach(_typeName =>
        foundFieldNames.forEach(_fieldName => {
          const key = `${_typeName}.${_fieldName}`;
          const matchFound = key === `${typeName.value}.${fieldName.value}`;
          const shouldBeConfigured = !matchFound;

          matchAndConfigure[key] = { matchFound, shouldBeConfigured };
        })
      );
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  // #region attemptMatchAndConfigure
  static attemptMatchAndConfigure = (pattern: Pattern, typeName: TypeName, fieldName?: FieldName) => {
    if (pattern.value.split(';').filter(_pattern => _pattern.length > 0).length !== 1) {
      throw new Error(
        'attemptMatchAndConfigure can only handle one pattern at a time... use the `splitPatterns(...)` helper function to split your patterns into a list and loop over the list calling the `attemptMatchAndConfigure(...)`  for each single pattern'
      );
    }

    const regexpFor = (baseName: string): RegExp => Pattern[`regexpFor${baseName}`];

    const matchAndConfigure = (
      baseName: string,
      pattern: Pattern,
      ...args: (TypeName | FieldName)[]
    ): MatchAndConfigure | undefined => Pattern[`matchAndConfigure${baseName}`](pattern, ...args);

    const matchList: string[] = Pattern.getMatchList();
    for (let i = 0; i < matchList.length; i++) {
      const baseName = matchList[i];

      if (regexpFor(baseName).test(pattern.value)) {
        if (baseName === 'AllTypeNames' || baseName === 'AllFieldNamesOfAllTypeNames') {
          const result = matchAndConfigure(baseName, pattern);

          // interpret the result for global patterns
          if (baseName === 'AllTypeNames' || baseName === 'AllFieldNamesOfAllTypeNames') {
            return Pattern.interpretGlobalPatters(baseName, { ...result }, typeName, fieldName);
          }

          return result;
        } else if (
          typeName &&
          (baseName === 'TypeNames' ||
            baseName === 'AllTypeNamesExcludeTypeNames' ||
            baseName === 'AllFieldNamesOfTypeName' ||
            baseName === 'AllFieldNamesOfAllTypeNamesExcludeTypeNames')
        ) {
          const result = matchAndConfigure(baseName, pattern, typeName);

          // interpret the result for global patterns
          if (baseName === 'AllFieldNamesOfTypeName' || baseName === 'AllFieldNamesOfAllTypeNamesExcludeTypeNames') {
            return Pattern.interpretGlobalPatters(baseName, { ...result }, typeName, fieldName);
          }

          return result;
        } else if (
          fieldName &&
          (baseName === 'FieldNamesOfAllTypeNames' || baseName === 'AllFieldNamesExcludeFieldNamesOfAllTypeNames')
        ) {
          const result = matchAndConfigure(baseName, pattern, fieldName);

          // interpret the result for global patterns
          if (baseName === 'FieldNamesOfAllTypeNames' || baseName === 'AllFieldNamesExcludeFieldNamesOfAllTypeNames') {
            return Pattern.interpretGlobalPatters(baseName, { ...result }, typeName, fieldName);
          }

          return result;
        } else if (typeName && fieldName) {
          return matchAndConfigure(baseName, pattern, typeName, fieldName);
        }
      }
    }

    return undefined;
  };
  //#endregion

  static interpretGlobalPatters = (
    baseName: string,
    result: MatchAndConfigure,
    typeName: TypeName,
    fieldName?: FieldName
  ): MatchAndConfigure => {
    // interpret the result for global patterns
    if (baseName === 'AllTypeNames') {
      const key = typeName.value;
      const globalKey = TypeName.fromAllTypeNames().value;
      result[key] = result[globalKey];
    } else if (baseName === 'AllFieldNamesOfAllTypeNames') {
      const key = `${typeName.value}.${fieldName.value}`;
      const globalKey = `${TypeName.fromAllTypeNames().value}.${FieldName.fromAllFieldNames().value}`;
      result[key] = result[globalKey];
    } else if (baseName === 'AllFieldNamesOfTypeName' || baseName === 'AllFieldNamesOfAllTypeNamesExcludeTypeNames') {
      const key = `${typeName.value}.${fieldName.value}`;
      const globalKey = `${typeName.value}.${FieldName.fromAllFieldNames().value}`;
      result[key] = result[globalKey];
    } else if (baseName === 'FieldNamesOfAllTypeNames' || baseName === 'AllFieldNamesExcludeFieldNamesOfAllTypeNames') {
      const key = `${typeName.value}.${fieldName.value}`;
      const globalKey = `${TypeName.fromAllTypeNames().value}.${fieldName.value}`;
      result[key] = result[globalKey];
    }

    return result;
  };

  //#region composePatterns
  static compose = (data: Pattern[]): Pattern => {
    if (data.length < 1) {
      throw new Error('Pattern cannot be created... an empty array was passed as parameter');
    }

    return Pattern.fromString(data.map(pattern => pattern.value).join(''));
  };
  //#endregion

  //#region split
  static split = (pattern: Pattern): Pattern[] => {
    return pattern.value
      .split(';')
      .filter(_pattern => _pattern.length > 0)
      .map(_pattern => Pattern.fromString(_pattern));
  };
  //#endregion

  //#region helper methods
  static getMatchList = () =>
    Object.getOwnPropertyNames(Pattern)
      .filter(property => Pattern[property] instanceof RegExp)
      .map(regexpForName => regexpForName.slice(9))
      .reverse(); // runs more specific patterns first(in asc order)

  //#endregion
}

export type MatchAndConfigure = Record<string, { matchFound: boolean; shouldBeConfigured: boolean }>;

// type MatchAndConfigure =
//   | 'matchAndConfigureTypeNames'
//   | 'matchAndConfigureAllTypeNames'
//   | 'matchAndConfigureAllTypeNamesExcludeTypeNames'
//   | 'matchAndConfigureFieldNamesOfTypeName'
//   | 'matchAndConfigureAllFieldNamesOfTypeName'
//   | 'matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName'
//   | 'matchAndConfigureFieldNamesOfAllTypeNames'
//   | 'matchAndConfigureAllFieldNamesOfAllTypeNames'
//   | 'matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames'
//   | 'matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames'
//   | 'matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames'
//   | 'matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames';
