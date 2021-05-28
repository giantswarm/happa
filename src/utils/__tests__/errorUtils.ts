import { extractMessageFromError } from '../errorUtils';

describe('errorUtils', () => {
  describe('extractMessageFromError', () => {
    it('extracts error message from superagent errors', () => {
      expect(
        extractMessageFromError(
          {
            response: {
              body: { message: 'Something is really wrong this time' },
            },
          },
          'An error'
        )
      ).toBe('Something is really wrong this time');

      expect(
        extractMessageFromError(
          {
            response: {},
          },
          'An error'
        )
      ).toBe('An error');

      expect(extractMessageFromError({}, 'An error')).toBe('An error');
    });

    it('extracts error message from javascript errors', () => {
      expect(
        extractMessageFromError(
          new Error('Something is really wrong this time'),
          'An error'
        )
      ).toBe('Something is really wrong this time');

      expect(extractMessageFromError(new Error(), 'An error')).toBe('An error');

      expect(extractMessageFromError(new Error(''), 'An error')).toBe(
        'An error'
      );
    });
  });
});
