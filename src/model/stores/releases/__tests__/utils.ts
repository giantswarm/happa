import {
  getKubernetesReleaseEOLStatus,
  isPreRelease,
} from 'model/stores/releases/utils';

describe('releases::utils', () => {
  describe('getKubernetesReleaseEOLStatus', () => {
    // eslint-disable-next-line no-magic-numbers
    const oneDay = 24 * 60 * 60 * 1000;

    it('returns the correct status for a version that reached its EOL', () => {
      const date = new Date(Date.now() - oneDay).toISOString();
      const result = getKubernetesReleaseEOLStatus(date);

      expect(result.isEol).toBeTruthy();
      expect(result.message).toBe(
        'This Kubernetes version reached its end of life 1 day ago.'
      );
    });

    it('returns the correct status for a version that just reached its EOL now', () => {
      const date = new Date(Date.now()).toISOString();
      const result = getKubernetesReleaseEOLStatus(date);

      expect(result.isEol).toBeTruthy();
      expect(result.message).toMatch(
        /This Kubernetes version reached its end of life (today|less than a minute ago)\./
      );
    });

    it('returns the correct status for a version that will reach its EOL at some point', () => {
      const date = new Date(Date.now() + oneDay).toISOString();
      const result = getKubernetesReleaseEOLStatus(date);

      expect(result.isEol).toBeFalsy();
      expect(result.message).toBe(
        'This Kubernetes version will reach its end of life in 1 day.'
      );
    });

    it('returns the correct status for a version with an unknown EOL date', () => {
      const result = getKubernetesReleaseEOLStatus('');

      expect(result.isEol).toBeFalsy();
      expect(result.message).toBe('');
    });
  });

  describe('isPreRelease', () => {
    it('distinguishes pre-release versions from regular versions', () => {
      expect(isPreRelease('1.0.0-alpha')).toBeTruthy();
      expect(isPreRelease('1.0.0+metadata')).toBeTruthy();
      expect(isPreRelease('1.0.0-beta+somemeta')).toBeTruthy();
      expect(isPreRelease('1.0.0')).toBeFalsy();
      expect(isPreRelease('24.12.9')).toBeFalsy();
    });
  });
});
