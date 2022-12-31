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

  get value(): string {
    return this._value;
  }

  static get allTypeNames(): string {
    return '@*TypeNames';
  }

  static get allFieldNames(): string {
    return '@*FieldNames';
  }

  static valueOf = (value: StringOr<string[] | GraphqlTypeFieldName | GraphqlTypeFieldName[]>) => {
    try {
      if (Array.isArray(value)) {
        return value
          ?.map((v: StringOr<GraphqlTypeFieldName>) => {
            if (v instanceof GraphqlTypeFieldName) {
              return GraphqlTypeFieldName.fromStringOrArray(v.value);
            }
            return GraphqlTypeFieldName.fromStringOrArray(v);
          })
          .join();
      }
      return (
        (value instanceof GraphqlTypeFieldName
          ? GraphqlTypeFieldName.fromStringOrArray(value.value)
          : GraphqlTypeFieldName.fromStringOrArray(value)) ?? ''
      );
    } catch (error) {
      throw new Error(error);
    }
  };

  static fromStringOrArray = (value: StringOr<string[]>) => {
    try {
      return typeof value === 'string'
        ? GraphqlTypeFieldName.trimNameList(value)
        : value?.map(field => GraphqlTypeFieldName.trimNameList(field)).join() ?? '';
    } catch (error) {
      throw new Error(error);
    }
  };

  static trimNameList = (name: string) => {
    try {
      if (name === undefined || name.length < 1) {
        // throw new Error('Name cannot be empty');
        return '';
      }
      return name
        .split(/\s*,\s*/gim)
        .map(n => n.trim())
        .filter(type => type.length > 0)
        .join();
    } catch (error) {
      throw new Error(error);
    }
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
// @frozen
export class TypeName extends GraphqlTypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  static fromString = (value: string) => {
    try {
      if (value.length < 1) {
        throw new Error('TypeName requires a GraphQL Type name');
      } else if (value.includes(',') || value.includes(';')) {
        throw new Error('TypeName cannot contain multiple GraphQL Type names');
      }
      return new TypeName(value.trim());
    } catch (error) {
      throw new Error(error);
    }
  };

  static fromTypeNames = (typeNames: TypeNames) => {
    try {
      return strToList(TypeName.valueOf(typeNames).replace(/\s*,|;\s*/gm, ','))
        .map(value => TypeName.fromString(value).value)
        .join();
    } catch (error) {
      throw new Error(error);
    }
  };

  static toPattern = (value: StringOr<TypeName>) => {
    try {
      return new TypeName(TypeName.valueOf(value)).value + ';';
    } catch (error) {
      throw new Error(error);
    }
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
// @frozen
export class FieldName extends GraphqlTypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  static fromString = (value: string) => {
    try {
      if (value.length < 1) {
        throw new Error('FieldName requires a name of a field in GraphQL Type');
      } else if (value.includes(',') || value.includes(';')) {
        throw new Error('FieldName cannot contain multiple GraphQL Field names');
      }
      return new FieldName(value.trim());
    } catch (error) {
      throw new Error(error);
    }
  };

  static fromFieldNames = (fieldNames: FieldNames) => {
    try {
      return strToList(FieldName.valueOf(fieldNames).replace(/\s*,|;\s*/gm, ','))
        .map(value => FieldName.fromString(value).value)
        .join();
    } catch (error) {
      throw new Error(error);
    }
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
  static buildTypeNames = (typeNames: TypeNames) => {
    try {
      typeNames = TypeName.fromTypeNames(typeNames).replace(/\s*,|;\s*/gm, ';');
      return typeNames.endsWith(';') ? typeNames : typeNames + ';';
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForTypeNames = /\b(?!TypeNames|FieldNames\b)(?<typeName>\w+;)/gim;

  static matchAndConfigureTypeNames = (pattern: string, typeName: StringOr<TypeName>) => {
    try {
      const regexp = TypeFieldName.regexpForTypeNames;
      resetIndex(regexp);

      pattern = TypeFieldName.valueOf(pattern);
      typeName = TypeName.toPattern(typeName);

      let result: RegExpExecArray | null;

      while ((result = regexp.exec(pattern)) !== null) {
        const foundTypeName = result.groups.typeName;

        if (foundTypeName === typeName) {
          return resetMatchAndConfigure(regexp, true, true);
        }
      }
      return resetMatchAndConfigure(regexp, false, false);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames;'`
  static buildAllTypeNames = () => {
    return `${TypeFieldName.allTypeNames};`;
  };

  static regexpForAllTypeNames = /(?<allTypeNames>@\*TypeNames;)/gim;

  static matchAndConfigureAllTypeNames = (pattern: string) => {
    try {
      const regexp = TypeFieldName.regexpForAllTypeNames;
      resetIndex(regexp);

      pattern = TypeFieldName.valueOf(pattern);

      if (regexp.test(pattern)) {
        resetIndex(regexp);
        return resetMatchAndConfigure(regexp, true, true);
      }
      return resetMatchAndConfigure(regexp, false, false);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames];'`
  static buildAllTypeNamesExcludeTypeNames = (typeNames: TypeNames): string => {
    try {
      typeNames = TypeName.fromTypeNames(typeNames);
      return `${TypeFieldName.allTypeNames}-[${typeNames}];`;
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForAllTypeNamesExcludeTypeNames = /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllTypeNamesExcludeTypeNames = (pattern: string, typeName: StringOr<TypeName>) => {
    try {
      const regexp = TypeFieldName.regexpForAllTypeNamesExcludeTypeNames;
      resetIndex(regexp);

      pattern = TypeFieldName.valueOf(pattern);
      typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;

      let result: RegExpExecArray | null;

      while ((result = regexp.exec(pattern)) !== null) {
        const foundTypeNames = strToList(result.groups.typeNames);

        if (foundTypeNames.find(_typeName => _typeName === typeName)) {
          return resetMatchAndConfigure(regexp, true, false);
        }
      }
      return resetMatchAndConfigure(regexp, false, true);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'TypeName.[fieldNames];'`
  static buildFieldNamesOfTypeName = (
    typeFieldNames: (
      | [typeName: StringOr<TypeName>, fieldNames: FieldNames]
      | [typeNames: TypeNames, fieldNames: FieldNames]
    )[]
  ): string => {
    try {
      const expandedPattern: Record<string, string[]> = {};

      typeFieldNames.forEach(([typeNames, fieldNames]) => {
        typeNames = strToList(TypeName.fromTypeNames(typeNames));

        typeNames.forEach(typeName => {
          expandedPattern[typeName] = [...(expandedPattern[typeName] ?? []), FieldName.fromFieldNames(fieldNames)];
        });
      });

      return Object.keys(expandedPattern)
        .map(typeName => {
          const fieldNames = FieldName.fromFieldNames(expandedPattern[typeName]);
          return `${typeName}.[${fieldNames}];`;
        })
        .join('');
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfTypeName = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    try {
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
          return resetMatchAndConfigure(regexp, true, true);
        }
      }
      return resetMatchAndConfigure(regexp, false, false);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'TypeName.@*FieldNames;'`
  static buildAllFieldNamesOfTypeName = (typeNames: TypeNames): string => {
    try {
      typeNames = TypeName.fromTypeNames(typeNames);
      return strToList(typeNames)
        .map(typeName => `${typeName}.${TypeFieldName.allFieldNames};`)
        .join('');
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForAllFieldNamesOfTypeName = /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfTypeName = (pattern: string, typeName: StringOr<TypeName>) => {
    try {
      const regexp = TypeFieldName.regexpForAllFieldNamesOfTypeName;
      resetIndex(regexp);

      pattern = TypeFieldName.valueOf(pattern);
      typeName = TypeName.fromString(TypeFieldName.valueOf(typeName)).value;

      let result: RegExpExecArray | null;
      let expandedPattern: string[];

      while ((result = regexp.exec(pattern)) !== null) {
        const foundTypeName = result.groups.typeName;
        expandedPattern = [...(expandedPattern ?? []), foundTypeName];
      }
      const matchFound = expandedPattern.includes(typeName);
      return resetMatchAndConfigure(regexp, matchFound, matchFound);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'TypeName.@*FieldNames-[excludeFieldNames];'`
  static buildAllFieldNamesExcludeFieldNamesOfTypeName = (
    typeFieldNames: (
      | [typeName: StringOr<TypeName>, fieldNames: FieldNames]
      | [typeNames: TypeNames, fieldNames: FieldNames]
    )[]
  ): string => {
    try {
      const expandedPattern: Record<string, string[]> = {};

      typeFieldNames.forEach(([typeNames, fieldNames]) => {
        typeNames = strToList(TypeName.fromTypeNames(typeNames));

        typeNames.forEach(typeName => {
          expandedPattern[typeName] = [...(expandedPattern[typeName] ?? []), FieldName.fromFieldNames(fieldNames)];
        });
      });

      return Object.keys(expandedPattern)
        .map(typeName => {
          const fieldNames = FieldName.fromFieldNames(expandedPattern[typeName]);
          return `${typeName}.${FieldName.allFieldNames}-[${fieldNames}];`;
        })
        .join('');
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    try {
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

      const matchFound = expandedPattern?.['excludes']?.includes(`${typeName}.${fieldName}`);

      const shouldConfigure = expandedPattern?.['typeNames']?.includes(typeName) && !matchFound;

      return resetMatchAndConfigure(regexp, matchFound, shouldConfigure);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames.[fieldNames];'`
  static buildFieldNamesOfAllTypeNames = (fieldNames: FieldNames): string => {
    try {
      fieldNames = FieldName.fromFieldNames(fieldNames);
      return `${TypeFieldName.allTypeNames}.[${fieldNames}];`;
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForFieldNamesOfAllTypeNames = /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfAllTypeNames = (pattern: string, fieldName: StringOr<FieldName>) => {
    try {
      const regexp = TypeFieldName.regexpForFieldNamesOfAllTypeNames;
      resetIndex(regexp);

      pattern = TypeFieldName.valueOf(pattern);
      fieldName = FieldName.fromString(TypeFieldName.valueOf(fieldName)).value;

      let result: RegExpExecArray | null;

      while ((result = regexp.exec(pattern)) !== null) {
        const foundFieldNames = strToList(result.groups.fieldNames);

        if (foundFieldNames.find(_fieldName => _fieldName === fieldName)) {
          return resetMatchAndConfigure(regexp, true, true);
        }
      }
      return resetMatchAndConfigure(regexp, false, false);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames.@*FieldNames;'`
  static buildAllFieldNamesOfAllTypeNames = (): string => {
    return `${TypeFieldName.allTypeNames}.${TypeFieldName.allFieldNames};`;
  };

  static regexpForAllFieldNamesOfAllTypeNames = /@\*TypeNames\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfAllTypeNames = (pattern: string) => {
    try {
      const regexp = TypeFieldName.regexpForAllFieldNamesOfAllTypeNames;
      resetIndex(regexp);

      pattern = TypeFieldName.valueOf(pattern);
      const matchFound = regexp.test(pattern);
      return resetMatchAndConfigure(regexp, matchFound, matchFound);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames.@*FieldNames-[excludeFieldNames];'`
  static buildAllFieldNamesExcludeFieldNamesOfAllTypeNames = (fieldNames: FieldNames): string => {
    try {
      fieldNames = FieldName.fromFieldNames(fieldNames);
      return `${TypeFieldName.allTypeNames}.${TypeFieldName.allFieldNames}-[${fieldNames}];`;
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames =
    /@\*TypeNames\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames = (
    pattern: string,
    fieldName: StringOr<FieldName>
  ) => {
    try {
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
      const matchFound = expandedPattern?.includes(fieldName);
      return resetMatchAndConfigure(regexp, matchFound, !matchFound);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].[fieldNames];'`
  static buildFieldNamesOfAllTypeNamesExcludeTypeNames = (typeNames: TypeNames, fieldNames: FieldNames): string => {
    try {
      typeNames = TypeName.fromTypeNames(typeNames);
      fieldNames = FieldName.fromFieldNames(fieldNames);
      return `${TypeFieldName.allTypeNames}-[${typeNames}].[${fieldNames}];`;
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    try {
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

      const matchFound = expandedPattern?.['excludes']?.includes(`${typeName}.${fieldName}`);
      const shouldConfigure = expandedPattern?.['fieldNames']?.includes(fieldName) && !matchFound;

      return resetMatchAndConfigure(regexp, matchFound, shouldConfigure);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames;'`
  static buildAllFieldNamesOfAllTypeNamesExcludeTypeNames = (typeNames: TypeNames): string => {
    try {
      typeNames = TypeName.fromTypeNames(typeNames);
      return `${TypeFieldName.allTypeNames}-[${typeNames}].${TypeFieldName.allFieldNames};`;
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: string,
    typeName: StringOr<TypeName>
  ) => {
    try {
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

      const matchFound = expandedPattern?.includes(typeName);
      return resetMatchAndConfigure(regexp, matchFound, !matchFound);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames-[excludeFieldNames];'`
  static buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeNames: TypeNames,
    fieldNames: FieldNames
  ): string => {
    try {
      typeNames = TypeName.fromTypeNames(typeNames);
      fieldNames = FieldName.fromFieldNames(fieldNames);
      return `${TypeFieldName.allTypeNames}-[${typeNames}].${TypeFieldName.allFieldNames}-[${fieldNames}];`;
    } catch (error) {
      throw new Error(error);
    }
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: string,
    typeName: StringOr<TypeName>,
    fieldName: StringOr<FieldName>
  ) => {
    try {
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
      const matchFound = expandedPattern?.includes(`${typeName}.${fieldName}`);

      return resetMatchAndConfigure(regexp, matchFound, !matchFound);
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion

  //#region attemptMatchAndConfigure
  static attemptMatchAndConfigure = (pattern: string, typeName: TypeName, fieldName?: FieldName) => {
    try {
      pattern = TypeFieldName.valueOf(pattern);
      if (pattern.split(';').length !== 1) {
        throw new Error(
          'attemptMatchAndConfigure can only handle one pattern at a time... use the `splitPatterns(...)` helper function to split your patterns into a list and loop over the list calling the `attemptMatchAndConfigure(...)`  for each single pattern'
        );
      }

      const regexpFor = (baseName: string): RegExp => TypeFieldName[`regexpFor${baseName}`];

      const matchAndConfigure = (
        baseName: string,
        pattern: string,
        typeName?: StringOr<TypeName>,
        fieldName?: StringOr<FieldName>
      ): { matchFound: boolean; shouldBeConfigured: boolean } =>
        TypeFieldName[`matchAndConfigure${baseName}`]?.(pattern, typeName, fieldName);

      const matchList: string[] = getMatchList();
      for (let i = 0; i < matchList.length; i++) {
        const baseName = matchList[i];

        if (regexpFor(baseName).test(pattern)) {
          return matchAndConfigure(baseName, pattern, typeName, fieldName);
        }
      }
      return undefined;
    } catch (error) {
      throw new Error(error);
    }
  };
  //#endregion
}

//#region helper methods
export const splitPatterns = (patterns: string | string[]) =>
  TypeFieldName.valueOf(patterns)
    .split(/\s*;\s*/)
    .filter(pattern => pattern.length > 0);
export const strToList = (str: string) => (str.length < 1 ? [] : str.split(/\s*,\s*/gim).filter(s => s.length > 0));

export const arrayWrap = <T>(value: T | T[]) =>
  value === undefined ? [] : Array.isArray(value) ? value : ([value] as T[]);

export const resetIndex = (regexp: RegExp) => (regexp.lastIndex = 0);

export const resetMatchAndConfigure = (regexp: RegExp, matchFound: boolean, shouldBeConfigured: boolean) => {
  resetIndex(regexp);
  return { matchFound, shouldBeConfigured };
};

export const getMatchList = () =>
  Object.getOwnPropertyNames(TypeFieldName)
    .filter(property => TypeFieldName[property] instanceof RegExp)
    .map(regexpForName => regexpForName.slice(9))
    .reverse(); // runs more specific patterns first(in asc order)

// #endregion
