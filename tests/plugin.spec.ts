import { plugin } from '../src/index';
import { enumSchema, baseSchema } from './schema';
import { Config } from '../src/config/config-value';

/**
 * tests that ensures that the generated output has the required import statements
 * @param output the generated output by the plugin
 */
// const expectImportStatements = (output: string) => {
//   describe('output has import statements:', () => {
//     it('imports freezed_annotation:', () => {
//       expect(output).toContain(
//         [
//           "import 'package:freezed_annotation/freezed_annotation.dart';\n",
//           "import 'package:flutter/foundation.dart';\n\n",
//           "part 'app_models.freezed.dart';\n",
//           "part 'app_models.g.dart';\n\n",
//         ].join('')
//       );
//     });
//   });
// };

describe('The Flutter Freezed plugin produces Freezed models using a GraphQL Schema:', () => {
  describe('Enum Block: will generate a valid Enum block', () => {
    it('using the default plugin configuration: Enum values are camelCased and values that are keywords are escaped by suffixing the value with an `_`', () => {
      const output = plugin(enumSchema, [], Config.create());
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          @JsonKey(name: 'NEWHOPE') newhope,
          @JsonKey(name: 'EMPIRE') empire,
          @JsonKey(name: 'JEDI') jedi,
          @JsonKey(name: 'VOID') void_,
          @JsonKey(name: 'void') void_,
          @JsonKey(name: 'IN') in_,
          @JsonKey(name: 'in') in_,
          @JsonKey(name: 'String') string,
          @JsonKey(name: 'ELSE') else_,
          @JsonKey(name: 'else') else_,
          @JsonKey(name: 'SWITCH') switch_,
          @JsonKey(name: 'switch') switch_,
          @JsonKey(name: 'FACTORY') factory_,
          @JsonKey(name: 'factory') factory_,
        }"
      `);
    });

    it('when config.camelCasedEnums === undefined: original casing is preserved, keywords are escaped', () => {
      expect(plugin(enumSchema, [], Config.create({ camelCasedEnums: undefined }))).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          NEWHOPE,
          EMPIRE,
          JEDI,
          VOID,
          void_,
          IN,
          in_,
          String_,
          ELSE,
          else_,
          SWITCH,
          switch_,
          FACTORY,
          factory_,
        }"
      `);
    });

    it('when config.camelCasedEnums === DartIdentifierCasing: Enum values are cased as configured, keywords are escaped', () => {
      const output = plugin(enumSchema, [], Config.create({ camelCasedEnums: 'PascalCase' }));
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          @JsonKey(name: 'NEWHOPE') Newhope,
          @JsonKey(name: 'EMPIRE') Empire,
          @JsonKey(name: 'JEDI') Jedi,
          @JsonKey(name: 'VOID') Void,
          @JsonKey(name: 'void') Void,
          @JsonKey(name: 'IN') In,
          @JsonKey(name: 'in') In,
          @JsonKey(name: 'String') String_,
          @JsonKey(name: 'ELSE') Else,
          @JsonKey(name: 'else') Else,
          @JsonKey(name: 'SWITCH') Switch,
          @JsonKey(name: 'switch') Switch,
          @JsonKey(name: 'FACTORY') Factory,
          @JsonKey(name: 'factory') Factory,
        }"
      `);
    });
  });

  describe('simple Freezed model:', () => {
    it('using the default plugin configuration: generates the expected output', () => {
      const output = plugin(baseSchema, [], Config.create());
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @freezed
        class PersonType with _$PersonType {
          const PersonType._();

        ==>factory==>PersonType==>factory,default_factory
          factory PersonType.fromJson(Map<String, dynamic> json) => _$PersonTypeFromJson(json);
        }"
      `);
    });
  });
});
