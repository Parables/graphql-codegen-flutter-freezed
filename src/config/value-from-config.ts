export type GetFromConfig<T> = {
  [P in keyof T as Capitalize<string & P>]: (config: T) => T[P];
};
