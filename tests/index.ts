//#region arrayIndexed(...)
/**
 * helper function that indexes the array passed to `.each `method of `describe`, `test` and `it`
 * @param arr The array of tuples to be indexed
 * @returns array of tuples where the first element in the tuple is the index of the tuple
 */
export const arrayIndexed = <T extends [...any]>(arr: T[]): [index: number, ...rest: T][] =>
  arr.map((el, i) => [i, ...el]);

test('helper method: indexArray(arr[][]): returns a new array where the first element it the index of the old array element', () => {
  expect(arrayIndexed([['a'], ['b']])).toMatchObject([
    [0, 'a'],
    [1, 'b'],
  ]);

  expect(arrayIndexed([['buildTypeNames', ['Droid,Starship'], 'Droid;Starship;']])).toMatchObject([
    [0, 'buildTypeNames', ['Droid,Starship'], 'Droid;Starship;'],
  ]);
});
//#endregion
