import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { starWarsSchema } from './schema';
import { appliesOnBlock, dartCasing, nodeIsObjectType, NodeRepository } from '../src/utils';
import { defaultFreezedPluginConfig, APPLIES_ON_PARAMETERS, ObjectType } from '../src/config/config';

const {
  ast: { definitions: nodes },
} = transformSchemaAST(starWarsSchema, defaultFreezedPluginConfig);

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

describe('NodeRepository can store and retrieve Object Types', () => {
  const nodeRepository = new NodeRepository();
  it('returns node or undefined', () => {
    expect(nodeRepository.get('Human')).toBeUndefined();

    const objNode = nodeRepository.register(nodes[9] as ObjectType);
    expect(nodeRepository.get('Human')).toBe(objNode);

    expect(() => nodeRepository.register(nodes[11] as ObjectType)).toThrow(
      'Node is not an ObjectTypeDefinitionNode or InputObjectTypeDefinitionNode'
    );
    expect(nodeRepository.get('SearchResult')).toBeUndefined();
  });
});
