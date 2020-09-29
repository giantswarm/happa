import { compare } from 'lib/semver';

describe('semver', () => {
  describe('compare', () => {
    it('compares versions with the semver format', () => {
      let versions = [
        '1.2.3',
        '4.11.6',
        '4.2.0',
        '1.5.19',
        '',
        '1.5.6',
        '1.5.4',
        '1.5.5-alpha.beta',
        '1.5.5-alpha',
        '1.5.5',
        '5',
        '1.5.5-rc.1',
        '1.5.5-beta.0',
        '4.1.3',
        '2.3.1',
        '35.5',
        '47.48.11.2',
        '10.5.5',
        '11.3.0',
      ];

      versions = versions.sort(compare);
      expect(versions).toStrictEqual([
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
  });
});
