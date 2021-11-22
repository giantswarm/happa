import { VersionImpl } from 'utils/Version';

describe('VersionImpl', () => {
  it('parses the version from a given string', () => {
    interface Case {
      input: string;
      expectedMajor: string;
      expectedMinor: string;
      expectedPatch: string;
      expectedPreRelease: string;
      expectedMetadata: string;
    }

    const cases: Case[] = [
      {
        input: '1.0.1',
        expectedMajor: '1',
        expectedMinor: '0',
        expectedPatch: '1',
        expectedPreRelease: '',
        expectedMetadata: '',
      },
      {
        input: '1.2.3',
        expectedMajor: '1',
        expectedMinor: '2',
        expectedPatch: '3',
        expectedPreRelease: '',
        expectedMetadata: '',
      },
      {
        input: '12.223.35.123',
        expectedMajor: '12',
        expectedMinor: '223',
        expectedPatch: '35',
        expectedPreRelease: '',
        expectedMetadata: '',
      },
      {
        input: '120.2.31',
        expectedMajor: '120',
        expectedMinor: '2',
        expectedPatch: '31',
        expectedPreRelease: '',
        expectedMetadata: '',
      },
      {
        input: '2.51.3-beta',
        expectedMajor: '2',
        expectedMinor: '51',
        expectedPatch: '3',
        expectedPreRelease: 'beta',
        expectedMetadata: '',
      },
      {
        input: '3.41.2-alpha.23123.hi',
        expectedMajor: '3',
        expectedMinor: '41',
        expectedPatch: '2',
        expectedPreRelease: 'alpha.23123.hi',
        expectedMetadata: '',
      },
      {
        input: '1.0.1+random',
        expectedMajor: '1',
        expectedMinor: '0',
        expectedPatch: '1',
        expectedPreRelease: '',
        expectedMetadata: 'random',
      },
      {
        input: '1.3.5-beta+random',
        expectedMajor: '1',
        expectedMinor: '3',
        expectedPatch: '5',
        expectedPreRelease: 'beta',
        expectedMetadata: 'random',
      },
      {
        input: 'Hello friends, 1.3.5-rc.1+clang is my latest release',
        expectedMajor: '1',
        expectedMinor: '3',
        expectedPatch: '5',
        expectedPreRelease: 'rc.1',
        expectedMetadata: 'clang',
      },
    ];

    for (const testCase of cases) {
      const version = new VersionImpl(testCase.input);
      expect(version.getMajor()).toEqual(testCase.expectedMajor);
      expect(version.getMinor()).toEqual(testCase.expectedMinor);
      expect(version.getPatch()).toEqual(testCase.expectedPatch);
      expect(version.getPreRelease()).toEqual(testCase.expectedPreRelease);
      expect(version.getMetadata()).toEqual(testCase.expectedMetadata);
    }
  });

  it('throws an error if the provided string is not a valid version number', () => {
    const invalidInputs = ['12.1', '.2.1', '12', '12.0.', '///', 'dog'];

    for (const input of invalidInputs) {
      expect(() => new VersionImpl(input)).toThrowError(
        'Invalid version provided.'
      );
    }
  });

  it('compares versions correctly', () => {
    const versions = [
      '1.2.3',
      '4.11.6',
      '4.2.0',
      '1.5.19',
      '1.5.6',
      '1.5.4',
      '1.5.5-alpha.beta',
      '1.5.5-alpha',
      '1.5.5',
      '1.5.5-rc.1',
      '1.5.5-beta.0',
      '4.1.3',
      '2.3.1',
      '47.48.11.2',
      '10.5.5',
      '11.3.0',
    ];

    let parsedVersions = versions.map((v) => new VersionImpl(v));
    parsedVersions = parsedVersions.sort((a, b) => {
      return a.compare(b);
    });

    const sortedVersions = parsedVersions.map((v) => v.toString());
    expect(sortedVersions).toStrictEqual([
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
      '10.5.5',
      '11.3.0',
      '47.48.11',
    ]);
  });
});
