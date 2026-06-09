import { formatVersion } from '../FooterUtils';

describe('FooterUtils', () => {
  describe('formatVersion', () => {
    it('returns the placeholder when the version is undefined', () => {
      // The metadata version can arrive as `undefined` when `/metadata.json`
      // is served without a `version` field (e.g. transiently during a
      // deploy), even though the type says `string`. Guard against it.
      expect(formatVersion(undefined as unknown as string)).toBe('VERSION');
    });

    it('returns the placeholder when the version is empty', () => {
      expect(formatVersion('')).toBe('VERSION');
    });

    it('returns the version unchanged for a plain semver version', () => {
      expect(formatVersion('1.72.2')).toBe('1.72.2');
    });

    it('truncates the pre-release part of a pre-release version', () => {
      expect(
        formatVersion('0.0.1-asd123djas123asdasdu98cnas9d81723asd98asy9812')
      ).toBe('0.0.1-asd12');
    });
  });
});
