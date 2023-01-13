import { plugin } from '../src/index';
import { enumSchema, baseSchema } from './schema';
import { Config } from '../src/config/config-value';

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
          @JsonKey(name: 'void') void_,
          IN,
          @JsonKey(name: 'in') in_,
          @JsonKey(name: 'String') String_,
          ELSE,
          @JsonKey(name: 'else') else_,
          SWITCH,
          @JsonKey(name: 'switch') switch_,
          FACTORY,
          @JsonKey(name: 'factory') factory_,
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

        /// I start comment here
        /// This is a Person Entity
        /// 
        /// People are need in movies to be the actors
        /// and make us laugh
        @freezed
        class PersonType with _$PersonType {
          const PersonType._();

        ==>default_factory==>PersonType==>factory,default_factory
          factory PersonType.fromJson(Map<String, dynamic> json) => _$PersonTypeFromJson(json);
        }"
      `);
    });

    it('customized freezed: generates the expected output', () => {
      const output = plugin(
        baseSchema,
        [],
        Config.create({
          copyWith: false,
          makeCollectionsUnmodifiable: true,
        })
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        /// I start comment here
        /// This is a Person Entity
        /// 
        /// People are need in movies to be the actors
        /// and make us laugh
        @Freezed(
          copyWith: false,
          makeCollectionsUnmodifiable: true,
        )
        class PersonType with _$PersonType {
          const PersonType._();

        ==>default_factory==>PersonType==>factory,default_factory
          factory PersonType.fromJson(Map<String, dynamic> json) => _$PersonTypeFromJson(json);
        }"
      `);
    });
  });
});
