import { Config } from '../src/config';

const config = Config.extend({
  camelCasedEnums: false,
  final: [
    // in order of specificity, explicit has a higher precedence than general ones
    // [
    //   `Droid
    //   .
    //   [
    //     edge,
    //     id,
    //     name
    //   ], Starship.[in], `,
    //   ['parameter'],
    // ], // 1
    ['Droid.[id,name], Starship.[id]', ['parameter']], // 1
    ['Droid.[id, name], Starship.[id]', ['parameter']], // 1
    // ['Droid.@*FieldName-[name,appearsIn],Droid.@*FieldName-[id]', ['parameter']], // 2
    // ['Droid.@*FieldName', ['parameter']], // 3

    // ['@*TypeName.[id]', ['parameter']], // 4
    // ['@*TypeName-[Human,Movie].[id]', ['parameter']], // 5
    // ['@*TypeName-[Human,Movie].@*FieldName-[name,appearsIn], @*TypeName.@*FieldName-[id],', ['parameter']], // 6
    // ['@*TypeName-[Human,Movie].@*FieldName', ['parameter']], // 7
    // ['@*TypeName.@*FieldName-[name,appearsIn], @*TypeName.@*FieldName-[id],', ['parameter']], // 8
    // ['@*TypeName.@*FieldName', ['parameter']], // 9
  ],
});

const typeName = 'Droid';
const fieldName = 'id';

// const regexp1 = /Droid\s*\.\s*\[(\s*(\w+)*,*)*\]/gim;
const regexp1 = /@\s*\*\s*TypeName\s*-\s*\[\s*((\w+?,?\s*)*)\]\s*\.\s*\[\s*((\w+?,?\s*)*)\]/gim;

const sample1 = '@*TypeName-[Human,Movie].[id]';
const sample2 = '@ * TypeName -[ Human, Movie, ].[id, name,   more,], @*TypeName-[Human,Movie].[age]';
// const res = regexp1.test(sample1);
const res2 = regexp1.test(sample2);
console.log('🚀 ~ file: z.ts ~ line 39 ~ res', res2);
// console.log(sample1.replace(regexp1, '$&'));
console.log(sample1.replace(regexp1, '$1 ==> $3 '));
console.log(sample2.replace(regexp1, '$1 ==> $3 '));

/* console.log(
  sample1
    .replace(regexp1, '$1,')
    .split(',')
    .filter(v => v.length > 0)
);
 */
