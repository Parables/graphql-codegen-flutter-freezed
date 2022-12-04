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
  const typeName = 'Droid';
  const typeNames = 'Droid, Starship';
  const normalizedTypeNames = 'Droid,Starship';
  const fieldNames = 'id, name, friends';
  const normalizedFieldNames = 'id,name,friends';

  // `'TypeName; TypeName' or [TypeName; TypeName;];`
  const typeFieldName = `Droid;Starship`;

  // `'TypeName.[fieldNames]'`
  const fieldNamesOfTypeName = `Droid.[${normalizedFieldNames}];`;

  // `'TypeName.@*FieldName'`
  const anyFieldNameOfTypeName = `Droid.${anyFieldName};`;

  // `'TypeName.@*FieldName-[exceptFieldNames]'`
  const anyFieldNameExceptFieldNamesOfTypeName = `Droid.${anyFieldName}-[${normalizedFieldNames}];`;

  // '@*TypeName.[fieldNames]'
  const fieldNamesOfAnyTypeName = `${anyTypeName}.[${normalizedFieldNames}];`;

  // `'@*TypeName.@*FieldName'`
  const anyFieldNameOfAnyTypeName = `${anyTypeName}.${anyFieldName};`;

  // `'@*TypeName.@*FieldName-[exceptFieldNames]'`
  const anyFieldNameExceptFieldNamesOfAnyTypeName = `${anyTypeName}.${anyFieldName}-[${normalizedFieldNames}];`;

  //  `'@*TypeName-[exceptTypeNames]'`
  const anyTypeNameExceptTypeNames = `${anyTypeName}-[${normalizedTypeNames}];`;

  //  `'@*TypeName-[exceptTypeNames].[fieldNames]'`
  const fieldNamesOfAnyTypeNameExceptTypeNames = `${anyTypeName}-[${normalizedTypeNames}].[${normalizedFieldNames}];`;

  // `'@*TypeName-[exceptTypeNames].@*FieldName'`
  const anyFieldNameOfAnyTypeNameExceptTypeNames = `${anyTypeName}-[${normalizedTypeNames}].${anyFieldName};`;

  // `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
  const anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames = `${anyTypeName}-[${normalizedTypeNames}].${anyFieldName}-[${normalizedFieldNames}];`;

  it('should build and match typeFieldNames with the given args', () => {
    // `'TypeName; TypeName' or [TypeName; TypeName;];`
    expect(TypeFieldName.typeNames(typeNames)).toBe(typeFieldName);
    // TODO: fix this
    // expect(TypeFieldName.matchesTypeNames(typeFieldName, 'Droid')).toBe(true);
    // expect(TypeFieldName.matchesTypeNames(typeFieldName, 'Starship')).toBe(true);
    // expect(TypeFieldName.matchesTypeNames(typeFieldName, 'Human')).toBe(false);
    // expect(TypeFieldName.matchesTypeNames(typeFieldName, normalizedTypeNames)).toBe(true);

    // 'TypeName.[fieldNames]'
    expect(TypeFieldName.fieldNamesOfTypeName(typeName, fieldNames)).toBe(fieldNamesOfTypeName);

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

    // `'TypeName.@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfTypeName(typeName)).toBe(anyFieldNameOfTypeName);
    expect(TypeFieldName.matchesAnyFieldNameOfTypeName(anyFieldNameOfTypeName, typeName)).toBe(true);

    // `'TypeName.@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameExceptFieldNamesOfTypeName(typeName, fieldNames)).toBe(
      anyFieldNameExceptFieldNamesOfTypeName
    );
    expect(
      TypeFieldName.matchesAnyFieldNameExceptFieldNamesOfTypeName(
        anyFieldNameExceptFieldNamesOfTypeName,
        typeName,
        fieldNames
      )
    ).toBe(true);

    // '@*TypeName.[fieldNames]'
    expect(TypeFieldName.fieldNamesOfAnyTypeName(fieldNames)).toBe(fieldNamesOfAnyTypeName);
    expect(TypeFieldName.matchesFieldNamesOfAnyTypeName(fieldNamesOfAnyTypeName, fieldNames)).toBe(true);

    // `'@*TypeName.@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeName()).toBe(anyFieldNameOfAnyTypeName);
    expect(TypeFieldName.matchesAnyFieldNameOfAnyTypeName(anyFieldNameOfAnyTypeName)).toBe(true);

    // `'@*TypeName.@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameExceptFieldNamesOfAnyTypeName(fieldNames)).toBe(
      anyFieldNameExceptFieldNamesOfAnyTypeName
    );
    expect(
      TypeFieldName.matchesAnyFieldNameExceptFieldNamesOfAnyTypeName(
        anyFieldNameExceptFieldNamesOfAnyTypeName,
        fieldNames
      )
    ).toBe(true);

    //  `'@*TypeName-[exceptTypeNames]'`
    expect(TypeFieldName.anyTypeNameExceptTypeNames(typeNames)).toBe(anyTypeNameExceptTypeNames);
    expect(TypeFieldName.matchesAnyTypeNameExceptTypeNames(anyTypeNameExceptTypeNames, typeNames)).toBe(true);

    //  `'@*TypeName-[exceptTypeNames].[fieldNames]'`
    expect(TypeFieldName.fieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
      fieldNamesOfAnyTypeNameExceptTypeNames
    );
    expect(
      TypeFieldName.matchesFieldNamesOfAnyTypeNameExceptTypeNames(
        fieldNamesOfAnyTypeNameExceptTypeNames,
        typeNames,
        fieldNames
      )
    ).toBe(true);

    // `'@*TypeName-[exceptTypeNames].@*FieldName'`
    expect(TypeFieldName.anyFieldNameOfAnyTypeNameExceptTypeNames(typeNames)).toBe(
      anyFieldNameOfAnyTypeNameExceptTypeNames
    );
    expect(
      TypeFieldName.matchesAnyFieldNameOfAnyTypeNameExceptTypeNames(anyFieldNameOfAnyTypeNameExceptTypeNames, typeNames)
    ).toBe(true);

    // `'@*TypeName-[exceptTypeNames].@*FieldName-[exceptFieldNames]'`
    expect(TypeFieldName.anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(typeNames, fieldNames)).toBe(
      anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames
    );

    expect(
      TypeFieldName.matchesAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(
        anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames,
        typeNames,
        fieldNames
      )
    ).toBe(true);
  });
});
