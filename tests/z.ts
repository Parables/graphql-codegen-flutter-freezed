import { Config } from '../src/config';

const config = Config.extend({
  camelCasedEnums: false,
  final: [
    // in order of specificity, explicit has a higher precedence than general ones
    ['Droid.[id, name], Starship.[id]', ['parameter']], // 1
    ['Droid.@*FieldName-[name,appearsIn],Droid.@*FieldName-[id]', ['parameter']], // 2
    ['Droid.@*FieldName', ['parameter']], // 3

    ['@*TypeName.[id]', ['parameter']], // 4
    ['@*TypeName-[Human,Movie].[id]', ['parameter']], // 5
    ['@*TypeName-[Human,Movie].@*FieldName-[name,appearsIn], @*TypeName.@*FieldName-[id],', ['parameter']], // 6
    ['@*TypeName-[Human,Movie].@*FieldName', ['parameter']], // 7
    ['@*TypeName.@*FieldName-[name,appearsIn], @*TypeName.@*FieldName-[id],', ['parameter']], // 8
    ['@*TypeName.@*FieldName', ['parameter']], // 9
  ],
});

// TODO: Handle for edge cases where code formatting might put spaces and new lines in between tokens and commas
const regexp1 = /\w+\s?\.\s?\[((\s?\w+\s?,?\s?)+)\]/gim;
// const regexp1 = /\w+\.\[((\w+\s?,?\s+)+)\]/gim;

const regexp2 = /\w+\.@\*FieldName-\[((\w+,?.+)+)\]/gim;
const regexp3 = /\w+\.@\*FieldName/gim;
const regexp4 = /@\*TypeName\.\[((\w+,?.+)+)\]/gim;

const regexp6 = /@\*TypeName-\[((\w+,?.+)+)\]\.@\*FieldName-\[((\w+,?.+)+)\],?/gim;
const regexp7 = /@\*TypeName-\[((\w+,?.+)+)\]\.@\*FieldName-\[((\w+,?.+)+)\],?/gim;
const regexp8 = /@\*TypeName\.@\*FieldName-\[((\w+,?.+)+)\],?/gim;

/* console.log(
  sample3
    .replace(regexp3, '$1,')
    .split(',')
    .filter(v => v.length > 0)
);

console.log(
  sample1
    .replace(regexp1, '$1,')
    .split(',')
    .filter(v => v.length > 0)
);
 */
