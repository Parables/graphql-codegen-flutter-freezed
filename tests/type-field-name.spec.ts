import { TypeFieldName } from '../src/config/type-field-name';

it('anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames', () => {
  const target = '@*TypeName-[Human,Movie].@*FieldName-[id,name]';
  const typeFieldName = TypeFieldName.anyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames('Human,Movie,,,  ', [
    ',id,name   ,',
  ]);

  expect(typeFieldName).toBe(target);

  expect(
    TypeFieldName.matchesAnyFieldNameExceptFieldNamesOfAnyTypeNameExceptTypeNames(
      typeFieldName,
      'Human,Movie',
      'id,name'
    )
  ).toBe(true);
});
