import {
  AnyTypeName,
  AppliesOn,
  APPLIES_ON_CLASS,
  APPLIES_ON_DEFAULT_FACTORY,
  APPLIES_ON_DEFAULT_PARAMETERS,
  APPLIES_ON_ENUM,
  APPLIES_ON_ENUM_VALUE,
  APPLIES_ON_NAMED_FACTORY_FOR_MERGED_TYPES,
  APPLIES_ON_NAMED_FACTORY_FOR_UNION_TYPES,
  APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_MERGED_TYPES,
  APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
  Config,
} from '../src/config';
import { appliesOnBlock } from '../src/utils';

const config = Config.extend({
  camelCasedEnums: false,
  final: [
    ['@*TypeName.@*FieldName-[name,appearsIn]', ['parameter']], // 3
    ['Droid.[id, name], Starship.[id]', ['parameter']], // 0
    ['@*TypeName.[id]', ['parameter']], // 2
    ['Droid.@*FieldName-[name]', ['parameter']], // 1
  ],
});
console.log(config);

const fieldName = 'id';
const typeName = 'Droid';

const sample = '@*TypeName.@*FieldName-[name,appearsIn]';
const regexp3 = /@\*TypeName\.@\*FieldName-\[((\w+,?)+)\]/gi;

console.log(sample.replace(regexp3, '$1'));

const output = {
  appliesOnEnum: {},
  appliesOnEnumValue: {},
  appliesOnClass: {},
  appliesOnDefaultFactory: {},
  appliesOnNamedFactoryForUnionTypes: {},
  appliesOnNamedFactoryForMergedTypes: {},
  appliesOnDefaultParameters: {},
  appliesOnNamedFactoryParametersForUnionTypes: {},
  appliesOnNamedFactoryParametersForMergedTypes: {},
};
/* 
config.final?.forEach(([graphQLTypeName, appliesOn]) => {
  if (appliesOnBlock(appliesOn, APPLIES_ON_ENUM)) {
    if (regexp3.test(graphQLTypeName)) {
      graphQLTypeName
        .replace(regexp3, '$1')
        .split(',')
        .forEach(f => (output.appliesOnEnum[f] = ''));
    }
  }
  if (appliesOnBlock(appliesOn, APPLIES_ON_ENUM_VALUE)) {
    if (regexp3.test(graphQLTypeName)) {
      graphQLTypeName
        .replace(regexp3, '$1')
        .split(',')
        .forEach(f => (output.appliesOnEnumValue[f] = ''));
    }
  }
}); */

console.log(output);

const setFields = (strField: string, acc: Record<string, any>, key: string, value: any) => {
  strField
    .split(',')
    .map(f => f.trim())
    .forEach(f => (acc[key][f] = value));
  return acc;
};

const onBlock = (appliesOn: AppliesOn[], callback: any) => {
  [
    APPLIES_ON_ENUM,
    APPLIES_ON_ENUM_VALUE,
    APPLIES_ON_CLASS,
    APPLIES_ON_DEFAULT_FACTORY,
    APPLIES_ON_NAMED_FACTORY_FOR_UNION_TYPES,
    APPLIES_ON_NAMED_FACTORY_FOR_MERGED_TYPES,
    APPLIES_ON_DEFAULT_PARAMETERS,
    APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_UNION_TYPES,
    APPLIES_ON_NAMED_FACTORY_PARAMETERS_FOR_MERGED_TYPES,
  ].forEach(expected => {
    if (appliesOnBlock(appliesOn, expected, true)) {
      callback();
    }
  });
};
