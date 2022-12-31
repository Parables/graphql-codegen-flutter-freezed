import { TypeName, TypeFieldName, FieldName, getMatchList } from '../src/config/type-field-name';
// helper function that indexes the array passed to `.each `method of `describe`, `test` and `it`
const arrayIndexed = <T extends [...any]>(arr: T[]): [index: number, ...rest: T][] => arr.map((el, i) => [i, ...el]);
test('helper method: indexArray(arr[][]): returns a new array where the first element it the index of the old array element', () => {
  expect(arrayIndexed([['a'], ['b']])).toMatchObject([
    [0, 'a'],
    [1, 'b'],
  ]);

  expect(arrayIndexed([['buildTypeNames', ['Droid,Starship'], 'Droid;Starship;']])).toMatchObject([
    [0, 'buildTypeNames', ['Droid,Starship'], 'Droid;Starship;'],
  ]);
});

describe('integrity checks: ensures that the following are not modified accidentally', () => {
  // Hard coded for integrity purposes. Update this if more Regexp are added
  const expectedCount = 12;

  const definedBuilders = Object.getOwnPropertyNames(TypeFieldName).filter(
    method => method.startsWith('build') && typeof TypeFieldName[method] === 'function'
  );

  const definedRegexps = Object.getOwnPropertyNames(TypeFieldName).filter(
    property => TypeFieldName[property] instanceof RegExp
  );

  const definedMatchAndConfigureMethods = Object.getOwnPropertyNames(TypeFieldName).filter(
    method => method.startsWith('matchAndConfigure') && typeof TypeFieldName[method] === 'function'
  );

  // hard-coded baseNames
  const baseNames = [
    'TypeNames',
    'AllTypeNames',
    'AllTypeNamesExcludeTypeNames',
    'FieldNamesOfTypeName',
    'AllFieldNamesOfTypeName',
    'AllFieldNamesExcludeFieldNamesOfTypeName',
    'FieldNamesOfAllTypeNames',
    'AllFieldNamesOfAllTypeNames',
    'AllFieldNamesExcludeFieldNamesOfAllTypeNames',
    'FieldNamesOfAllTypeNamesExcludeTypeNames',
    'AllFieldNamesOfAllTypeNamesExcludeTypeNames',
    'AllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
  ];

  // dynamically generated baseNames
  const matchList: string[] = getMatchList();

  describe('pattern builders:', () => {
    it(`all ${expectedCount} pattern builders are accounted for`, () => {
      expect(definedBuilders.length).toBe(expectedCount);
    });
    it(`all ${expectedCount} pattern builders are  defined in order`, () => {
      expect(definedBuilders).toMatchObject(baseNames.map(baseName => `build${baseName}`));
    });
  });

  describe('Regular Expressions:', () => {
    it(`all ${expectedCount} Regular Expressions are accounted for`, () => {
      expect(definedRegexps.length).toBe(expectedCount);
    });
    it(`all ${expectedCount} Regular Expression are  defined in order`, () => {
      expect(definedRegexps).toMatchObject(baseNames.map(baseName => `regexpFor${baseName}`));
    });
  });

  describe('matchAndConfigure Methods:', () => {
    it(`all ${expectedCount} matchAndConfigure methods are accounted for and defined in order`, () => {
      expect(definedMatchAndConfigureMethods.length).toBe(expectedCount);
    });
    it(`all ${expectedCount} matchAndConfigure methods are  defined in order`, () => {
      expect(definedMatchAndConfigureMethods).toMatchObject(baseNames.map(baseName => `matchAndConfigure${baseName}`));
    });
  });

  describe('baseNames(hard-coded) vrs matchList(dynamically-generated):', () => {
    it('baseNames is equal to matchList', () => {
      expect(baseNames.reverse()).toMatchObject(matchList);
    });
  });
});

const Droid = TypeName.fromString('Droid');
const Starship = TypeName.fromString('Starship');
const Human = TypeName.fromString('Human');
const Movie = TypeName.fromString('Movie');

const id = FieldName.fromString('id');
const name = FieldName.fromString('name');
const friends = FieldName.fromString('friends');
const friend = FieldName.fromString('friend');
const title = FieldName.fromString('title');
const episode = FieldName.fromString('episode');
const length = FieldName.fromString('length');

