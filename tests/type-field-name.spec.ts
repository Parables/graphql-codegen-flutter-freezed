import { FieldName, TypeFieldName, TypeName } from '../src/config/type-field-name';
const anyTypeName = '@*TypeName';
const anyFieldName = '@*FieldName';

describe("integrity checks: ensures that these values don't change and if they are updated accordingly", () => {
  describe('anyTypeName and anyFieldName', () => {
    it('is set to @*TypeName', () => {
      expect(TypeName.anyTypeName).toBe(anyTypeName);
      expect(FieldName.anyTypeName).toBe(anyTypeName);
      expect(TypeFieldName.anyTypeName).toBe(anyTypeName);
    });

    it('is set to @*FieldName ', () => {
      expect(TypeName.anyFieldName).toBe(anyFieldName);
      expect(FieldName.anyFieldName).toBe(anyFieldName);
      expect(TypeFieldName.anyFieldName).toBe(anyFieldName);
    });
  });

  describe('regexp used to match TypeFieldName in config', () => {
    it('has regexp for each pattern ', () => {
      expect(TypeFieldName.regexpForFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForFieldNamesOfAnyTypeName.source).toBe(
        /@\*TypeName\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForAnyFieldNameOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.@\*FieldName;/gim.source
      );

      expect(TypeFieldName.regexpForAnyFieldNameOfAnyTypeName.source).toBe(/@\*TypeName\.@\*FieldName;/gim.source);

      expect(TypeFieldName.regexpForAnyFieldNameExceptFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeName\s*)\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim
          .source
      );

      expect(TypeFieldName.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeName.source).toBe(
        /@\*TypeName\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForAnyTypeNameExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForFieldNamesOfAnyTypeNameExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );

      expect(TypeFieldName.regexpForAnyFieldNameOfAnyTypeNameExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.@\*FieldName;/gim.source
      );

      expect(TypeFieldName.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames.source).toBe(
        /@\*TypeName-\[\s*(?<exceptTypeNames>(\w+,?\s*)*)\]\.@\*FieldName-\[\s*(?<exceptFieldNames>(\w+,?\s*)*)\];/gim
          .source
      );
    });
  });

  describe('patternNames are used to loop through all the possible patterns. Builder, RegExp and Matcher are retrieved using the patternNames', () => {
    it('has expected names', () => {
      test('patternNames are not renamed', () => {
        expect(TypeFieldName.patternNames).toMatchObject([
          'FieldNamesOfTypeName',
          'AnyFieldNameOfTypeName',
          'AnyFieldNameExceptFieldNamesOfTypeName',
          'FieldNamesOfAnyTypeName',
          'AnyFieldNameOfAnyTypeName',
          'AnyFieldNameExceptFieldNamesOfAnyTypeName',
          'AnyTypeNameExceptTypeNames',
          'FieldNamesOfAnyTypeNameExceptTypeNames',
          'AnyFieldNameOfAnyTypeNameExceptTypeNames',
          'AnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames',
        ]);
      });
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

      expect(TypeName.matchesAnyTypeName(`${anyTypeName};`)).toBe(true);
      expect(TypeName.matchesAnyTypeName(`${anyTypeName}`)).toBe(false); // missing semi-colon
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
      expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, 'notfriends')).toBe(false);
      // using matchAll: all child elements are in parent
      expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, fieldNames)).toBe(true);
      // using matchAll: not all child elements are in parent
      expect(
        TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, typeName, fieldNames + ', notfriends', false)
      ).toBe(true);
      //#endregion

      //#region `'TypeName.@*FieldName'`
      const anyFieldNameOfTypeName = `Droid.${anyFieldName};`;

      expect(TypeFieldName.buildAnyFieldNameOfTypeName(typeName)).toBe(anyFieldNameOfTypeName);
      expect(TypeFieldName.matchesAnyFieldNameOfTypeName(anyFieldNameOfTypeName, typeName)).toBe(true);
      //#endregion

      //#region `'TypeName.@*FieldName-[exceptFieldNames]'`
      const anyFieldNameExceptFieldNamesOfTypeName = `Droid.${anyFieldName}-[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildAnyFieldNameExceptFieldNamesOfTypeName(typeName, fieldNames)).toBe(
        anyFieldNameExceptFieldNamesOfTypeName
      );
      expect(
        TypeFieldName.matchesAnyFieldNameExceptFieldNamesOfTypeName(
          anyFieldNameExceptFieldNamesOfTypeName,
          typeName,
          fieldNames
        )
      ).toBe(true);
      //#endregion

      //#region `'@*TypeName.[fieldNames];'`
      const fieldNamesOfAnyTypeName = `${anyTypeName}.[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildFieldNamesOfAnyTypeName(fieldNames)).toBe(fieldNamesOfAnyTypeName);
      expect(TypeFieldName.matchesFieldNamesOfAnyTypeName(fieldNamesOfAnyTypeName, fieldNames)).toBe(true);
      //#endregion

      //#region `'@*TypeName.@*FieldName'`
      const anyFieldNameOfAnyTypeName = `${anyTypeName}.${anyFieldName};`;

      expect(TypeFieldName.buildAnyFieldNameOfAnyTypeName()).toBe(anyFieldNameOfAnyTypeName);
      expect(TypeFieldName.matchesAnyFieldNameOfAnyTypeName(anyFieldNameOfAnyTypeName)).toBe(true);
      //#endregion

      //#region `'@*TypeName.@*FieldName-[exceptFieldNames]'`
      const anyFieldNameExceptFieldNamesOfAnyTypeName = `${anyTypeName}.${anyFieldName}-[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildAnyFieldNameExceptFieldNamesOfAnyTypeName(fieldNames)).toBe(
        anyFieldNameExceptFieldNamesOfAnyTypeName
      );
      expect(
        TypeFieldName.matchesAnyFieldNameExceptFieldNamesOfAnyTypeName(
          anyFieldNameExceptFieldNamesOfAnyTypeName,
          fieldNames
        )
      ).toBe(true);
      //#endregion

      //#region  `'@*TypeName-[exceptTypeNames]'`
      const anyTypeNameExceptTypeNames = `${anyTypeName}-[${trimmedTypeNames}];`;

      expect(TypeFieldName.buildAnyTypeNameExceptTypeNames(typeNames)).toBe(anyTypeNameExceptTypeNames);
      expect(TypeFieldName.matchesAnyTypeNameExceptTypeNames(anyTypeNameExceptTypeNames, typeNames)).toBe(true);
      //#endregion

      //#region  `'@*TypeName-[exceptTypeNames].[fieldNames]'`
      const fieldNamesOfAnyTypeNameExceptTypeNames = `${anyTypeName}-[${trimmedTypeNames}].[${trimmedFieldNames}];`;

      expect(TypeFieldName.buildFieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
        fieldNamesOfAnyTypeNameExceptTypeNames
      );
      expect(
        TypeFieldName.matchesFieldNamesOfAnyTypeNameExceptTypeNames(
          fieldNamesOfAnyTypeNameExceptTypeNames,
          typeNames,
          fieldNames
        )
      ).toBe(true);
      //#endregion

      //#region `'@*TypeName-[exceptTypeNames].@*FieldName'`
      const anyFieldNameOfAnyTypeNameExceptTypeNames = `${anyTypeName}-[${trimmedTypeNames}].${anyFieldName};`;

      expect(TypeFieldName.buildAnyFieldNameOfAnyTypeNameExceptTypeNames(typeNames)).toBe(
        anyFieldNameOfAnyTypeNameExceptTypeNames
      );
      expect(
        TypeFieldName.matchesAnyFieldNameOfAnyTypeNameExceptTypeNames(
          anyFieldNameOfAnyTypeNameExceptTypeNames,
          typeNames
        )
      ).toBe(true);
      //#endregion

      //#region  `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
      const anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = `${anyTypeName}-[${trimmedTypeNames}].${anyFieldName}-[${trimmedFieldNames}];`;
      expect(TypeFieldName.buildAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
        anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames
      );

      expect(
        TypeFieldName.matchesAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(
          anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames,
          typeNames,
          fieldNames
        )
      ).toBe(true);
      //#endregion
    });
  });
});
