import { FieldName, TypeFieldName, TypeName } from '../src/config/type-field-name';
import { TypeFieldNamePatterns } from '../src/config/plugin-config';

// helper function that indexes the array passed to `.each `method of `describe`, `test` and `it`
const indexArray = <T extends [...any]>(arr: T[]): [index: number, ...rest: T][] => arr.map((el, i) => [i, ...el]);
test('helper method: indexArray(arr[][]): returns a new array where the first element it the index of the old array element', () => {
  expect(indexArray([['a'], ['b']])).toMatchObject([
    [0, 'a'],
    [1, 'b'],
  ]);

  expect(indexArray([['buildTypeNames', ['Droid,Starship'], 'Droid;Starship;']])).toMatchObject([
    [0, 'buildTypeNames', ['Droid,Starship'], 'Droid;Starship;'],
  ]);
});
describe("integrity checks: ensures that these values don't change and if they are updated accordingly", () => {
  describe('integrity check: all Regular Expressions are accounted for', () => {
    // Hard coded for integrity purposes. Update this if more Regexp are added
    const regexpCount = 12;

    const definedRegexps = Object.getOwnPropertyNames(TypeFieldName).filter(
      property => TypeFieldName[property] instanceof RegExp
    );

    expect(definedRegexps.length).toBe(regexpCount);

    const mockedTypeFieldNameRegExp = jest.fn((regexpName: string): RegExp => TypeFieldName[regexpName]);

    test.each([
      // [regExpName, RegExp]
      ['regexpForTypeNames', /\b(?!TypeNames|FieldNames\b)(?<typeNamePattern>\w+;)/gim],
      ['regexpForAllTypeNames', /(?<allTypeNames>@\*TypeNames;)/gm],
      ['regexpForAllTypeNamesExcludeTypeNames', /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\];/gim],
      [
        'regexpForFieldNamesOfTypeName',
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim,
      ],
      ['regexpForAllFieldNamesOfTypeName', /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim],
      [
        'regexpForAllFieldNamesExcludeFieldNamesOfTypeName',
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<excludeFieldNames>(\w+,?\s*)*)\];/gim,
      ],
      ['regexpForFieldNamesOfAllTypeNames', /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim],
      ['regexpForAllFieldNamesOfAllTypeNames', /@\*TypeNames\.@\*FieldNames;/gim],
      [
        'regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames',
        /@\*TypeNames\.@\*FieldNames-\[\s*(?<excludeFieldNames>(\w+,?\s*)*)\];/gim,
      ],
      [
        'regexpForFieldNamesOfAllTypeNamesExcludeTypeNames',
        /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim,
      ],
      [
        'regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames',
        /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim,
      ],
      [
        'regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
        /@\*TypeNames-\[\s*(?<excludeTypeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<excludeFieldNames>(\w+,?\s*)*)\];/gim,
      ],
    ])('%s is accounted for', (regexpName, expectedRegexp) => {
      expect(mockedTypeFieldNameRegExp(regexpName).source).toBe(expectedRegexp.source);
    });
  });
});

describe('pattern builders: builder methods return a valid TypeFieldNamePattern', () => {
  // Hard coded for integrity purposes. Update this if more pattern builders are added
  const patternBuildersCount = 12;

  const definedPatternBuilders = Object.getOwnPropertyNames(TypeFieldName).filter(
    method => method.startsWith('build') && typeof TypeFieldName[method] === 'function'
  );

  expect(definedPatternBuilders.length).toBe(patternBuildersCount);

  const mockedTypeFieldNamePatternBuilder = jest.fn(
    (method: string): ((...args: any) => string) => TypeFieldName[method]
  );

  test.each([
    // [builderMethod , [...args], expectedPattern]
    ['buildTypeNames', ['Droid,Starship'], 'Droid;Starship;'],
    ['buildAllTypeNames', [], '@*TypeNames;'],
    ['buildAllTypeNamesExcludeTypeNames', ['Droid, Starship'], '@*TypeNames-[Droid,Starship];'],
    ['buildFieldNamesOfTypeName', ['Droid', 'id, name'], 'Droid.[id,name];'],
    ['buildAllFieldNamesOfTypeName', ['Droid'], 'Droid.@*FieldNames;'],
    ['buildAllFieldNamesExcludeFieldNamesOfTypeName', ['Droid', 'id, name'], 'Droid.@*FieldNames-[id,name];'],
    ['buildFieldNamesOfAllTypeNames', ['id, name'], '@*TypeNames.[id,name];'],
    ['buildAllFieldNamesOfAllTypeNames', [], '@*TypeNames.@*FieldNames;'],
    ['buildAllFieldNamesExcludeFieldNamesOfAllTypeNames', ['id, name'], '@*TypeNames.@*FieldNames-[id,name];'],
    [
      'buildFieldNamesOfAllTypeNamesExcludeTypeNames',
      ['Droid, Starship', 'id, name'],
      '@*TypeNames-[Droid,Starship].[id,name];',
    ],
    [
      'buildAllFieldNamesOfAllTypeNamesExcludeTypeNames',
      ['Droid, Starship'],
      '@*TypeNames-[Droid,Starship].@*FieldNames;',
    ],
    [
      'buildAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
      ['Droid, Starship', 'id, name'],
      '@*TypeNames-[Droid,Starship].@*FieldNames-[id,name];',
    ],
  ])('%s returns the expected pattern', (method, args, expectedPattern) => {
    expect(mockedTypeFieldNamePatternBuilder(method)(...args)).toBe(expectedPattern);
  });
});

