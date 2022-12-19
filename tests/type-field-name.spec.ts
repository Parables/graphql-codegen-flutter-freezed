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
  console.log('🚀 ~ file: type-field-name.spec.ts:121 ~ describe ~ definedPatternMatchers', definedPatternMatchers);

  // const testedPatternMatchers: string[] = [];

  expect(definedPatternMatchers.length).toBe(patternBuildersCount);

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

  const mockedTypeFieldNameMatcher = jest.fn(
    (matcher: string, ...args: any): ((typeFieldNamePatterns: TypeFieldNamePatterns, ...args: any) => boolean) =>
      TypeFieldName[matcher](...args)
  );

  const matchAllTypeNamesFalse =
    'is set to `false`(default), the matcher will return `true` if `some` of the `typeNames` given were specified in the pattern.';
  const matchAllFieldNamesFalse =
    'is set to `false`(default), the matcher will return `true` if `some` of the `fieldNames` given were specified in the pattern.';

  const matchAllFieldNamesTrue =
    'is set to `true`, the matcher will return `true` if `all` of the `fieldNames` given were specified in the pattern.';
  const matchAllTypeNamesTrue =
    'is set to `true`, the matcher will return `true` if `all` of the `typeNames` given were specified in the pattern.';
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
      'returns true if the typeName given was specified in the pattern, otherwise false',
      [
        [true, '`Droid` was specified in the pattern', [Droid]],
        [true, '`Starship` was specified in the pattern', [Starship]],
        [false, '`Human` was given but was not specified in the pattern', [Human]],
        [false, '`Movie` was given but was not specified in the pattern', [Movie]],
      ],
    ],
    [
      'matchesAllTypeNamesExcludeTypeNames',
      '@*TypeNames-[Droid,Starship];',
      'returns true if the typeNames given were specified in the exclusion list of typeNames in the pattern, otherwise false. If `matchAllTypeNames` ' +
        matchAllTypeNamesFalse +
        ' else if `matchAllTypeNames` ' +
        matchAllTypeNamesTrue,
      [
        [true, '`Droid` is in the exclusion list of typeNames in the pattern', [Droid]],
        [true, '`Starship` is in the exclusion list of typeNames in the pattern', [Starship]],
        [false, '`Human` is not in the exclusion list of typeNames in the pattern', [Human]],
        [false, '`Movie` is not in the exclusion list of typeNames in the pattern', [Movie]],
        [
          false,
          'one of the given typeName: `Movie` is not in the exclusion list of typeNames in the pattern',
          [[Droid, Movie], true],
        ],
      ],
    ],
    [
      'matchesFieldNamesOfTypeName',
      'Droid.[id,name,friends];Movie.[title];',
      'returns true if the fieldNames given were specified in the list of fieldNames for the typeName given in the pattern, otherwise false. If `matchAllFieldNames` ' +
        matchAllFieldNamesFalse +
        ' else if `matchAllFieldNames` ' +
        matchAllFieldNamesTrue,
      [
        [true, '`id` was specified in the list of fieldNames for `Droid` in the pattern', [Droid, id]],
        [true, '`name` was specified in the list of fieldNames for `Droid` in the pattern', [Droid, name]],
        [true, '`friends` was specified in the list of fieldNames for `Droid` in the pattern', [Droid, friends]],
        [false, '`friend` was not specified in the list of fieldNames for `Droid` in the pattern', [Droid, friend]],
        [false, '`title` was not specified in the list of fieldNames for `Droid` in the pattern', [Droid, title]],
        [true, '`title` was specified in the list of fieldNames for `Movie` in the pattern', [Movie, title]],
        [false, '`id` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, id]],
        [false, '`name` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, name]],
        [false, '`friends` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, friends]],
        [false, '`friend` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, friend]],
        [
          true,
          'one of the fieldNames given: `title` was specified in the list of fieldNames for `Movie` in the pattern.',
          [Movie, [title, episode]],
        ],
        [
          true,
          'all fieldNames given were specified in the list of fieldNames for `Droid` in the pattern.',
          [Droid, [name, id], true],
        ],
        [
          true,
          'all fieldNames given were specified in the list of fieldNames for `Droid` in the pattern.',
          [Droid, [name, id, friends], true],
        ],
        [
          false,
          'one of the fieldNames given: `friend` was not specified in the list of fieldNames for `Droid` in the pattern.',
          [Droid, [name, id, friend], true],
        ],
        [
          false,
          'one of the fieldNames given: `friend` was not specified in the list of fieldNames for `Droid` in the pattern.',
          [Droid, [name, id, friend, friends], true],
        ],
      ],
    ],
    [
      'matchesAllFieldNamesOfTypeName',
      'Movies.@*FieldNames;Droid.@*FieldNames;Starship;',
      'returns a boolean if the `typeName` given was specified in the pattern. Since the pattern contains `@*FieldNames`,this matcher does not require a `fieldName` parameter',
      [
        [true, '`Droid` was specified as a `typeName` in the pattern', [Droid]],
        [false, '`Movie` was given but `Movies` was specified in the pattern', [Movie]],
        [
          false,
          'even though `Starship` was specified as a `typeName` in the pattern, it is not a valid pattern for allFieldNames which must end with `.@*FieldNames;`',
          [Starship],
        ],
      ],
    ],
    [
      'matchesAllFieldNamesExcludeFieldNamesOfTypeName',
      'Movie.@*FieldNames-[id];Droid.@*FieldNames-[name];',
      'returns a boolean if fieldNames given were specified in the exclusion list of fieldNames for the typeName given in the pattern. If `matchAllFieldNames` ' +
        matchAllFieldNamesFalse +
        ' else if `matchAllFieldNames` ' +
        matchAllFieldNamesTrue,
      [
        [true, '`id` was specified in the exclusion list of fieldNames for `Movie` in the pattern', [Movie, id]],
        [
          false,
          '`title` was not specified in the exclusion list of fieldNames for `Movie` in the pattern',
          [Movie, title],
        ],
        [true, '`name` was specified in the exclusion list of fieldNames for `Droid` in the pattern', [Droid, name]],
        [
          true,
          'all of the fieldNames given were specified in the exclusion list of fieldNames for `Movie` in the pattern',
          [Movie, [id], true],
        ],
        [
          false,
          'one of the fieldNames given: `name` was not specified in the exclusion list of fieldNames for `Movie` in the pattern',
          [Movie, [id, name], true],
        ],
        [
          false,
          'one of the fieldNames given: `title` was not specified in the exclusion list of fieldNames for `Movie` in the pattern',
          [Movie, [id, title], true],
        ],
      ],
    ],
    [
      'matchesFieldNamesOfAllTypeNames',
      '@*TypeNames.[id,name];@*TypeNames.[title];',
      'returns a boolean if the `fieldNames` given were specified in the list of fieldNames in the pattern. Since the pattern contains `@*TypeNames`, this matcher does not require a `typeName` parameter. If `matchAllFieldNames` ' +
        matchAllFieldNamesFalse +
        ' else if `matchAllFieldNames` ' +
        matchAllFieldNamesTrue,
      [
        [true, '`id` was specified in the list of fieldNames in the pattern', [id]],
        [true, '`name` was specified in the list of fieldNames in the pattern', [name]],
        [true, '`title` was specified in the list of fieldNames in the pattern', [title]],
        [true, 'all fieldNames were specified in the list of fieldNames in the pattern', [[id, name, title]]],
        [false, '`friends` was not specified in the list of fieldNames in the pattern', [friends]],
        [false, '`friend` was not specified in the list of fieldNames in the pattern', [friend]],
        [
          false,
          'one of the fieldNames given: `friends` was not specified in the list of fieldNames in the pattern',
          [[id, friends], true],
        ],
        [
          false,
          'one of the fieldNames given: `friends` was not specified in the list of fieldNames in the pattern',
          [[id, friends, name, title], true],
        ],
      ],
    ],
    [
      'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames',
      '@*TypeNames.@*FieldNames-[id,name];@*TypeNames.@*FieldNames-[title];',
      'returns a boolean if the fieldNames given were specified in the exclusion list of fieldNames in the pattern. Since the pattern contains `@*TypeNames`, this matcher does not require a `typeName` parameter. If `matchAllFieldNames` ' +
        matchAllFieldNamesFalse +
        ' else if `matchAllFieldNames` ' +
        matchAllFieldNamesTrue,
      [
        [true, '`id` was specified in the exclusion list of fieldNames in the pattern', [id]],
        [true, '`name` was specified in the exclusion list of fieldNames in the pattern', [name]],
        [true, '`title` was specified in the exclusion list of fieldNames in the pattern', [title]],
        [true, 'all fieldNames were specified in the exclusion list of fieldNames in the pattern', [[id, name, title]]],
        [
          false,
          'one of the fieldNames given: `friends` was not specified in the exclusion list of fieldNames in the pattern',
          [friends],
        ],
        [
          false,
          'one of the fieldNames given: `friends` was not specified in the exclusion list of fieldNames in the pattern',
          [[id, friends], true],
        ],
        [
          false,
          'one of the fieldNames given: `friends` was not specified in the exclusion list of fieldNames in the pattern',
          [[id, friends, name, title], true],
        ],
      ],
    ],
    [
      'matchesFieldNamesOfAllTypeNamesExcludeTypeNames',
      '@*TypeNames-[Droid].[id,name];@*TypeNames-[Movie,Human].[title];',
      'returns true if the fieldNames given were specified in the list of fieldNames and the typeNames given is found in the exclusion list of typeNames in the pattern. If `matchAllTypeNames` ' +
        matchAllTypeNamesFalse +
        ' else if `matchAllTypeNames` ' +
        matchAllTypeNamesTrue +
        'The same condition applies for `matchAllFieldNames` for fieldNames ',
      [
        [true, '`id` was specified as a fieldName of  the excluded typeName: `Droid` in the pattern ', [Droid, id]],
        [
          true,
          '`name` was specified as a fieldName of the excluded `typeName`: `Droid` in the pattern ',
          [Droid, name],
        ],
        [
          true,
          '`id` and `name`  were specified as fieldNames of the excluded `typeName`: `Droid`in the pattern ',
          [Droid, [id, name]],
        ],
        [
          false,
          '`title` was not specified as fieldNames of the excluded `typeName`: `Droid`in the pattern ',
          [Droid, [id, name, title], undefined, true],
        ],
        [
          true,
          '`title` was specified as a fieldName of the excluded `typeName`: `Movie` in the pattern ',
          [Movie, title],
        ],
        [
          true,
          '`title` was specified as a fieldName of the excluded `typeName`: `Human` in the pattern ',
          [Human, title],
        ],
        [
          false,
          '`id` was not specified as a fieldName of the excluded `typeName`: `Human` in the pattern ',
          [Human, [id, title], undefined, true],
        ],
        [
          true,
          '`title` was specified as a fieldName of the excluded `typeNames`: `Human` and `Movie`  in the pattern ',
          [[Human, Movie], title],
        ],
        [
          false,
          '`id` of `Movie` was not specified as a fieldName of an excluded `typeName` in the pattern ',
          [Movie, id],
        ],
        [
          false,
          '`name` of `Movie` was not specified as a fieldName of an excluded `typeName` in the pattern ',
          [Movie, name],
        ],
        [
          false,
          '`title` was not specified as a fieldName of a excluded `typeName`: `Droid` in the pattern ',
          [[Droid, Human], title, true],
        ],
        [
          false,
          '`name` was not specified as a fieldName of a excluded `typeNames`: `Movie`  in the pattern ',
          [[Movie, Droid], name, true],
        ],
        [
          false,
          '`name` of `Movie` and `title` of `Droid` were not specified as fieldNames of the excluded `typeNames` in the pattern ',
          [[Movie, Droid], [name, title], true, true],
        ],
      ],
    ],
    [
      'matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames',
      '@*TypeNames-[Droid].@*FieldNames;@*TypeNames-[Movie,Human].@*FieldNames;',
      'returns a boolean if the `typeName` given is found in the excluded list of typeNames . Since the pattern contains `@*FieldNames`, this matcher does not require a `fieldName` parameter. If `matchAllTypeNames` ' +
        matchAllTypeNamesFalse +
        ' else if `matchAllTypeNames` ' +
        matchAllTypeNamesTrue,
      [
        [true, '`Droid` is in the excluded list of `typeNames`', [Droid]],
        [true, '`Movie` is in the excluded list of `typeNames`', [Movie]],
        [true, '`Human` is in the excluded list of `typeNames`', [Human]],
        [true, '`Droid`, `Human` and `Movie` are all in the excluded list of `typeNames`', [[Droid, Human, Movie]]],
        [
          true,
          'some of the typesNames given: `Droid` and `Movie` are in the excluded list of `typeNames`',
          [[Droid, Starship, Movie]],
        ],
        [false, '`Starship` is not in the excluded list of `typeNames`', [Starship, true]],
        [false, '`Starship` is not in the excluded list of `typeNames`', [[Droid, Starship, Movie], true]],
      ],
    ],
    [
      'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
      '@*TypeNames-[Droid].@*FieldNames-[id];@*TypeNames-[Movie,Human, Droid].@*FieldNames-[name];@*TypeNames-[Movie, Human].@*FieldNames-[title];',
      'returns true if the fieldNames given is found in the exclusion list of fieldNames and the typeNames given is found in the exclusion list of typeNames. If `matchAllTypeNames` ' +
        matchAllTypeNamesFalse +
        ' else if `matchAllTypeNames` ' +
        matchAllTypeNamesTrue +
        'The same condition applies for `matchAllFieldNames` for fieldNames',
      [
        [true, '`Droid` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively', [Droid, id]],
        [
          true,
          '`Movie` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
          [Movie, name],
        ],
        [
          true,
          '`Human` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
          [Human, name],
        ],
        [
          true,
          '`Movie` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
          [Movie, title],
        ],
        [
          true,
          '`Human` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
          [Human, title],
        ],
        [
          true,
          'the fieldName given: `name` is not in the exclusion list of fieldNames for the typeName given: `Droid`',
          [Droid, name],
        ],
        [
          false,
          'the fieldName given: `title` is not in the exclusion list of fieldNames for the typeName given: `Droid`',
          [Droid, title],
        ],
        [
          false,
          'the fieldName given: `friends` is not in the exclusion list of fieldNames for the typeName given: `Droid`',
          [Droid, friends],
        ],
        [
          false,
          'the fieldName given: `friend` is not in the exclusion list of fieldNames for the typeName given: `Droid`',
          [Droid, friend],
        ],
        [
          false,
          'the typeNames given: `Starship` is not in the exclusion list of typeNames in the pattern.',
          [Starship, id],
        ],
        [false, 'the typeNames given: `Human` is not in the exclusion list of typeNames in the pattern.', [Human, id]],
        [false, 'the typeNames given: `Movie` is not in the exclusion list of typeNames in the pattern.', [Movie, id]],
      ],
    ],
  ];

  describe.each(indexArray(cases))(
    '%i. TypeFieldName.%s: given the pattern: `%s` %s',
    (_index, matcher, typeFieldNamePattern, _description, testEachCases) => {
      it.each(testEachCases)('returns `%s` because %s', (expected, _title, args) => {
        expect(mockedTypeFieldNameMatcher(matcher, typeFieldNamePattern, ...args)).toBe(expected);
      });

      /*  test('matcher is tested in order as defined in TypeFieldName', () => {
        expect(definedPatternMatchers.includes(matcher)).toBe(true);
        expect(definedPatternMatchers.includes(matcher)).toBe(true);
        expect(definedPatternMatchers[index]).toBe(matcher);
        // if none of the expectations above fails...
        testedPatternMatchers.push(matcher);
      }); */
    }
  );

  /*   test('all defined matchers were tested', () => {
    expect(definedPatternMatchers).toMatchObject(testedPatternMatchers);
  }); */
});