const validPatterns = arrayIndexed([
  // [index, pattern]
  ['Droid;Starship;'],
  ['@*TypeNames;'],
  ['@*TypeNames-[Droid,Starship];'],
  ['Droid.[id,name,friends];Human.[id,name,title];Starship.[name,length];'],
  ['Droid.@*FieldNames;Movie.@*FieldNames;'],
  ['Droid.@*FieldNames-[id,name,friends];Human.@*FieldNames-[id,name,title];Starship.@*FieldNames-[name,length];'],
  ['@*TypeNames.[id,name,friends];'],
  ['@*TypeNames.@*FieldNames;'],
  ['@*TypeNames.@*FieldNames-[id,name,friends];'],
  ['@*TypeNames-[Droid,Human].[id,name,friends];'],
  ['@*TypeNames-[Droid,Human].@*FieldNames;'],
  ['@*TypeNames-[Droid,Human].@*FieldNames-[id,name,friends];'],
]);

/**
 * helper function that tests a RegExp against a list of patterns and returns true if the test passed, false otherwise
 *
 * @param regexpFor The RegExp to be tested
 * @param patternIndex index of pattern in validPattern where the test is expected to pass
 */
const testRegexpAgainstPatterns = (regexpFor: RegExp, patternIndex: number) => {
  describe.each(validPatterns)(`regexp.test(pattern): using regexp: '${regexpFor.source}'`, (index, pattern) => {
    if (index === patternIndex) {
      it(`passed: returned 'true'  at index: ${index} when tested on pattern: ${pattern}`, () => {
        expect(regexpFor.test(pattern)).toBe(true);
      });
    } else {
      it(`failed: returned 'false' at index: ${index} when tested on pattern: ${pattern}`, () => {
        expect(regexpFor.test(pattern)).toBe(false);
      });
    }
  });
};

// describe('Wherever a builder accepts a parameter with a type signature of TypeNames or FieldNames, any of the following values can be passed')

