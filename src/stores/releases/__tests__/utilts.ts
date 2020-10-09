import { getReleaseEOLStatus } from 'stores/releases/utils';

describe('releases::utils', () => {
  describe('getReleaseEOLStatus', () => {
    // eslint-disable-next-line no-magic-numbers
    const oneDay = 24 * 60 * 60 * 1000;

    it('returns the correct status for a version that reached its EOL', () => {
      const date = new Date(Date.now() - oneDay).toISOString();
      const result = getReleaseEOLStatus(date);

      expect(result.isEol).toBeTruthy();
      expect(result.message).toBe(
        'This version reached its end of life a day ago.'
      );
    });

    it('returns the correct status for a version that just reached its EOL now', () => {
      const date = new Date(Date.now()).toISOString();
      const result = getReleaseEOLStatus(date);

      expect(result.isEol).toBeTruthy();
      expect(result.message).toBe(
        'This version reached its end of life today.'
      );
    });

    it('returns the correct status for a version that will reach its EOL at some point', () => {
      const date = new Date(Date.now() + oneDay).toISOString();
      const result = getReleaseEOLStatus(date);

      expect(result.isEol).toBeFalsy();
      expect(result.message).toBe(
        'This version will reach its end of life in a day.'
      );
    });

    it('returns the correct status for a version with an unknown EOL date', () => {
      const result = getReleaseEOLStatus('');

      expect(result.isEol).toBeFalsy();
      expect(result.message).toBe('');
    });
  });
});
