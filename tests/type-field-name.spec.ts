import { FieldName, TypeFieldName, TypeName } from '../src/config/type-field-name';
const allTypeNames = '@*TypeNames';
const allFieldNames = '@*FieldNames';

describe("integrity checks: ensures that these values don't change and if they are updated accordingly", () => {
  describe('allTypeNames and allFieldNames', () => {
    it('is set to @*TypeNames', () => {
      expect(TypeName.allTypeNames).toBe(allTypeNames);
      expect(FieldName.allTypeNames).toBe(allTypeNames);
      expect(TypeFieldName.allTypeNames).toBe(allTypeNames);
    });

    it('is set to @*FieldNames ', () => {
      expect(TypeName.allFieldNames).toBe(allFieldNames);
      expect(FieldName.allFieldNames).toBe(allFieldNames);
      expect(TypeFieldName.allFieldNames).toBe(allFieldNames);
    });
  });

  describe('regexp used to match TypeFieldName in config', () => {
    it('has regexp for each pattern ', () => {
      expect(TypeFieldName.regexpForFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForFieldNamesOfAllTypeNames.source).toBe(
        /@\*TypeName\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForAllFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.@\*FieldName;/gim.source
      );

      expect(TypeFieldName.regexpForAllFieldNamesOfAllTypeNames.source).toBe(/@\*TypeName\.@\*FieldName;/gim.source);

      expect(TypeFieldName.regexpForAllFieldNamesExceptFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim
          .source
      );

      expect(TypeFieldName.regexpForAllFieldNamesExceptFieldNamesOfAllTypeNames.source).toBe(
        /@\*TypeName\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForAllTypeNamesExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForFieldNamesOfAllTypeNamesExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForAllFieldNamesOfAllTypeNamesExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.@\*FieldName;/gim.source
      );

      expect(TypeFieldName.regexpForAllFieldNamesExceptFieldNamesOfAllTypeNamesExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim
          .source
      );
    });
  });
});

describe('TypeName, FieldName and TypeFieldName all inherit from the base class GraphqlTypeFieldName', () => {
  test('trims and join the names  ', () => {
    expect(TypeFieldName.valueOf('Droid, Starship')).toBe('Droid,Starship');
    expect(TypeFieldName.valueOf(['Droid', 'Starship'])).toBe('Droid,Starship');
    expect(TypeFieldName.valueOf([TypeName.fromString('Droid'), TypeName.fromString('Starship')])).toBe(
      'Droid,Starship'
    );
    expect(TypeFieldName.valueOf(TypeName.fromString('Starship'))).toBe('Starship');

    expect(TypeFieldName.fromStringOrArray('Droid, Starship')).toBe('Droid,Starship');
    expect(TypeFieldName.fromStringOrArray(['Droid', 'Starship'])).toBe('Droid,Starship');

    expect(TypeFieldName.trimNameList('Droid,Starship')).toBe('Droid,Starship');
    expect(() => TypeFieldName.trimNameList('')).toThrow();
  });

  test('parent contains all the elements of child', () => {
    expect(TypeFieldName.matchAll('One,Two,Three', 'Three')).toBe(true);
    expect(TypeFieldName.matchAll('One,Two,Three', 'One,Three,Two')).toBe(true);
    expect(TypeFieldName.matchAll('One,Two,Three', 'Three,Four,One,Three', true)).toBe(false); // matchAll set to true
    expect(TypeFieldName.matchAll('One,Two,Three', 'Four')).toBe(false);
  });
});

describe('TypeName and FieldName should contain the name of a single Graphql Type or Field respectively', () => {
  it('throws for multiple types', () => {
    expect(() => TypeName.fromString('Droid, Starship')).toThrow();
    expect(() => TypeName.fromString('Droid; Starship')).toThrow();
    expect(() => TypeName.fromString('Droid,')).toThrow();
    expect(() => TypeName.fromString('Droid;')).toThrow();
    expect(() => FieldName.fromString('id, name')).toThrow();
    expect(() => TypeName.fromString('')).toThrow();
    expect(() => FieldName.fromString('')).toThrow();
    expect(TypeName.fromString('Droid')).toBeInstanceOf(TypeName);
    expect(FieldName.fromString('id')).toBeInstanceOf(FieldName);
  });
});

