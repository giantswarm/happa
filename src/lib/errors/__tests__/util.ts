import CustomError from '../CustomError';
import { is } from '../util';

describe('error utils', () => {
  describe('is() error asserter', () => {
    it('asserts custom error types', () => {
      const error = new CustomError('Custom Error', 'Something went wrong!');

      expect(is('Custom Error', error)).toBe(true);
      expect(is('Error', error)).toBe(false);
    });

    it('asserts native error types', () => {
      let error = new Error('Something went wrong!');
      expect(is('Error', error)).toBe(true);

      error = new SyntaxError('Something went wrong!');
      expect(is('SyntaxError', error)).toBe(true);

      error = new TypeError('Something went wrong!');
      expect(is('TypeError', error)).toBe(true);
    });
  });
});
