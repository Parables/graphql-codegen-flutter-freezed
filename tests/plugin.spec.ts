import { plugin } from '../src';
import { fullDemoConfig } from './config';
import { fullSchema, movieSchema } from './schema';

/** plugin test */
describe('flutter-freezed: plugin config', () => {
  /* test('full plugin test: expect generated code to be as configured', () => {
    const result = plugin(fullSchema, [], fullDemoConfig);

    expect(result).toBe(`Hi`);
  }) */
  test('full plugin test: expect generated code to be as configured', () => {
    const result = plugin(movieSchema, [], fullDemoConfig);

    expect(result).toBe(`Hi`);
  });
});
