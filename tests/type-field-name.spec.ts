import { TypeFieldName, TypeName, FieldName } from '../src/config/type-field-name';
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
      ['regexpForTypeNames', /\b(?!TypeNames|FieldNames\b)(?<typeName>\w+;)/gim],
      ['regexpForAllTypeNames', /(?<allTypeNames>@\*TypeNames;)/gm],
      ['regexpForAllTypeNamesExcludeTypeNames', /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\];/gim],
      [
        'regexpForFieldNamesOfTypeName',
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim,
      ],
      ['regexpForAllFieldNamesOfTypeName', /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim],
      [
        'regexpForAllFieldNamesExcludeFieldNamesOfTypeName',
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim,
      ],
      ['regexpForFieldNamesOfAllTypeNames', /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim],
      ['regexpForAllFieldNamesOfAllTypeNames', /@\*TypeNames\.@\*FieldNames;/gim],
      [
        'regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames',
        /@\*TypeNames\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim,
      ],
      [
        'regexpForFieldNamesOfAllTypeNamesExcludeTypeNames',
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim,
      ],
      [
        'regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames',
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim,
      ],
      [
        'regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim,
      ],
    ])('%s is accounted for', (regexpName, expectedRegexp) => {
      expect(mockedTypeFieldNameRegExp(regexpName).source).toBe(expectedRegexp.source);
    });
  });
});

describe('pattern builders: builder methods return a valid pattern', () => {
  // Hard coded for integrity purposes. Update this if more pattern builders are added
  const patternBuildersCount = 12;

  const definedPatternBuilders = Object.getOwnPropertyNames(TypeFieldName).filter(
    method => method.startsWith('build') && typeof TypeFieldName[method] === 'function'
  );

  expect(definedPatternBuilders.length).toBe(patternBuildersCount);

  const mockedPatternBuilder = jest.fn((method: string): ((...args: any) => string) => TypeFieldName[method]);

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
    expect(mockedPatternBuilder(method)(...args)).toBe(expectedPattern);
  });

  describe('PatternBuilders for specific TypeName would build a pattern for each TypeName when given a list of TypeNames', () => {
    test("when given 'TypeName'", () => {
      const typeName = 'Droid';
      expect(TypeFieldName.buildFieldNamesOfTypeName(typeName, 'id, name')).toBe('Droid.[id,name];');
      expect(TypeFieldName.buildAllFieldNamesOfTypeName(typeName)).toBe('Droid.@*FieldNames;');
      expect(TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName(typeName, 'id, name')).toBe(
        'Droid.@*FieldNames-[id,name];'
      );
    });

    test("when given ['TypeName', 'TypeName']", () => {
      const typeNames = ['Droid', 'Starship'];
      expect(TypeFieldName.buildFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.[id,name];Starship.[id,name];'
      );
      expect(TypeFieldName.buildAllFieldNamesOfTypeName(typeNames)).toBe('Droid.@*FieldNames;Starship.@*FieldNames;');
      expect(TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.@*FieldNames-[id,name];Starship.@*FieldNames-[id,name];'
      );
    });

    test("when given 'TypeName, TypeName'", () => {
      const typeNames = 'Droid,Starship';
      expect(TypeFieldName.buildFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.[id,name];Starship.[id,name];'
      );
      expect(TypeFieldName.buildAllFieldNamesOfTypeName(typeNames)).toBe('Droid.@*FieldNames;Starship.@*FieldNames;');
      expect(TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.@*FieldNames-[id,name];Starship.@*FieldNames-[id,name];'
      );
    });

    test("when given ['TypeName, TypeName']", () => {
      const typeNames = ['Droid,Starship'];
      expect(TypeFieldName.buildFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.[id,name];Starship.[id,name];'
      );
      expect(TypeFieldName.buildAllFieldNamesOfTypeName(typeNames)).toBe('Droid.@*FieldNames;Starship.@*FieldNames;');
      expect(TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.@*FieldNames-[id,name];Starship.@*FieldNames-[id,name];'
      );
    });

    test('when given TypeName', () => {
      const typeNames = Droid;
      expect(TypeFieldName.buildFieldNamesOfTypeName(typeNames, 'id, name')).toBe('Droid.[id,name];');
      expect(TypeFieldName.buildAllFieldNamesOfTypeName(typeNames)).toBe('Droid.@*FieldNames;');
      expect(TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.@*FieldNames-[id,name];'
      );
    });

    test('when given [TypeName, TypeName]', () => {
      const typeNames = [Droid, Starship];
      expect(TypeFieldName.buildFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.[id,name];Starship.[id,name];'
      );
      expect(TypeFieldName.buildAllFieldNamesOfTypeName(typeNames)).toBe('Droid.@*FieldNames;Starship.@*FieldNames;');
      expect(TypeFieldName.buildAllFieldNamesExcludeFieldNamesOfTypeName(typeNames, 'id, name')).toBe(
        'Droid.@*FieldNames-[id,name];Starship.@*FieldNames-[id,name];'
      );
    });
  });
});

