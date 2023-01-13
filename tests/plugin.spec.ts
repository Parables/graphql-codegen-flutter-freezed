import { plugin } from '../src/index';
import { enumSchema, mergeSchema, simpleSchema, unionSchema } from './schema';
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
    it('@freezed: using the default plugin configuration: generates the expected output', () => {
      const output = plugin(simpleSchema, [], Config.create());
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @freezed
        class Person with _$Person {
          const Person._();

          const factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('@Freezed: generates the expected output', () => {
      const output = plugin(
        simpleSchema,
        [],
        Config.create({
          copyWith: false,
          equal: true,
          makeCollectionsUnmodifiable: true,
        })
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @Freezed(
          copyWith: false,
          equal: true,
          makeCollectionsUnmodifiable: true,
        )
        class Person with _$Person {
          const Person._();

          const factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('unfreeze: generates the expected output', () => {
      const output = plugin(
        simpleSchema,
        [],
        Config.create({
          immutable: false,
        })
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @unfreezed
        class Person with _$Person {
          const Person._();

          factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('@Freezed has precedence over @unfreezed over @freezed: generates the expected output', () => {
      const output = plugin(
        simpleSchema,
        [],
        Config.create({
          immutable: false,
          copyWith: false,
        })
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @Freezed(
          copyWith: false,
        )
        class Person with _$Person {
          const Person._();

          factory Person({
            String? id,
            required String name,
          }) = _Person;

          factory Person.fromJson(Map<String, dynamic> json) => _$PersonFromJson(json);
        }"
      `);
    });

    it('using mergedTypes: generates the expected output', () => {
      const output = plugin(
        mergeSchema,
        [],
        Config.create({
          mergeTypes: {
            Movie: ['CreateMovieInput', 'UpdateMovieInput', 'UpsertMovieInput'],
          },
        })
      );
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        @freezed
        class Movie with _$Movie {
          const Movie._();

          const factory Movie({
            required String id,
            required String title,
          }) = _Movie;

          const factory Movie.createMovieInput({
            required String title,
          }) = CreateMovieInput;

          const factory Movie.updateMovieInput({
            required String id,
            String? title,
          }) = UpdateMovieInput;

          const factory Movie.upsertMovieInput({
            required String id,
            required String title,
          }) = UpsertMovieInput;

          factory Movie.fromJson(Map<String, dynamic> json) => _$MovieFromJson(json);
        }

        @unfreezed
        class CreateMovieInput with _$CreateMovieInput {
          const CreateMovieInput._();

          const factory CreateMovieInput({
            required String title,
          }) = _CreateMovieInput;

          factory CreateMovieInput.fromJson(Map<String, dynamic> json) => _$CreateMovieInputFromJson(json);
        }

        @unfreezed
        class UpsertMovieInput with _$UpsertMovieInput {
          const UpsertMovieInput._();

          const factory UpsertMovieInput({
            required String id,
            required String title,
          }) = _UpsertMovieInput;

          factory UpsertMovieInput.fromJson(Map<String, dynamic> json) => _$UpsertMovieInputFromJson(json);
        }

        @unfreezed
        class UpdateMovieInput with _$UpdateMovieInput {
          const UpdateMovieInput._();

          const factory UpdateMovieInput({
            required String id,
            String? title,
          }) = _UpdateMovieInput;

          factory UpdateMovieInput.fromJson(Map<String, dynamic> json) => _$UpdateMovieInputFromJson(json);
        }

        @unfreezed
        class DeleteMovieInput with _$DeleteMovieInput {
          const DeleteMovieInput._();

          const factory DeleteMovieInput({
            required String id,
          }) = _DeleteMovieInput;

          factory DeleteMovieInput.fromJson(Map<String, dynamic> json) => _$DeleteMovieInputFromJson(json);
        }"
      `);
    });

    it('using unionTypes: generates the expected output', () => {
      const output = plugin(unionSchema, [], Config.create({}));
      expect(output).toMatchInlineSnapshot(`
        "import 'package:freezed_annotation/freezed_annotation.dart';
        import 'package:flutter/foundation.dart';

        part 'app_models.freezed.dart';
        part 'app_models.g.dart';

        enum Episode {
          @JsonKey(name: 'NEWHOPE') newhope,
          @JsonKey(name: 'EMPIRE') empire,
          @JsonKey(name: 'JEDI') jedi,
        }

        @freezed
        class Actor with _$Actor {
          const Actor._();

          const factory Actor({
            required String name,
            required List<Episode?> appearsIn,
          }) = _Actor;

          factory Actor.fromJson(Map<String, dynamic> json) => _$ActorFromJson(json);
        }

        @freezed
        class Starship with _$Starship {
          const Starship._();

          const factory Starship({
            required String id,
            required String name,
            double? length,
          }) = _Starship;

          factory Starship.fromJson(Map<String, dynamic> json) => _$StarshipFromJson(json);
        }

        @freezed
        class Human with _$Human {
          const Human._();

          const factory Human({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            int? totalCredits,
          }) = _Human;

          factory Human.fromJson(Map<String, dynamic> json) => _$HumanFromJson(json);
        }

        @freezed
        class Droid with _$Droid {
          const Droid._();

          const factory Droid({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            String? primaryFunction,
          }) = _Droid;

          factory Droid.fromJson(Map<String, dynamic> json) => _$DroidFromJson(json);
        }

        @freezed
        class SearchResult with _$SearchResult {
          const SearchResult._();

          const factory SearchResult.human({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            int? totalCredits,
          }) = Human;

          const factory SearchResult.droid({
            required String id,
            required String name,
            List<Actor?>? friends,
            required List<Episode?> appearsIn,
            String? primaryFunction,
          }) = Droid;

          const factory SearchResult.starship({
            required String id,
            required String name,
            double? length,
          }) = Starship;

          factory SearchResult.fromJson(Map<String, dynamic> json) => _$SearchResultFromJson(json);
        }"
      `);
    });

    // it('using mergedTypes: generates the expected output', () => {
    //   const output = plugin(unionSchema, [], Config.create({}));
    //   // expect(output).toMatchInlineSnapshot(``)
    // });
  });
});