//#region `'TypeName;AnotherTypeName;'`
describe('Configuring specific Graphql Types:', () => {
  const [patternIndex, pattern] = validPatterns[0];

  describe('TypeFieldName.buildTypeNames:', () => {
    it('builds the expected pattern', () => {
      expect(TypeFieldName.buildTypeNames([Droid, Starship])).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForTypeNames:', () => {
    const regexpForTypeNames = TypeFieldName.regexpForTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForTypeNames.source).toBe(/\b(?!TypeNames|FieldNames\b)(?<typeName>\w+;)/gim.source);
    });

    testRegexpAgainstPatterns(regexpForTypeNames, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureTypeNames = TypeFieldName.matchAndConfigureTypeNames;

    it.each([Droid, Starship])(
      '%s will match and it will be configured because it was specified in the pattern',
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureTypeNames(pattern, typeName);

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(true);
      }
    );

    it.each([Human, Movie])(
      '%s will not match neither will it be configured because it was not specified in the pattern',
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureTypeNames(pattern, typeName);

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(false);
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames;'`
describe('Configuring all Graphql Types:', () => {
  const [patternIndex, pattern] = validPatterns[1];
  const invalidPattern = '@*TypeNames';

  describe('TypeFieldNames.buildAllTypeNames:', () => {
    it('builds the expected pattern', () => {
      expect(TypeFieldName.buildAllTypeNames()).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForAllTypeNames:', () => {
    const regexpForAllTypeNames = TypeFieldName.regexpForAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllTypeNames.source).toBe(/(?<allTypeNames>@\*TypeNames;)/gim.source);
    });

    testRegexpAgainstPatterns(regexpForAllTypeNames, patternIndex);
  });

  describe(`TypeFieldNames.matchAndConfigureAllTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllTypeNames = TypeFieldName.matchAndConfigureAllTypeNames;

    it('will match and configure all GraphQL Types if the pattern is valid', () => {
      const { matchFound, shouldBeConfigure } = matchAndConfigureAllTypeNames(pattern);

      expect(matchFound).toBe(true);
      expect(shouldBeConfigure).toBe(true);
    });

    it('will not match neither will it configure any GraphQL Type if the pattern is invalid', () => {
      const { matchFound, shouldBeConfigure } = matchAndConfigureAllTypeNames(invalidPattern);

      expect(matchFound).toBe(false);
      expect(shouldBeConfigure).toBe(false);
    });
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames];'`
describe('Configuring all Graphql Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, pattern] = validPatterns[2];

  describe('TypeFieldNames.buildAllTypeNamesExcludeTypeNames:', () => {
    it('builds the expected pattern', () => {
      expect(TypeFieldName.buildAllTypeNamesExcludeTypeNames([Droid, Starship])).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForAllTypeNamesExcludeTypeNames:', () => {
    const regexpForAllTypeNamesExcludeTypeNames = TypeFieldName.regexpForAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`TypeFieldNames.matchAndConfigureAllTypeNamesExcludeTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllTypeNamesExcludeTypeNames = TypeFieldName.matchAndConfigureAllTypeNamesExcludeTypeNames;

    it.each([Droid, Starship])(
      '%s will match but it will not be configured because it was specified in the exclusion list of TypeNames',
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllTypeNamesExcludeTypeNames(pattern, typeName);

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(false);
      }
    );

    it.each([Human, Movie])(
      '%s will match and it will be configured because it was not specified in the exclusion list of TypeNames',
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllTypeNamesExcludeTypeNames(pattern, typeName);

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(true);
      }
    );
  });
});
//#endregion

//#region `'TypeName.[fieldNames];'`
describe('Configuring specific fields of a specific Graphql Type:', () => {
  const [patternIndex, pattern] = validPatterns[3];

  describe('TypeFieldName.buildFieldNamesOfTypeName:', () => {
    const buildFieldNamesOfTypeName = TypeFieldName.buildFieldNamesOfTypeName;
    describe('builds the expected pattern given an array where each element is a tuple allowing you to compose:', () => {
      it('1. individually: where the first tuple element is the TypeName and the second contains a list of FieldNames of that TypeName', () => {
        const _pattern = buildFieldNamesOfTypeName([
          [Droid, [id, name, friends]], // individual
          [Human, [id, name, title]], // individual
          [Starship, [name, length]], // individual
        ]);

        expect(_pattern).toBe(pattern);
      });

      it('2. shared: where the first tuple element is a list of TypeNames and the second is a list of FieldNames common to all the TypeNames in the first element', () => {
        expect(
          buildFieldNamesOfTypeName([
            [[Droid, Human], id], // shared
            [[Droid, Human, Starship], [name]], // shared
            [Starship, [length]], //shared,just with nobody
            [Droid, friends], //shared,just with nobody
            [Human, title], //shared,just with nobody
          ])
        ).toBe(pattern);
      });

      it('3. combined: where the first tuple element is a single/list of TypeNames and the second is a list of FieldNames common to only/all of the TypeNames in the first element', () => {
        expect(
          buildFieldNamesOfTypeName([
            [Droid, [id, name, friends]], // individual
            [Human, id], // individual
            [[Human, Starship], [name]], // shared
            [Human, [title]], // individual
            [Starship, length], // individual
          ])
        ).toBe(pattern);
      });
    });
  });

  describe('TypeFieldName.regexpForFieldNamesOfTypeName:', () => {
    const regexpForFieldNamesOfTypeName = TypeFieldName.regexpForFieldNamesOfTypeName;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForFieldNamesOfTypeName, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureFieldNamesOfTypeName: using pattern: '${pattern}'`, () => {
    const matchAndConfigureFieldNamesOfTypeName = TypeFieldName.matchAndConfigureFieldNamesOfTypeName;

    it.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],
      [Human, id],
      [Human, name],
      [Human, title],
      [Starship, name],
      [Starship, length],
    ])('%s.%s will match and it will be configured because it was specified in the pattern', (typeName, fieldName) => {
      const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfTypeName(pattern, typeName, fieldName);

      expect(matchFound).toBe(true);
      expect(shouldBeConfigure).toBe(true);
    });

    it.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],
      [Starship, id],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Human, friends],
      [Human, friend],
      [Human, episode],
      [Human, length],
      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      '%s.%s will not match neither will it be configured because it was not specified in the pattern',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfTypeName(pattern, typeName, fieldName);

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(false);
      }
    );
  });
});
//#endregion

//#region `'TypeName.@*FieldNames;'`
describe('Configuring all fields of a specific Graphql Type:', () => {
  const [patternIndex, pattern] = validPatterns[4];

  describe('TypeFieldName.buildAllFieldNamesOfTypeName:', () => {
    const buildAllFieldNamesOfTypeName = TypeFieldName.buildAllFieldNamesOfTypeName;
    it('builds the expected pattern for each TypeName in a list of TypeNames:', () => {
      expect(buildAllFieldNamesOfTypeName([Droid, Movie])).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForAllFieldNamesOfTypeName:', () => {
    const regexpForAllFieldNamesOfTypeName = TypeFieldName.regexpForAllFieldNamesOfTypeName;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesOfTypeName, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureAllFieldNamesOfTypeName: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllFieldNamesOfTypeName = TypeFieldName.matchAndConfigureAllFieldNamesOfTypeName;

    it.each([Droid, Movie])(
      '%s will match and it will be configured because it was specified in the pattern',
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesOfTypeName(pattern, typeName);

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(true);
      }
    );

    it.each([Starship, Human])(
      '%s will not match neither will it be configured because it was not specified in the pattern',
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesOfTypeName(pattern, typeName);

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(false);
      }
    );
  });
});
//#endregion

//#region `'TypeName.@*FieldNames-[excludeFieldNames];'`
describe('Configuring all fields except those specified in the exclusion list of FieldNames for a specific GraphQL Type:', () => {
  const [patternIndex, pattern] = validPatterns[5];

  describe('TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName:', () => {
    const buildAllFieldNamesExcludeFieldNamesOfTypeName = TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName;
    describe('builds the expected pattern given an array where each element is a tuple allowing you to compose:', () => {
      it('1. individually: where the first tuple element is the TypeName and the second contains a list of FieldNames of that TypeName', () => {
        const _pattern = buildAllFieldNamesExcludeFieldNamesOfTypeName([
          [Droid, [id, name, friends]], // individual
          [Human, [id, name, title]], // individual
          [Starship, [name, length]], // individual
        ]);

        expect(_pattern).toBe(pattern);
      });

      it('2. shared: where the first tuple element is a list of TypeNames and the second is a list of FieldNames common to all the TypeNames in the first element', () => {
        expect(
          buildAllFieldNamesExcludeFieldNamesOfTypeName([
            [[Droid, Human], id], // shared
            [[Droid, Human, Starship], [name]], // shared
            [Starship, [length]], //shared,just with nobody
            [Droid, friends], //shared,just with nobody
            [Human, title], //shared,just with nobody
          ])
        ).toBe(pattern);
      });

      it('3. combined: where the first tuple element is a single/list of TypeNames and the second is a list of FieldNames common to only/all of the TypeNames in the first element', () => {
        expect(
          buildAllFieldNamesExcludeFieldNamesOfTypeName([
            [Droid, [id, name, friends]], // individual
            [Human, id], // individual
            [[Human, Starship], [name]], // shared
            [Human, [title]], // individual
            [Starship, length], // individual
          ])
        ).toBe(pattern);
      });
    });
  });

  describe('TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfTypeName:', () => {
    const regexpForAllFieldNamesExcludeFieldNamesOfTypeName =
      TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfTypeName;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesExcludeFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesExcludeFieldNamesOfTypeName, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName =
      TypeFieldName.matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName;

    it.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],
      [Starship, id],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Human, friends],
      [Human, friend],
      [Human, episode],
      [Human, length],
    ])(
      '%s.%s will not match but it will be configured because it was not specified in the exclusion list of FieldNames',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName(
          pattern,
          typeName,
          fieldName
        );

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(true);
      }
    );

    it.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],
      [Human, id],
      [Human, name],
      [Human, title],
      [Starship, name],
      [Starship, length],
    ])(
      '%s.%s will match but it will not be configured because it was specified in the exclusion list of FieldNames',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName(
          pattern,
          typeName,
          fieldName
        );

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(false);
      }
    );

    it.each([
      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      '%s.%s will not match neither will it be configured because `Movie` was not specified in the pattern',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName(
          pattern,
          typeName,
          fieldName
        );

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(false);
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames.[fieldNames];'`
describe('Configuring specific fields for all Graphql Types:', () => {
  const [patternIndex, pattern] = validPatterns[6];

  describe('TypeFieldName.buildFieldNamesOfAllTypeNames:', () => {
    const buildFieldNamesOfAllTypeNames = TypeFieldName.buildFieldNamesOfAllTypeNames;
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(buildFieldNamesOfAllTypeNames([id, name, friends])).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForFieldNamesOfAllTypeNames:', () => {
    const regexpForFieldNamesOfAllTypeNames = TypeFieldName.regexpForFieldNamesOfAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForFieldNamesOfAllTypeNames.source).toBe(
        /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForFieldNamesOfAllTypeNames, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureFieldNamesOfAllTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureFieldNamesOfAllTypeNames = TypeFieldName.matchAndConfigureFieldNamesOfAllTypeNames;

    it.each([id, name, friends])(
      '%s will match and it will be configured because it was specified in the list of FieldNames',
      fieldName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfAllTypeNames(pattern, fieldName);

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(true);
      }
    );

    it.each([friend, title, episode, length])(
      '%s will not match neither will it be configured because it was not specified in the list of FieldNames',
      fieldName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfAllTypeNames(pattern, fieldName);

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(false);
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames.@*FieldNames;'`
describe('Configuring all fields for all Graphql Types:', () => {
  const [patternIndex, pattern] = validPatterns[7];
  const invalidPattern = '@*TypeNames@*FieldNames;'; // missing a dot

  describe('TypeFieldName.buildAllFieldNamesOfAllTypeNames:', () => {
    const buildAllFieldNamesOfAllTypeNames = TypeFieldName.buildAllFieldNamesOfAllTypeNames;
    describe('builds the expected pattern:', () => {
      expect(buildAllFieldNamesOfAllTypeNames()).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForAllFieldNamesOfAllTypeNames:', () => {
    const regexpForAllFieldNamesOfAllTypeNames = TypeFieldName.regexpForAllFieldNamesOfAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesOfAllTypeNames.source).toBe(/@\*TypeNames\.@\*FieldNames;/gim.source);
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesOfAllTypeNames, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureAllFieldNamesOfAllTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllFieldNamesOfAllTypeNames = TypeFieldName.matchAndConfigureAllFieldNamesOfAllTypeNames;

    it('%s will match and it will be configured because the pattern is valid', () => {
      const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesOfAllTypeNames(pattern);

      expect(matchFound).toBe(true);
      expect(shouldBeConfigure).toBe(true);
    });

    it('%s will not match neither will it be configured because the pattern is invalid', () => {
      const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesOfAllTypeNames(invalidPattern);

      expect(matchFound).toBe(false);
      expect(shouldBeConfigure).toBe(false);
    });
  });
});
//#endregion

//#region `'@*TypeNames.@*FieldNames-[excludeFieldNames];'`
describe('Configuring all fields except those specified in the exclusion list of FieldNames for all GraphQL Types:', () => {
  const [patternIndex, pattern] = validPatterns[8];

  describe('TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfAllTypeNames:', () => {
    const buildAllFieldNamesExcludeFieldNamesOfAllTypeNames =
      TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfAllTypeNames;
    describe('builds the expected pattern:', () => {
      expect(buildAllFieldNamesExcludeFieldNamesOfAllTypeNames([id, name, friends])).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames:', () => {
    const regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames =
      TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames.source).toBe(
        /@\*TypeNames\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames =
      TypeFieldName.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames;

    it.each([id, name, friends])(
      '%s will match but it will not be configured because it was specified in the exclusion list of FieldNames',
      fieldName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames(
          pattern,
          fieldName
        );

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(false);
      }
    );

    it.each([friend, title, episode, length])(
      '%s will not match but it will be configured because it was not specified in the exclusion list of FieldNames',
      fieldName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames(
          pattern,
          fieldName
        );

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(true);
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames].[fieldNames];'`
describe('Configuring specific fields of all GraphQL Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, pattern] = validPatterns[9];

  describe('TypeFieldName.buildFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const buildFieldNamesOfAllTypeNamesExcludeTypeNames = TypeFieldName.buildFieldNamesOfAllTypeNamesExcludeTypeNames;
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(buildFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human], [id, name, friends])).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const regexpForFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForFieldNamesOfAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForFieldNamesOfAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames;

    it.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],
      [Human, id],
      [Human, name],
      [Human, friends],
    ])(
      '%s.%s will match because the TypeName was specified in the exclusion list of TypeNames and the FieldName was specified in the list of FieldNames but it will not be configured because the TypeName was specified in the exclusion list of TypeNames',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName,
          fieldName
        );

        expect(matchFound).toBe(true);
        expect(shouldBeConfigure).toBe(false);
      }
    );

    it.each([
      [Starship, id],
      [Starship, name],
      [Starship, friends],
      [Movie, id],
      [Movie, name],
      [Movie, friends],
    ])(
      '%s.%s will not match because the TypeName was not specified in the exclusion list of TypeNames but it will it be configured because the TypeName was not specified in the exclusion list of TypeNames and the FieldName was specified in the list of FieldNames',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName,
          fieldName
        );

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(true);
      }
    );

    it.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],
      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],
    ])(
      '%s.%s will not match neither will it be configured because the FieldName was not specified in the list of FieldNames',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName,
          fieldName
        );

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(false);
      }
    );

    it.each([
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      '%s.%s will not match because the TypeName was not specified in the exclusion list of TypeNames and the FieldName was not specified in the list of FieldNames neither will it be configured the FieldName was not specified in the list of FieldNames',
      (typeName, fieldName) => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName,
          fieldName
        );

        expect(matchFound).toBe(false);
        expect(shouldBeConfigure).toBe(false);
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames].@*FieldNames;'`
describe('Configuring all fields of all GraphQL Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, pattern] = validPatterns[10];

  describe('TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const buildAllFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.buildAllFieldNamesOfAllTypeNamesExcludeTypeNames;
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(buildAllFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human])).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames;

    describe.each([Droid, Human])(
      `%s will match but it will not be configured: using pattern: '${pattern}'`,
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName
        );

        it(`will match because '${typeName.value}' was specified in the pattern`, () => {
          expect(matchFound).toBe(true);
        });

        it(`will not be configured match because the pattern excludes '${typeName.value}'`, () => {
          expect(shouldBeConfigure).toBe(false);
        });
      }
    );

    describe.each([Starship, Movie])(
      `%s will not match but it will be configured: using pattern: '${pattern}'`,
      typeName => {
        const { matchFound, shouldBeConfigure } = matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName
        );

        it(`will not match because '${typeName.value}' was not specified in the pattern`, () => {
          expect(matchFound).toBe(false);
        });

        it(`will be configured match because the pattern includes '${typeName.value}'`, () => {
          expect(shouldBeConfigure).toBe(true);
        });
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames].@*FieldNames-[excludeFieldNames];'`
describe('Configuring all fields except those specified in the exclusion list of FieldNames of all GraphQL Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, pattern] = validPatterns[11];

  describe('TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(
        buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human], [id, name, friends])
      ).toBe(pattern);
    });
  });

  describe('TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`TypeFieldName.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames: using pattern: '${pattern}'`, () => {
    const matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
      TypeFieldName.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;

    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],

      [Human, id],
      [Human, name],
      [Human, friends],
    ])(`%s.%s will match but it will not be configured: using pattern: '${pattern}'`, (typeName, fieldName) => {
      const { matchFound, shouldBeConfigure } =
        matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(pattern, typeName, fieldName);

      it(`will match because when expanded, '${typeName.value}.${fieldName.value}' was specified in the pattern`, () => {
        expect(matchFound).toBe(true);
      });

      it(`will not be configured because when expanded, the pattern excludes '${typeName.value}.${fieldName.value}'`, () => {
        expect(shouldBeConfigure).toBe(false);
      });
    });

    describe.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, id],
      [Starship, name],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(`%s.%s will not match but it will be configured: using pattern: ${pattern}`, (typeName, fieldName) => {
      const { matchFound, shouldBeConfigure } =
        matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(pattern, typeName, fieldName);

      it(`will not match because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
        expect(matchFound).toBe(false);
      });

      it(`will be configured because when expanded, the pattern includes '${typeName.value}.${fieldName.value}'`, () => {
        expect(shouldBeConfigure).toBe(true);
      });
    });
  });
});
//#endregion
