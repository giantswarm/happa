import { compare } from 'lib/semver';

describe('semver', () => {
  describe('compare', () => {
    it('compares versions with the semver format', () => {
      let versions = [
        '1.2.3',
        '4.11.6',
        '4.2.0',
        '1.5.19',
        'frog',
        '',
        '1.5.6',
        '1.5.4',
        '1.5.5-alpha.beta',
        '1.5.5-alpha',
        '1.5.5',
        'house dog',
        '5',
        '1.5.5-rc.1',
        '1.5.5-beta.0',
        '4.1.3',
        '2.3.1',
        'Jello',
        '35.5',
        '47.48.11.2',
        '10.5.5',
        '11.3.0',
      ];

      versions = versions.sort(compare);
      expect(versions).toStrictEqual([
        'frog',
        'house dog',
        'Jello',
        '',
        '1.2.3',
        '1.5.4',
        '1.5.5-alpha',
        '1.5.5-alpha.beta',
        '1.5.5-beta.0',
        '1.5.5-rc.1',
        '1.5.5',
        '1.5.6',
        '1.5.19',
        '2.3.1',
        '4.1.3',
        '4.2.0',
        '4.11.6',
        '5',
        '10.5.5',
        '11.3.0',
        '35.5',
        '47.48.11.2',
      ]);
    });

    it('compares versions with the same version number and different labels', () => {
      const versionA = '1.2.0-alpha';
      const versionB = '1.2.0-beta';

      expect(compare(versionA, versionB)).toEqual(-1);
      expect(compare(versionB, versionA)).toEqual(1);
    });

    it('compares versions with the same version number, one without a label', () => {
      const versionA = '1.2.0-alpha';
      const versionB = '1.2.0';

      expect(compare(versionA, versionB)).toEqual(-1);
      expect(compare(versionB, versionA)).toEqual(1);
    });
  });
});