describe('pattern matchers: return a boolean if the given args are found within the pattern', () => {
  // Hard coded for integrity purposes. Update this if more pattern builders are added
  const patternBuildersCount = 12;

  const definedPatternMatchers = Object.getOwnPropertyNames(TypeFieldName).filter(
    method => method.startsWith('matches') && typeof TypeFieldName[method] === 'function'
  );

  const testedPatternMatchers: string[] = [];

  expect(definedPatternMatchers.length).toBe(patternBuildersCount);

  const mockedPatternMatcher = jest.fn(
    (matcher: string, ...args: any): ((typeFieldNamePatterns: TypeFieldNamePatterns, ...args: any) => boolean) =>
      TypeFieldName[matcher](...args)
  );

  // TODO: Update descriptions and titles to reflect the purpose of the test
  describe.each<
    [
      index: number,
      matcher: string,
      pattern: string,
      description: string,
      testEachCases: [expected: boolean, title: string, args: any[]][]
    ]
  >(
    indexArray([
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
      ['matchesAllTypeNames', '@*TypeNames;', 'pattern for all TypeNames', [[true, 'matches all TypeNames', []]]],
      [
        'matchesAllTypeNamesExcludeTypeNames',
        '@*TypeNames-[Droid,Starship];',
        'returns true if the typeNames given were specified in the exclusion list of typeNames in the pattern, otherwise false.',
        [
          [false, '`Droid` is in the exclusion list of typeNames in the pattern', [Droid]],
          [false, '`Starship` is in the exclusion list of typeNames in the pattern', [Starship]],
          [true, '`Human` is not in the exclusion list of typeNames in the pattern', [Human]],
          [true, '`Movie` is not in the exclusion list of typeNames in the pattern', [Movie]],
        ],
      ],
      [
        'matchesFieldNamesOfTypeName',
        'Droid.[id,name,friends];Movie.[title,episode];',
        'returns true if the fieldNames given were specified in the list of fieldNames for the typeName given in the pattern, otherwise false.',
        [
          [true, '`id` was specified in the list of fieldNames for `Droid` in the pattern', [Droid, id]],
          [true, '`name` was specified in the list of fieldNames for `Droid` in the pattern', [Droid, name]],
          [true, '`friends` was specified in the list of fieldNames for `Droid` in the pattern', [Droid, friends]],
          [false, '`friend` was not specified in the list of fieldNames for `Droid` in the pattern', [Droid, friend]],
          [false, '`title` was not specified in the list of fieldNames for `Droid` in the pattern', [Droid, title]],
          [true, '`title` was specified in the list of fieldNames for `Movie` in the pattern', [Movie, title]],
          [true, '`episode` was specified in the list of fieldNames for `Movie` in the pattern', [Movie, episode]],
          [false, '`id` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, id]],
          [false, '`name` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, name]],
          [false, '`friends` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, friends]],
          [false, '`friend` was not specified in the list of fieldNames for `Movie` in the pattern', [Movie, friend]],
        ],
      ],
      [
        'matchesAllFieldNamesOfTypeName',
        'Movie.@*FieldNames;Droid.@*FieldNames;',
        'returns a boolean if the `typeName` given was specified in the pattern. Since the pattern contains `@*FieldNames`,this matcher does not require a `fieldName` parameter',
        [
          [true, '`Droid` was specified as a `typeName` in the pattern', [Droid]],
          [false, '`Starship` was given but `Human` was specified in the pattern', [Starship]],
          [false, '`Human` was given but `Human` was specified in the pattern', [Human]],
          [true, '`Movie` was given but `Movie` was specified in the pattern', [Movie]],
          [false, '`Movies` was given but `Movies` was specified in the pattern', ['Movies']],
        ],
      ],
      [
        'matchesAllFieldNamesExcludeFieldNamesOfTypeName',
        'Movie.@*FieldNames-[id];Droid.@*FieldNames-[name,friends];Movie.@*FieldNames-[title];',
        'returns a boolean if fieldNames given were specified in the exclusion list of fieldNames for the typeName given in the pattern.',
        [
          [true, 'it matches basically anything', [Droid, id]],
          [false, 'it matches basically anything', [Droid, name]],
          [false, 'it matches basically anything', [Droid, friends]],
          [true, 'it matches basically anything', [Droid, friend]],
          [true, 'it matches basically anything', [Droid, title]],
          [true, 'it matches basically anything', [Droid, episode]],

          [false, 'it matches basically anything', [Starship, id]],
          [false, 'it matches basically anything', [Starship, name]],
          [false, 'it matches basically anything', [Starship, friends]],
          [false, 'it matches basically anything', [Starship, friend]],
          [false, 'it matches basically anything', [Starship, title]],
          [false, 'it matches basically anything', [Starship, episode]],

          [false, 'it matches basically anything', [Human, id]],
          [false, 'it matches basically anything', [Human, name]],
          [false, 'it matches basically anything', [Human, friends]],
          [false, 'it matches basically anything', [Human, friend]],
          [false, 'it matches basically anything', [Human, title]],
          [false, 'it matches basically anything', [Human, episode]],

          [false, 'it matches basically anything', [Movie, id]],
          [true, 'it matches basically anything', [Movie, name]],
          [true, 'it matches basically anything', [Movie, friends]],
          [true, 'it matches basically anything', [Movie, friend]],
          [false, 'it matches basically anything', [Movie, title]],
          [true, 'it matches basically anything', [Movie, episode]],
        ],
      ],
      [
        'matchesFieldNamesOfAllTypeNames',
        '@*TypeNames.[id,name];@*TypeNames.[title];',
        'returns a boolean if the `fieldNames` given were specified in the list of fieldNames in the pattern. Since the pattern contains `@*TypeNames`, this matcher does not require a `typeName` parameter.',
        [
          [true, '`id` was specified in the list of fieldNames in the pattern', [id]],
          [true, '`name` was specified in the list of fieldNames in the pattern', [name]],
          [true, '`title` was specified in the list of fieldNames in the pattern', [title]],
          [false, '`friends` was not specified in the list of fieldNames in the pattern', [friends]],
          [false, '`friend` was not specified in the list of fieldNames in the pattern', [friend]],
          [false, '`episode` was not specified in the list of fieldNames in the pattern', [episode]],
        ],
      ],
      [
        'matchesAllFieldNamesOfAllTypeNames',
        '@*TypeNames.@*FieldNames;',
        'returns true for any fieldName and fieldName given',
        [
          [true, 'it matches basically anything', [Droid, id]],
          [true, 'it matches basically anything', [Droid, name]],
          [true, 'it matches basically anything', [Droid, friends]],
          [true, 'it matches basically anything', [Droid, friend]],
          [true, 'it matches basically anything', [Droid, title]],
          [true, 'it matches basically anything', [Droid, episode]],

          [true, 'it matches basically anything', [Starship, id]],
          [true, 'it matches basically anything', [Starship, name]],
          [true, 'it matches basically anything', [Starship, friends]],
          [true, 'it matches basically anything', [Starship, friend]],
          [true, 'it matches basically anything', [Starship, title]],
          [true, 'it matches basically anything', [Starship, episode]],

          [true, 'it matches basically anything', [Human, id]],
          [true, 'it matches basically anything', [Human, name]],
          [true, 'it matches basically anything', [Human, friends]],
          [true, 'it matches basically anything', [Human, friend]],
          [true, 'it matches basically anything', [Human, title]],
          [true, 'it matches basically anything', [Human, episode]],

          [true, 'it matches basically anything', [Movie, id]],
          [true, 'it matches basically anything', [Movie, name]],
          [true, 'it matches basically anything', [Movie, friends]],
          [true, 'it matches basically anything', [Movie, friend]],
          [true, 'it matches basically anything', [Movie, title]],
          [true, 'it matches basically anything', [Movie, episode]],
        ],
      ],
      [
        'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNames',
        '@*TypeNames.@*FieldNames-[id,name];@*TypeNames.@*FieldNames-[title];',
        'returns a boolean if the fieldNames given were specified in the exclusion list of fieldNames in the pattern. Since the pattern contains `@*TypeNames`, this matcher does not require a `typeName` parameter.',
        [
          [false, '`id` was specified in the list of fieldNames in the pattern', [id]],
          [false, '`name` was specified in the list of fieldNames in the pattern', [name]],
          [false, '`title` was specified in the list of fieldNames in the pattern', [title]],
          [true, '`friends` was not specified in the list of fieldNames in the pattern', [friends]],
          [true, '`friend` was not specified in the list of fieldNames in the pattern', [friend]],
          [true, '`episode` was not specified in the list of fieldNames in the pattern', [episode]],
        ],
      ],
      [
        'matchesFieldNamesOfAllTypeNamesExcludeTypeNames',
        '@*TypeNames-[Droid,Human].[id,name];@*TypeNames-[Movie,Human].[title];',
        'returns true if the fieldNames given were specified in the list of fieldNames and the typeNames given is found in the exclusion list of typeNames in the pattern.',
        [
          [
            false,
            '`Droid` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, id],
          ],
          [
            false,
            '`Droid` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, name],
          ],
          [
            false,
            '`Droid` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, friends],
          ],
          [
            false,
            '`Droid` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, friend],
          ],
          [
            true,
            '`Droid` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, title],
          ],
          [
            false,
            '`Droid` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, episode],
          ],

          [
            true,
            '`Starship` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, id],
          ],
          [
            true,
            '`Starship` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, name],
          ],
          [
            false,
            '`Starship` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, friends],
          ],
          [
            false,
            '`Starship` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, friend],
          ],
          [
            true,
            '`Starship` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, title],
          ],
          [
            false,
            '`Starship` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, episode],
          ],

          [
            false,
            '`Human` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, id],
          ],
          [
            false,
            '`Human` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, name],
          ],
          [
            false,
            '`Human` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, friends],
          ],
          [
            false,
            '`Human` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, friend],
          ],
          [
            false,
            '`Human` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, title],
          ],
          [
            false,
            '`Human` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, episode],
          ],

          [true, '`Movie` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively', [Movie, id]],
          [
            true,
            '`Movie` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, name],
          ],
          [
            false,
            '`Movie` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, friends],
          ],
          [
            false,
            '`Movie` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, friend],
          ],
          [
            false,
            '`Movie` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, title],
          ],
          [
            false,
            '`Movie` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, episode],
          ],
        ],
      ],
      [
        'matchesAllFieldNamesOfAllTypeNamesExcludeTypeNames',
        '@*TypeNames-[Droid].@*FieldNames;@*TypeNames-[Movie,Human].@*FieldNames;',
        'returns a boolean if the `typeName` given is found in the excluded list of typeNames . Since the pattern contains `@*FieldNames`, this matcher does not require a `fieldName` parameter.',
        [
          [false, '`Droid` is in the excluded list of `typeNames`', [Droid]],
          [true, '`Starship` is not in the excluded list of `typeNames`', [Starship]],
          [false, '`Human` is in the excluded list of `typeNames`', [Human]],
          [false, '`Movie` is in the excluded list of `typeNames`', [Movie]],
        ],
      ],
      [
        'matchesAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
        '@*TypeNames-[Droid].@*FieldNames-[id];@*TypeNames-[Movie,Human, Droid].@*FieldNames-[name];@*TypeNames-[Movie, Human].@*FieldNames-[title];',
        'returns true if the fieldNames given is found in the exclusion list of fieldNames and the typeNames given is found in the exclusion list of typeNames.',
        [
          [
            false,
            '`Droid` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, id],
          ],
          [
            false,
            '`Droid` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, name],
          ],
          [
            true,
            '`Droid` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, friends],
          ],
          [
            true,
            '`Droid` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, friend],
          ],
          [
            true,
            '`Droid` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, title],
          ],
          [
            true,
            '`Droid` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Droid, episode],
          ],

          [
            true,
            '`Starship` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, id],
          ],
          [
            true,
            '`Starship` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, name],
          ],
          [
            true,
            '`Starship` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, friends],
          ],
          [
            true,
            '`Starship` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, friend],
          ],
          [
            true,
            '`Starship` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, title],
          ],
          [
            true,
            '`Starship` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Starship, episode],
          ],

          [true, '`Human` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively', [Human, id]],
          [
            false,
            '`Human` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, name],
          ],
          [
            true,
            '`Human` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, friends],
          ],
          [
            true,
            '`Human` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, friend],
          ],
          [
            false,
            '`Human` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, title],
          ],
          [
            true,
            '`Human` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Human, episode],
          ],

          [true, '`Movie` and `id` are in the excluded list of `typeNames` and `fieldNames` respectively', [Movie, id]],
          [
            false,
            '`Movie` and `name` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, name],
          ],
          [
            true,
            '`Movie` and `friends` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, friends],
          ],
          [
            true,
            '`Movie` and `friend` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, friend],
          ],
          [
            false,
            '`Movie` and `title` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, title],
          ],
          [
            true,
            '`Movie` and `episode` are in the excluded list of `typeNames` and `fieldNames` respectively',
            [Movie, episode],
          ],
        ],
      ],
    ])
  )('%i. TypeFieldName.%s: given the pattern: `%s` %s', (index, matcher, pattern, _description, testEachCases) => {
    it.each(testEachCases)('returns `%s` because %s', (expected, _title, args) => {
      expect(mockedPatternMatcher(matcher, pattern, ...args)).toBe(expected);
      expect(mockedPatternMatcher('shouldBeConfigured', pattern, ...args)).toBe(expected);
    });

    test('matcher is tested in order as defined in TypeFieldName', () => {
      expect(definedPatternMatchers.includes(matcher)).toBe(true);
      expect(definedPatternMatchers.includes(matcher)).toBe(true);
      expect(definedPatternMatchers[index]).toBe(matcher);
      // if none of the expectations above fails...
      testedPatternMatchers.push(matcher);
    });
  });

  test('all defined matchers were tested', () => {
    expect(definedPatternMatchers).toMatchObject(testedPatternMatchers);
  });
});
