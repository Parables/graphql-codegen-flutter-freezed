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
        /(?<typeName>\w+)(?<!@\s*\*\s*TypeName)\s*\.\s*\[\s*(?<fieldNames>(\w+?,?\s*)*)\]/gim.source
      );
      expect(TypeFieldName.regexpForFieldNamesOfAnyTypeName.source).toBe(
        /@\s*\*\s*TypeName\s*\.\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim.source
      );
      expect(TypeFieldName.regexpForAnyFieldNameOfTypeName.source).toBe(
        /(?<typeName>\w+?)(?<!@\s*\*\s*TypeName)\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim.source
      );
      expect(TypeFieldName.regexpForAnyFieldNameOfAnyTypeName.source).toBe(
        /@\s*\*\s*TypeName\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim.source
      );
      expect(TypeFieldName.regexpForAnyFieldNameExceptFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+?)(?<!@\s*\*\s*TypeName)\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>(\w+?,?\s*)*)\]/gim
          .source
      );
      expect(TypeFieldName.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeName.source).toBe(
        /@\s*\*\s*TypeName\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim.source
      );
      expect(TypeFieldName.regexpForAnyTypeNameExceptTypeNames.source).toBe(
        /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*,?[^-.\s*]/gim.source
      );
      expect(TypeFieldName.regexpForFieldNamesOfAnyTypeNameExceptTypeNames.source).toBe(
        /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim
          .source
      );
      expect(TypeFieldName.regexpForAnyFieldNameOfAnyTypeNameExceptTypeNames.source).toBe(
        /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*@\s*\*\s*FieldName\s*,?[^-.\s*]/gim.source
      );
      expect(TypeFieldName.regexpForAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames.source).toBe(
        /@\s*\*\s*TypeName\s*-\s*\[\s*(?<typeNames>((\w+?,?\s*)*))\]\s*\.\s*@\s*\*\s*FieldName\s*-\s*\[\s*(?<fieldNames>((\w+?,?\s*)*))\]/gim
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
    const fieldNamesOfTypeName = `Droid.[id,name,friends]`;
    const pattern = TypeFieldName.RegExpForFieldNamesOfTypeName(typeName, 'id');
    console.log(pattern);
    console.log(pattern.test(fieldNamesOfTypeName));

    expect(TypeFieldName.fieldNamesOfTypeName(typeName, fieldNames)).toBe(fieldNamesOfTypeName);

    expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, 'Droid', 'id')).toBe(true);
    expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, 'Droid', 'name')).toBe(true);
    expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, 'Droid', 'friends')).toBe(true);
    // using matchAll: all child elements are in parent
    expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, 'Droid', 'notfriends')).toBe(false);
    expect(TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, 'Droid', fieldNames)).toBe(true);
    // using matchAll: not all child elements are in parent
    expect(
      TypeFieldName.matchesFieldNamesOfTypeName(fieldNamesOfTypeName, 'Droid', fieldNames + ', notfriends', false)
    ).toBe(true);

    // '@*TypeName.[fieldNames]'
    expect(TypeFieldName.fieldNamesOfAnyTypeName(fieldNames)).toBe(`${anyTypeName}.[id,name,friends]`);

    // `'TypeName.@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfTypeName(typeName)).toBe(`Droid.${anyFieldName}`);

    // `'@*TypeName.@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeName()).toBe(`${anyTypeName}.${anyFieldName}`);

    // `'TypeName.@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameOfTypeNameExceptFieldNames(typeName, fieldNames)).toBe(
      `Droid.${anyFieldName}-[id,name,friends]`
    );

    // `'@*TypeName.@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeNameExceptFieldNames(fieldNames)).toBe(
      `${anyTypeName}.${anyFieldName}-[id,name,friends]`
    );

    //  `'@*TypeName-[exceptTypeNames]'`
    expect(TypeFieldName.anyTypeNameExceptTypeNames(typeNames)).toBe(`${anyTypeName}-[Droid,Starship]`);

    //  `'@*TypeName-[exceptTypeNames].[fieldNames]'`
    expect(TypeFieldName.fieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
      `${anyTypeName}-[Droid,Starship].[id,name,friends]`
    );

    // `'@*TypeName-[exceptTypeNames].@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeNameExceptTypeNames(typeNames)).toBe(
      `${anyTypeName}-[Droid,Starship].${anyFieldName}`
    );

    // `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
      `${anyTypeName}-[Droid,Starship].${anyFieldName}-[id,name,friends]`
    );
  });
});
