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
});

describe('TypeFieldName can be created with builder methods', () => {
  const typeNames = 'Droid, Starship';
  const typeName = 'Droid';
  const fieldNames = 'id, name, friends';

  it('should build and match typeFieldNames with the given args', () => {
    // 'TypeName.[fieldNames]'
    const typeFieldName1 = `Droid.[id,name,friends];`;

    expect(TypeFieldName.fieldNamesOfTypeName(typeName, fieldNames)).toBe(typeFieldName1);

    expect(TypeFieldName.matchesFieldNamesOfTypeName(typeFieldName1, typeName, 'id')).toBe(true);
    expect(TypeFieldName.matchesFieldNamesOfTypeName(typeFieldName1, typeName, 'name')).toBe(true);
    expect(TypeFieldName.matchesFieldNamesOfTypeName(typeFieldName1, typeName, 'friends')).toBe(true);
    // using matchAll: all child elements are in parent
    expect(TypeFieldName.matchesFieldNamesOfTypeName(typeFieldName1, typeName, 'notfriends')).toBe(false);
    expect(TypeFieldName.matchesFieldNamesOfTypeName(typeFieldName1, typeName, fieldNames)).toBe(true);
    // using matchAll: not all child elements are in parent
    expect(
      TypeFieldName.matchesFieldNamesOfTypeName(typeFieldName1, typeName, fieldNames + ', notfriends', false)
    ).toBe(true);

    // '@*TypeName.[fieldNames]'
    const typeFieldName2 = `${anyTypeName}.[id,name,friends];`;
    expect(TypeFieldName.fieldNamesOfAnyTypeName(fieldNames)).toBe(typeFieldName2);
    expect(TypeFieldName.matchesFieldNamesOfAnyTypeName(typeFieldName2, fieldNames)).toBe(true);

    // `'TypeName.@*FieldName'`
    const typeFieldName3 = `Droid.${anyFieldName};`;
    expect(TypeFieldName.anyFieldNameOfTypeName(typeName)).toBe(typeFieldName3);
    expect(TypeFieldName.matchesAnyFieldNameOfTypeName(typeFieldName3, typeName)).toBe(true);

    // `'@*TypeName.@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeName()).toBe(`${anyTypeName}.${anyFieldName};`);

    // `'TypeName.@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameOfTypeNameExceptFieldNames(typeName, fieldNames)).toBe(
      `Droid.${anyFieldName}-[id,name,friends];`
    );

    // `'@*TypeName.@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeNameExceptFieldNames(fieldNames)).toBe(
      `${anyTypeName}.${anyFieldName}-[id,name,friends];`
    );

    //  `'@*TypeName-[exceptTypeNames]'`
    expect(TypeFieldName.anyTypeNameExceptTypeNames(typeNames)).toBe(`${anyTypeName}-[Droid,Starship];`);

    //  `'@*TypeName-[exceptTypeNames].[fieldNames]'`
    expect(TypeFieldName.fieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
      `${anyTypeName}-[Droid,Starship].[id,name,friends];`
    );

    // `'@*TypeName-[exceptTypeNames].@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeNameExceptTypeNames(typeNames)).toBe(
      `${anyTypeName}-[Droid,Starship].${anyFieldName};`
    );

    // `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
      `${anyTypeName}-[Droid,Starship].${anyFieldName}-[id,name,friends];`
    );
  });
});
