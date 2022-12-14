import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { starWarsSchema } from './schema';
import { appliesOnBlock, arrayWrap, dartCasing, nodeIsObjectType } from '../src/utils';
import { defaultFreezedPluginConfig, APPLIES_ON_PARAMETERS } from '../src/config/plugin-config';

const {
  ast: { definitions: nodes },
} = transformSchemaAST(starWarsSchema, defaultFreezedPluginConfig);

describe('arrayWrap:', () => {
  it('wraps the value in array if the value is not an array', () => {
    expect(arrayWrap('Hello')).toMatchObject(['Hello']);
  });

  it('returns the value if the value is already an array', () => {
    expect(arrayWrap(['Hello'])).toMatchObject(['Hello']);
  });

  it('returns an empty array `[]` if the value is undefined', () => {
    expect(arrayWrap(undefined)).toMatchObject([]);
  });
});

test('method: nodeIsObjectType() => returns true if node is an ObjectType', () => {
  const expected = [false, true, true, true, true, true, true, false, true, true, true, false];
  expect(nodes.map(nodeIsObjectType)).toEqual(expected);
});

test('method: appliesOnBlock() => returns true or false if the target contains all or some of the expected', () => {
  expect(appliesOnBlock(['parameter'], APPLIES_ON_PARAMETERS)).toBe(true);
  expect(appliesOnBlock(['factory', 'parameter'], ['parameter'])).toBe(false);
  expect(appliesOnBlock(['factory', 'parameter'], ['parameter'], true)).toBe(true);
});

test('method: dartCasing() => ', () => {
  expect(dartCasing('snake---- Case___ ME', 'snake_case')).toBe('snake_case_me');
  expect(dartCasing('Camel_ case- -- - ME', 'camelCase')).toBe('camelCaseMe');
  expect(dartCasing('pascal-- --case _ ME', 'PascalCase')).toBe('PascalCaseMe');
  expect(dartCasing('lE-AvE mE A-l_o_n-e')).toBe('lE-AvE mE A-l_o_n-e');
});
