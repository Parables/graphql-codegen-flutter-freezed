import { camelCase } from 'change-case-all';
import { FieldName, TypeName } from '../config/pattern-new';
import { Config } from '../config/config-value';
import { DART_KEYWORDS, FlutterFreezedPluginConfig, DartIdentifierCasing, AppliesOn } from '../config/plugin-config';
import { dartCasing } from '../utils';

export type BlockNameValue = string;

/**
 * @name BlockName
 * @description The `BlockName` is a Dart keyword escaped valid identifier which becomes the name of the generated Freezed Block.
 * */
export class BlockName {
  private _value: string;

  private constructor(value: string /* type: string */) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  /**
   * checks whether name is a Dart Language keyword
   * @param identifier The name or identifier to be checked
   * @returns `true` if name is a Dart Language keyword, otherwise `false`
   */
  public static isDartKeyword = (identifier: string) => Object.hasOwn(DART_KEYWORDS, identifier);

  /**
   * Ensures that the blockName isn't a valid Dart language reserved keyword. It wraps the blockName the dartKeywordEscapePrefix, dartKeywordEscapeSuffix and dartKeywordEscapeCasing specified in the config
   * @param config
   * @param name
   * @param typeName
   * @returns
   */
  public static escapeDartKeyword = (
    config: FlutterFreezedPluginConfig,
    identifier: string,
    typeName: TypeName,
    fieldName?: FieldName,
    blockAppliesOn: AppliesOn[] = []
  ): string => {
    if (this.isDartKeyword(identifier)) {
      const [prefix, suffix, casing] = Config.escapeDartKeywords(config /* typeName, fieldName, blockAppliesOn */);
      const escapedBlockName = `${prefix}${identifier}${suffix}`;
      return dartCasing(escapedBlockName, casing);
    }
    return identifier;
  };

  public static shouldDecorateWithAtJsonKey = (
    blockType: 'enum_value' | 'parameter',
    config: FlutterFreezedPluginConfig,
    identifier: string
  ): boolean => {
    const alreadyCamelCased = !BlockName.isDartKeyword(identifier) && camelCase(identifier) === identifier;

    if (alreadyCamelCased) {
      return false;
    } else if (blockType === 'enum_value') {
      return Config.camelCasedEnums(config) !== undefined;
    }
    return false;
  };

  private static fromString = (
    config: FlutterFreezedPluginConfig,
    identifier: string,
    typeName: TypeName,
    fieldName?: FieldName,
    casing?: DartIdentifierCasing,
    decorateWithAtJsonKey?: boolean,
    blockAppliesOn: AppliesOn[] = []
  ): BlockName => {
    // escape the identifier
    const escapedBlockName = BlockName.escapeDartKeyword(config, identifier, typeName, fieldName, blockAppliesOn);

    // then case it
    const casedBlockName = dartCasing(escapedBlockName, casing);

    if (this.isDartKeyword(casedBlockName)) {
      // if ... then escape it again and use it
      const escapedBlockName = BlockName.escapeDartKeyword(config, casedBlockName, typeName, fieldName, blockAppliesOn);
      return new BlockName(
        decorateWithAtJsonKey ? `@JsonKey(name: '${identifier}') ${escapedBlockName}` : escapedBlockName
      );
    }
    return new BlockName(decorateWithAtJsonKey ? `@JsonKey(name: '${identifier}') ${casedBlockName}` : casedBlockName);
  };

  public static asEnumTypeName = (config: FlutterFreezedPluginConfig, typeName: TypeName): BlockName =>
    BlockName.fromString(config, typeName.value, typeName, undefined, 'PascalCase', undefined, ['enum']);

  public static asEnumValueName = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName
  ): BlockName => {
    const decorateWithAtJsonKey = BlockName.shouldDecorateWithAtJsonKey('enum_value', config, fieldName.value);
    const casing = Config.camelCasedEnums(config);
    return BlockName.fromString(config, fieldName.value, typeName, fieldName, casing, decorateWithAtJsonKey, [
      'enum_value',
    ]);
  };

  public static asClassName = (config: FlutterFreezedPluginConfig, typeName: TypeName): BlockName =>
    BlockName.fromString(config, typeName.value, typeName, undefined, 'PascalCase', undefined, ['class']);

  public static asNamedConstructor = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    namedConstructor: TypeName,
    blockAppliesOn: AppliesOn[] = []
  ): BlockName => {
    const blockName = BlockName.fromString(
      config,
      typeName.value,
      typeName,
      undefined,
      'PascalCase',
      undefined,
      blockAppliesOn
    );
    const blockNamedConstructor = BlockName.fromString(
      config,
      namedConstructor.value,
      typeName,
      undefined,
      'camelCase',
      undefined,
      blockAppliesOn
    );
    return new BlockName(`${blockName?.value}.${blockNamedConstructor.value}`);
  };

  public static asParameterName = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    blockAppliesOn: AppliesOn[] = []
  ): BlockName => {
    const decorateWithAtJsonKey = BlockName.shouldDecorateWithAtJsonKey('enum_value', config, fieldName.value);
    return BlockName.fromString(
      config,
      fieldName.value,
      typeName,
      fieldName,
      'camelCase',
      decorateWithAtJsonKey,
      blockAppliesOn
    );
  };
}
