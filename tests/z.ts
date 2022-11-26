import { Config } from '../src/config/value-from-config';

const res = Config.extend({
  camelCasedEnums: false,
});

console.log(res);