describe('TypeFieldName can be created with builder methods', () => {
  const typeName = 'Droid';
  const typeNames = 'Droid, Starship';
  const trimmedTypeNames = 'Droid,Starship';
  const fieldNames = 'id, name, friends';
  const trimmedFieldNames = 'id,name,friends';

  describe('TypeNames are just a list of GraphQL Type names', () => {
    it('should build and match typeNames with the given args', () => {
      //#region `'TypeName, TypeName' or [TypeName, TypeName;];`
      expect(TypeName.fromTypeNames(`  Droid,   Starship,,,`)).toBe(trimmedTypeNames);
      expect(TypeName.fromTypeNames(['Droid   ', ' Starship '])).toBe(trimmedTypeNames);
      expect(TypeName.fromTypeNames([TypeName.fromString('Droid   '), TypeName.fromString(' Starship ')])).toBe(
        trimmedTypeNames
      );
      expect(TypeName.matchesTypeNames(typeNames, 'Droid')).toBe(true);
      expect(TypeName.matchesTypeNames(typeNames, 'Starship')).toBe(true);
      expect(TypeName.matchesTypeNames(typeNames, 'Human')).toBe(false);
      expect(TypeName.matchesTypeNames(typeNames, trimmedTypeNames)).toBe(true);

      expect(TypeName.matchesAllTypeNames(`${allTypeNames};`)).toBe(true);
      expect(TypeName.matchesAllTypeNames(`${allTypeNames}`)).toBe(false); // missing semi-colon
    });
  });

  describe('TypeFieldName is a pattern consisting of TypeName(s) and FieldName(s)', () => {
    it('should build and match typeFieldNames with the given args', () => {
      //#region `'TypeName.[fieldNames]'`
      const fieldNamesOfTypeName = `Droid.[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildFieldNamesOfTypeName(typeName, fieldNames)).toBe(fieldNamesOfTypeName);

      expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, 'id')).toBe(true);
      expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, 'name')).toBe(true);
      expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, 'friends')).toBe(true);
      expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, 'friend')).toBe(false);
      // using matchAll: all child elements are in parent
      expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, fieldNames)).toBe(true);
      // using matchAll: not all child elements are in parent
      expect(
        TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, fieldNames + ', friend', false)
      ).toBe(true);
      //#endregion

      //#region `'TypeName.@*FieldNames'`
      const allFieldNamesOfTypeName = `Droid.${allFieldNames};`;

      expect(TypeFieldName.buildAllFieldNamesOfTypeName(typeName)).toBe(allFieldNamesOfTypeName);
      expect(TypeFieldName.matchesAllFieldNamesOfTypeName(allFieldNamesOfTypeName, typeName)).toBe(true);
      //#endregion

      //#region `'TypeName.@*FieldNames-[exceptFieldNames]'`
      const allFieldNamesExceptFieldNamesOfTypeName = `Droid.${allFieldNames}-[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildAllFieldNamesExceptFieldNamesOfTypeName(typeName, fieldNames)).toBe(
        allFieldNamesExceptFieldNamesOfTypeName
      );
      expect(
        TypeFieldName.matchesAllFieldNamesExceptFieldNamesOfTypeName(
          allFieldNamesExceptFieldNamesOfTypeName,
          typeName,
          fieldNames
        )
      ).toBe(true);
      //#endregion

      //#region `'@*TypeNames.[fieldNames];'`
      const fieldNamesOfAllTypeNames = `${allTypeNames}.[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildFieldNamesOfAllTypeNames(fieldNames)).toBe(fieldNamesOfAllTypeNames);
      expect(TypeFieldName.matchesFieldNamesOfAllTypeNames(fieldNamesOfAllTypeNames, fieldNames)).toBe(true);
      //#endregion

      //#region `'@*TypeNames.@*FieldNames'`
      const allFieldNamesOfAllTypeNames = `${allTypeNames}.${allFieldNames};`;

      expect(TypeFieldName.buildAllFieldNamesOfAllTypeNames()).toBe(allFieldNamesOfAllTypeNames);
      expect(TypeFieldName.matchesAllFieldNamesOfAllTypeNames(allFieldNamesOfAllTypeNames)).toBe(true);
      //#endregion

      //#region `'@*TypeNames.@*FieldNames-[exceptFieldNames]'`
      const allFieldNamesExceptFieldNamesOfAllTypeNames = `${allTypeNames}.${allFieldNames}-[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildAllFieldNamesExceptFieldNamesOfAllTypeNames(fieldNames)).toBe(
        allFieldNamesExceptFieldNamesOfAllTypeNames
      );
      expect(
        TypeFieldName.matchesAllFieldNamesExceptFieldNamesOfAllTypeNames(
          allFieldNamesExceptFieldNamesOfAllTypeNames,
          fieldNames
        )
      ).toBe(true);
      //#endregion

      //#region  `'@*TypeNames-[exceptTypeNames]'`
      const allTypeNamesExceptTypeNames = `${allTypeNames}-[${trimmedTypeNames}];`;

      expect(TypeFieldName.buildAllTypeNamesExceptTypeNames(typeNames)).toBe(allTypeNamesExceptTypeNames);
      expect(TypeFieldName.matchesAllTypeNamesExceptTypeNames(allTypeNamesExceptTypeNames, typeNames)).toBe(true);
      //#endregion

      //#region  `'@*TypeNames-[exceptTypeNames].[fieldNames]'`
      const fieldNamesOfAllTypeNamesExceptTypeNames = `${allTypeNames}-[${trimmedTypeNames}].[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildFieldNamesOfAllTypeNamesExceptTypeNames(typeNames, fieldNames)).toBe(
        fieldNamesOfAllTypeNamesExceptTypeNames
      );
      expect(
        TypeFieldName.matchesFieldNamesOfAllTypeNamesExceptTypeNames(
          fieldNamesOfAllTypeNamesExceptTypeNames,
          typeNames,
          fieldNames
        )
      ).toBe(true);
      //#endregion

      //#region `'@*TypeNames-[exceptTypeNames].@*FieldNames'`
      const allFieldNamesOfAllTypeNamesExceptTypeNames = `${allTypeNames}-[${trimmedTypeNames}].${allFieldNames};`;

      expect(TypeFieldName.buildAllFieldNamesOfAllTypeNamesExceptTypeNames(typeNames)).toBe(
        allFieldNamesOfAllTypeNamesExceptTypeNames
      );
      expect(
        TypeFieldName.matchesAllFieldNamesOfAllTypeNamesExceptTypeNames(
          allFieldNamesOfAllTypeNamesExceptTypeNames,
          typeNames
        )
      ).toBe(true);
      //#endregion

      //#region  `'@*TypeNames-[exceptTypeNames].@*FieldNames-[exceptFieldNames]'`
      const allFieldNamesExceptFieldNamesOfAllTypeNamesExceptTypeNames = `${allTypeNames}-[${trimmedTypeNames}].${allFieldNames}-[${trimmedFieldNames}];`;
      expect(TypeFieldName.buildAllFieldNamesExceptFieldNamesOfAllTypeNamesExceptTypeNames(typeNames, fieldNames)).toBe(
        allFieldNamesExceptFieldNamesOfAllTypeNamesExceptTypeNames
      );

      expect(
        TypeFieldName.matchesAllFieldNamesExceptFieldNamesOfAllTypeNamesExceptTypeNames(
          allFieldNamesExceptFieldNamesOfAllTypeNamesExceptTypeNames,
          typeNames,
          fieldNames
        )
      ).toBe(true);
      //#endregion
    });
  });
});