describe('pattern matchers: return a boolean if the given args are found within the pattern', () => {
  // Hard coded for integrity purposes. Update this if more pattern builders are added
  // The following patterns: `@*TypeNames;` and `@*TypeNames.@*FieldNames;` don't have matches because they don't accept any args.
  //  Their RegExp can be used to test if a string matches their pattern
  const patternBuildersCount = 10;

  const definedPatternMatchers = Object.getOwnPropertyNames(TypeFieldName).filter(
    method => method.startsWith('matches') && typeof TypeFieldName[method] === 'function'
  );

  // const testedPatternMatchers: string[] = [];

  // console.log(definedPatternMatchers);

  expect(definedPatternMatchers.length).toBe(patternBuildersCount);

  const Droid = TypeName.fromString('Droid');
  const Starship = TypeName.fromString('Starship');
  const Human = TypeName.fromString('Human');
  const Movie = TypeName.fromString('Movie');

  const id = FieldName.fromString('id');
  const name = FieldName.fromString('name');
  // const friends = FieldName.fromString('friends');
  const friend = FieldName.fromString('friend');
  // const title = FieldName.fromString('title');
  // const episode = FieldName.fromString('episode');

  const mockedTypeFieldNameMatcher = jest.fn(
    (matcher: string, ...args: any): ((typeFieldNamePatterns: TypeFieldNamePatterns, ...args: any) => boolean) =>
      TypeFieldName[matcher](...args)
  );

  // automated tests, ensures that all matchers are called

  const cases: [
    matcher: string,
    typeFieldNamePattern: string,
    description: string,
    testEachCases: [expected: boolean, title: string, args: any[]][]
  ][] = [
    [
      'matchesTypeNames',
      'Droid;Starship;',
      'returns a boolean if the given `typeName` is found within the pattern:',
      [
        [true, '`Droid` is found in the pattern', [Droid]],
        [true, '`Starship` is found in the pattern', [Starship]],
        [false, '`Human` is not found in the pattern', [Human]],
        [false, '`Movie` is not found in the pattern', [Movie]],
      ],
    ],
    [
      'matchesAllTypeNamesExcludeTypeNames',
      '@*TypeNames-[Droid,Starship];',
      'returns a boolean if the given `typeNames` are excluded in the pattern',
      [
        [true, '`Droid` is excluded in the pattern', [Droid]],
        [true, '`Starship` is excluded in the pattern', [Starship]],
        [false, '`Human` is not excluded in the pattern', [Human]],
        [false, '`Movie` is not excluded in the pattern', [Movie]],
      ],
    ],
    [
      'matchesFieldNamesOfTypeName',
      'Droid.[id,name,friends];Movie.[title];',
      'returns a boolean if the given `fieldNames` of `typeName` are found within the pattern',
      [
        // [true, '`id` was specified as a field of `Droid` in the pattern', [Droid, id]],
        // [true, '`name` was specified as a field of `Droid` in the pattern', [Droid, name]],
        // [true, '`friends` was specified as a field of `Droid` in the pattern', [Droid, friends]],
        // [false, '`friend` was not specified as a field of `Droid` in the pattern', [Droid, friend]],
        // [false, '`title` was not specified as a field of `Droid` in the pattern', [Droid, title]],
        // [true, '`title` was specified as a field of `Movie` in the pattern', [Movie, title]],
        // [
        //   true,
        //   'one of the fieldNames given: `title` was specified as a field of `Movie` in the pattern',
        //   [Movie, [title, episode]],
        // ],
        [true, 'all fieldNames given were specified for the `Droid` type', [Droid, [name, id], true]],
        [
          false,
          '`friend` was not specified as a fieldName of `Droid`. `matchAllFieldNames` ensures that all `fieldNames` given were specified for the given `typeName`',
          [Droid, [name, id, friend], true],
        ],
      ],
    ],
    // ['matchesAllFieldNamesOfTypeName', '', '', [[true, '', []]]],
    // ['matchesAllFieldNamesExcludeFieldNamesOfTypeName', '', '', [[true, '', []]]],
    // ['matchesFieldNamesOfAllTypeNames', '', '', [[true, '', []]]],
    // ['matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames', '', '', [[true, '', []]]],
    // ['matchesFieldNamesOfAllTypeNamesExcludeTypeNames', '', '', [[true, '', []]]],
    // ['matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames', '', '', [[true, '', []]]],
    // ['matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames', '', '', [[true, '', []]]],
  ];

  describe.each(indexArray(cases))(
    '%i. TypeFieldName.%s: given the pattern: `%s` %s',
    (_index, matcher, typeFieldNamePattern, _description, testEachCases) => {
      it.each(testEachCases)('returns `%s` because %s', (expected, _title, args) => {
        expect(mockedTypeFieldNameMatcher(matcher, typeFieldNamePattern, ...args)).toBe(expected);
      });
    }
  );

  /*   describe.each(
    indexArray([
      // ['matcherMethod', 'typeFieldNamePattern','description', [expected]
      ['matchesTypeNames', 'Droid;Starship;', [[Droid], [Starship]], [[Human], [Movie]]],
      [
        'matchesAllTypeNamesExcludeTypeNames',
        '',
        [[Droid], [Starship]],
        [[Human], [Movie]],
      ],
      [
        'matchesFieldNamesOfTypeName',
        '
        [
          [Movie, title],
          [Droid, id],
          [Droid, name],
          [Droid, friends],
          // `matchAllFieldNames` defaults to `false`
          [Droid, [id, friends, name]],
          // Even though the field `friend` is not found in the pattern,
          // this will still returns true because `matchAllFieldName` defaults to false
          // and some fields(`id` and `name`)  given were found in pattern
          [Droid, [id, friend, name]],
          // returns true because `matchAllFieldNames` set to `true`
          // and all fields given are found in pattern
          [Droid, [id, friends, name], true],
        ],
        [
          [Droid, friend],
          [Starship, id],
          // returns `false` because `matchAllFieldNames` set to `true`
          // but not all the fields given were found in the pattern.
          // The pattern contains `friends` but not `friend`
          [Droid, [id, friend, name], true],
          // Returns `false` because:
          // Even though the pattern does contain `title`,
          // it was not specified on the `Droid` typeName
          [Droid, title],
          // returns false because `matchAllFieldNames` set to `true`
          // and not all the fields given were found in the pattern
          [Droid, [id, friends, name, title], true],
          // returns false because not all the fieldNames in the pattern was given
          // missing `id` and `friends`
          // [Droid, [name], true],
        ],
      ],
      [
        'matchesAllFieldNamesOfTypeName',
        'Movie.@*FieldNames;Starship.@*FieldNames;',
        [[Starship], [Movie]],
        [[Human], [Droid]],
      ],
      [
        'matchesAllFieldNamesExcludeFieldNamesOfTypeName',
        'Movie.@*FieldNames-[id,name,];Droid.@*FieldNames-[id];',
        [
          [Movie, id],
          [Droid, id],
          [Movie, name],
        ],
        [
          [Movie, title],
          [Droid, name],
          [Starship, id],
        ],
      ],
      // 'matchesFieldNamesOfAllTypeNames',
      // 'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames',
      // 'matchesFieldNamesOfAllTypeNamesExcludeTypeNames',
      // 'matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames',
      // 'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
    ])
  )('%i. TypeFieldName.%s(...): ', (index, matcher, typeFieldNamePattern, trueArgs, falseArgs) => {
 
    it.each(falseArgs)(`returns \`false\` given the following args: '${typeFieldNamePattern}', %s %s %s`, (...args) => {
      expect(mockedTypeFieldNameMatcher(matcher, typeFieldNamePattern, ...args)).toBe(false);
    });

    test('matcher is tested in order as defined in TypeFieldName', () => {
      expect(definedPatternMatchers.includes(matcher)).toBe(true);
      expect(definedPatternMatchers.includes(matcher)).toBe(true);
      expect(definedPatternMatchers[index]).toBe(matcher);
      // if none of the expectations above fails...
      testedPatternMatchers.push(matcher);
    });
  }); */

  // old version
  /*   describe.each(
    indexArray([
      // [matcherMethod, typeFieldNamePattern, argsThatReturnsTrue[], argsThatReturnsFalse[]]
      ['matchesTypeNames', 'Droid;Starship;', [[Droid], [Starship]], [[Human], [Movie]]],
      [
        'matchesAllTypeNamesExcludeTypeNames',
        '@*TypeNames-[Droid,Starship];',
        [[Droid], [Starship]],
        [[Human], [Movie]],
      ],
      [
        'matchesFieldNamesOfTypeName',
        'Droid.[id,name,friends];Movie.[title];',
        [
          [Movie, title],
          [Droid, id],
          [Droid, name],
          [Droid, friends],
          // `matchAllFieldNames` defaults to `false`
          [Droid, [id, friends, name]],
          // Even though the field `friend` is not found in the pattern,
          // this will still returns true because `matchAllFieldName` defaults to false
          // and some fields(`id` and `name`)  given were found in pattern
          [Droid, [id, friend, name]],
          // returns true because `matchAllFieldNames` set to `true`
          // and all fields given are found in pattern
          [Droid, [id, friends, name], true],
        ],
        [
          [Droid, friend],
          [Starship, id],
          // returns `false` because `matchAllFieldNames` set to `true`
          // but not all the fields given were found in the pattern.
          // The pattern contains `friends` but not `friend`
          [Droid, [id, friend, name], true],
          // Returns `false` because:
          // Even though the pattern does contain `title`,
          // it was not specified on the `Droid` typeName
          [Droid, title],
          // returns false because `matchAllFieldNames` set to `true`
          // and not all the fields given were found in the pattern
          [Droid, [id, friends, name, title], true],
          // returns false because not all the fieldNames in the pattern was given
          // missing `id` and `friends`
          // [Droid, [name], true],
        ],
      ],
      [
        'matchesAllFieldNamesOfTypeName',
        'Movie.@*FieldNames;Starship.@*FieldNames;',
        [[Starship], [Movie]],
        [[Human], [Droid]],
      ],
      [
        'matchesAllFieldNamesExcludeFieldNamesOfTypeName',
        'Movie.@*FieldNames-[id,name,];Droid.@*FieldNames-[id];',
        [
          [Movie, id],
          [Droid, id],
          [Movie, name],
        ],
        [
          [Movie, title],
          [Droid, name],
          [Starship, id],
        ],
      ],
      // 'matchesFieldNamesOfAllTypeNames',
      // 'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames',
      // 'matchesFieldNamesOfAllTypeNamesExcludeTypeNames',
      // 'matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames',
      // 'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
    ])
  )('%i. TypeFieldName.%s(...): ', (index, matcher, typeFieldNamePattern, trueArgs, falseArgs) => {
    it.each(trueArgs)(`returns \`true\` given the following args: '${typeFieldNamePattern}', %s, %s %s`, (...args) => {
      expect(mockedTypeFieldNameMatcher(matcher, typeFieldNamePattern, ...args)).toBe(true);
    });

    it.each(falseArgs)(`returns \`false\` given the following args: '${typeFieldNamePattern}', %s %s %s`, (...args) => {
      expect(mockedTypeFieldNameMatcher(matcher, typeFieldNamePattern, ...args)).toBe(false);
    });

    test('matcher is tested in order as defined in TypeFieldName', () => {
      expect(definedPatternMatchers.includes(matcher)).toBe(true);
      expect(definedPatternMatchers.includes(matcher)).toBe(true);
      expect(definedPatternMatchers[index]).toBe(matcher);
      // if none of the expectations above fails...
      testedPatternMatchers.push(matcher);
    });
  }); */

  test('all defined matchers were tested', () => {
    // expect(definedPatternMatchers).toMatchObject(testedPatternMatchers);
  });

  // manual tests
  /* describe('TypeFieldName.matchesTypeNames(...): returns ', () => {
      const typeFieldNamePattern = 'Droid;Starship;';
      it.each([Droid, Starship])('`true` if pattern includes TypeName', typeName => {
        expect(mockedTypeFieldNameMatcher('matchesTypeNames')(typeFieldNamePattern, typeName)).toBe(true);
        expect(mockedTypeFieldNameMatcher).toBeCalledWith(definedPatternMatchers[0]);
      });
      it.each([Human, Movie])('`false` if pattern does not include TypeName', typeName => {
        expect(mockedTypeFieldNameMatcher('matchesTypeNames')(typeFieldNamePattern, typeName)).toBe(false);
        expect(mockedTypeFieldNameMatcher).toBeCalledWith(definedPatternMatchers[0]);
      });
    }); */
});
