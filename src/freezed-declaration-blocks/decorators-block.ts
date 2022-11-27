/*

export const buildFreezedDecorator = (config: FlutterFreezedPluginConfig, node: NodeType) => {
  // this is the start of the pipeline of decisions to determine which Freezed decorator to use
  return decorateAsUnfreezed(config, node);
};

export const decorateAsUnfreezed = (config: FlutterFreezedPluginConfig, node: NodeType) => {
  const typeName = node.name.value;
  const immutable = config?.typeConfig?.[typeName]?.immutable ?? defaultTypeConfig.immutable;
  const mutableInputs = config?.typeConfig?.[typeName]?.mutableInputs ?? defaultTypeConfig.mutableInputs;
  const mutable = !immutable || (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && mutableInputs);

  return mutable ? '@unfreezed\n' : decorateAsFreezed(config, node);
};

export const decorateAsFreezed = (config: FlutterFreezedPluginConfig, node: NodeType) => {
  const typeName = TypeName.fromConfig(config, node.name.value);

  if (isCustomizedFreezed(config, typeName)) {
    const copyWith = getTypeConfigOption<boolean>(config, typeName, 'copyWith');
    const equal = getTypeConfigOption<boolean>(config, typeName, 'equal');
    const makeCollectionsUnmodifiable = getTypeConfigOption<boolean>(config, typeName, 'makeCollectionsUnmodifiable');
    const unionKey = getTypeConfigOption<string>(config, typeName, 'unionKey');
    const unionValueCase = getTypeConfigOption<'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal'>(
      config,
      typeName,
      'unionValueCase'
    );

    let atFreezed = '@Freezed(\n';

    if (copyWith !== undefined) {
      atFreezed += indent(`copyWith: ${copyWith},\n`);
    }

    if (equal !== undefined) {
      atFreezed += indent(`equal: ${equal},\n`);
    }

    if (makeCollectionsUnmodifiable !== undefined) {
      atFreezed += indent(`makeCollectionsUnmodifiable: ${makeCollectionsUnmodifiable},\n`);
    }

    if (unionKey !== undefined) {
      atFreezed += indent(`unionKey: ${unionKey},\n`);
    }

    if (unionValueCase !== undefined) {
      atFreezed += indent(`unionValueCase: '${unionValueCase}',\n`);
    }

    atFreezed += ')\n';

    return atFreezed;
  }
  // else fallback to the normal `@freezed` decorator
  return '@freezed\n';
};

export const isCustomizedFreezed = (config: FlutterFreezedPluginConfig, typeName: TypeName) => {
  return (
    Config.copyWith(config, typeName) !== undefined ||
    Config.equal(config, typeName) !== undefined ||
    Config.makeCollectionsUnmodifiable(config, typeName) !== undefined ||
    Config.unionKey(config, typeName) !== undefined ||
    Config.unionValueCase(config, typeName) !== undefined
  );
};

*/
