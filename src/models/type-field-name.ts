import { FlutterFreezedPluginConfig, defaultFreezedPluginConfig } from 'src/config';

export type TypeNameValue = string;
export type FieldNameValue = string;

class TypeFieldName {
  private _value: string;

  constructor(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public static fromString = (value: string) => new TypeFieldName(value);

  public static fromConfig = (config: Record<string, unknown>, name: string): TypeFieldName => {
    const commaSeparatedNames = Object.keys(config);
    const targetName = commaSeparatedNames.find(n => n.includes(name));
    return TypeFieldName.fromString(targetName ?? name);
  };
}

/**
 * @name TypeName
 * @description A comma-separated string of GraphQL Type Names.Use the `globalName` to apply the same config options to all GraphQL Types.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * TODO: add an example
 * ```
 * */
export class TypeName extends TypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  public static fromGlobalName = (config: FlutterFreezedPluginConfig) =>
    TypeFieldName.fromString(
      config.globalName?.typeName ?? defaultFreezedPluginConfig.globalName?.typeName ?? '@*TypeFieldName'
    );
}

/**
 * @name FieldName
 * @description Just like TypeName but instead used for the fields names of a GraphQL Type. Use the `config.globalName` to apply the same config options to all fields.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * TODO: add an example
 * ```
 * */
export class FieldName extends TypeFieldName {
  private constructor(value: string) {
    super(value);
  }

  public static fromGlobalName = (config: FlutterFreezedPluginConfig) =>
    FieldName.fromString(
      config.globalName?.fieldName ?? defaultFreezedPluginConfig.globalName?.fieldName ?? '@*FieldName'
    );
}
