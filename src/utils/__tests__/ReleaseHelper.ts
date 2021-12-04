import { Providers } from 'model/constants';
import { ReleaseHelper } from 'utils/ReleaseHelper';

describe('ReleaseHelper', () => {
  const availableReleases: IReleases = {
    '8.0.0': createRelease('8.0.0', true),
    '8.0.1': createRelease('8.0.1', false),
    '9.0.0': createRelease('9.0.0', false),
    '9.0.1': createRelease('9.0.1', false),
    '9.0.2': createRelease('9.0.2', false),
    '9.0.3': createRelease('9.0.3', true),
    '9.1.0': createRelease('9.1.0', true),
    '9.1.3-alpha.1': createRelease('9.1.3-alpha.1', true),
    '9.1.5': createRelease('9.1.5', true),
    '9.2.3': createRelease('9.2.3', true),
    '9.2.4-beta3': createRelease('9.2.4-beta3', true),
    '9.2.4-beta4': createRelease('9.2.4-beta4', true),
    '9.3.0': createRelease('9.3.0', true),
    '10.0.0': createRelease('10.0.0', false),
    '10.0.23': createRelease('10.0.23', true),
    '10.1.0': createRelease('10.1.0', true),
  };

  test.each`
    currVersion        | provider   | ignorePreReleases | isAdmin  | targetVersion      | expected
    ${'8.0.0'}         | ${'aws'}   | ${true}           | ${false} | ${'8.0.1'}         | ${false}
    ${'9.0.0'}         | ${'aws'}   | ${true}           | ${true}  | ${'9.0.2'}         | ${true}
    ${'9.1.0'}         | ${'aws'}   | ${false}          | ${false} | ${'9.1.3-alpha.1'} | ${false}
    ${'9.1.0'}         | ${'aws'}   | ${false}          | ${true}  | ${'9.1.3-alpha.1'} | ${false}
    ${'9.1.3-alpha.1'} | ${'aws'}   | ${true}           | ${false} | ${'9.1.5'}         | ${false}
    ${'9.1.3-alpha.1'} | ${'aws'}   | ${true}           | ${true}  | ${'9.1.5'}         | ${false}
    ${'9.2.3'}         | ${'aws'}   | ${true}           | ${false} | ${'9.2.4-beta3'}   | ${false}
    ${'9.2.3'}         | ${'aws'}   | ${false}          | ${false} | ${'9.2.4-beta3'}   | ${true}
    ${'9.2.4-beta3'}   | ${'aws'}   | ${true}           | ${false} | ${'9.2.4-beta4'}   | ${false}
    ${'9.2.4-beta3'}   | ${'aws'}   | ${false}          | ${false} | ${'9.2.4-beta4'}   | ${true}
    ${'9.2.4-beta3'}   | ${'aws'}   | ${true}           | ${false} | ${'9.3.0'}         | ${true}
    ${'10.1.0'}        | ${'aws'}   | ${true}           | ${false} | ${'10.0.23'}       | ${false}
    ${'9.3.0'}         | ${'aws'}   | ${true}           | ${false} | ${'10.0.0'}        | ${false}
    ${'9.3.0'}         | ${'aws'}   | ${true}           | ${true}  | ${'10.0.0'}        | ${false}
    ${'9.3.0'}         | ${'azure'} | ${true}           | ${false} | ${'10.0.23'}       | ${true}
    ${'9.3.0'}         | ${'azure'} | ${true}           | ${true}  | ${'10.0.23'}       | ${true}
    ${'8.0.0'}         | ${'azure'} | ${true}           | ${false} | ${'10.0.23'}       | ${false}
    ${'8.0.0'}         | ${'azure'} | ${true}           | ${true}  | ${'10.0.23'}       | ${false}
    ${'9.1.0'}         | ${'azure'} | ${true}           | ${false} | ${'9.3.0'}         | ${true}
    ${'9.1.0'}         | ${'azure'} | ${true}           | ${true}  | ${'9.3.0'}         | ${true}
  `(
    'validates upgrade from $currVersion to $targetVersion on $provider',
    ({
      currVersion,
      provider,
      ignorePreReleases,
      isAdmin,
      targetVersion,
      expected,
    }: {
      currVersion: string;
      provider: PropertiesOf<typeof Providers>;
      ignorePreReleases: boolean;
      isAdmin: boolean;
      targetVersion: string;
      expected: string;
    }) => {
      const helper = new ReleaseHelper({
        currentReleaseVersion: currVersion,
        availableReleases,
        provider,
        ignorePreReleases: ignorePreReleases,
        isAdmin,
      });

      expect(helper.supportsUpgrade(targetVersion)).toBe(expected);
    }
  );

  test.each`
    currVersion        | provider   | ignorePreReleases | isAdmin  | expected
    ${'8.0.0'}         | ${'aws'}   | ${true}           | ${false} | ${'9.0.3'}
    ${'9.0.0'}         | ${'aws'}   | ${true}           | ${true}  | ${'9.0.1'}
    ${'9.1.0'}         | ${'aws'}   | ${false}          | ${false} | ${'9.1.5'}
    ${'9.1.0'}         | ${'aws'}   | ${false}          | ${true}  | ${'9.1.5'}
    ${'9.1.3-alpha.1'} | ${'aws'}   | ${true}           | ${false} | ${null}
    ${'9.1.3-alpha.1'} | ${'aws'}   | ${true}           | ${true}  | ${null}
    ${'9.2.3'}         | ${'aws'}   | ${true}           | ${false} | ${'9.3.0'}
    ${'9.2.3'}         | ${'aws'}   | ${false}          | ${false} | ${'9.2.4-beta3'}
    ${'9.2.4-beta3'}   | ${'aws'}   | ${true}           | ${false} | ${'9.3.0'}
    ${'9.2.4-beta3'}   | ${'aws'}   | ${false}          | ${false} | ${'9.2.4-beta4'}
    ${'10.1.0'}        | ${'aws'}   | ${true}           | ${false} | ${null}
    ${'9.3.0'}         | ${'aws'}   | ${true}           | ${false} | ${null}
    ${'9.3.0'}         | ${'aws'}   | ${true}           | ${true}  | ${null}
    ${'9.3.0'}         | ${'azure'} | ${true}           | ${false} | ${'10.0.23'}
    ${'9.3.0'}         | ${'azure'} | ${true}           | ${true}  | ${'10.0.0'}
    ${'8.0.0'}         | ${'azure'} | ${true}           | ${false} | ${'9.0.3'}
    ${'8.0.0'}         | ${'azure'} | ${true}           | ${true}  | ${'8.0.1'}
    ${'9.1.0'}         | ${'azure'} | ${true}           | ${false} | ${'9.1.5'}
    ${'9.1.0'}         | ${'azure'} | ${true}           | ${true}  | ${'9.1.5'}
  `(
    'gets successor of $currVersion on $provider',
    ({ currVersion, provider, ignorePreReleases, isAdmin, expected }) => {
      const helper = new ReleaseHelper({
        currentReleaseVersion: currVersion,
        availableReleases,
        provider,
        ignorePreReleases: ignorePreReleases,
        isAdmin,
      });

      expect(helper.getNextVersion()?.toString() ?? null).toBe(expected);
    }
  );

  test.each`
    currVersion        | provider   | ignorePreReleases | isAdmin  | expected
    ${'8.0.0'}         | ${'aws'}   | ${true}           | ${false} | ${['9.0.3', '9.1.0', '9.1.5', '9.2.3', '9.3.0']}
    ${'9.0.0'}         | ${'aws'}   | ${true}           | ${true}  | ${['9.0.1', '9.0.2', '9.0.3', '9.1.0', '9.1.5', '9.2.3', '9.3.0']}
    ${'9.0.0'}         | ${'aws'}   | ${true}           | ${false} | ${['9.0.3', '9.1.0', '9.1.5', '9.2.3', '9.3.0']}
    ${'9.1.0'}         | ${'aws'}   | ${false}          | ${false} | ${['9.1.5', '9.2.3', '9.2.4-beta3', '9.2.4-beta4', '9.3.0']}
    ${'9.1.0'}         | ${'aws'}   | ${false}          | ${true}  | ${['9.1.5', '9.2.3', '9.2.4-beta3', '9.2.4-beta4', '9.3.0']}
    ${'9.1.3-alpha.1'} | ${'aws'}   | ${true}           | ${false} | ${[]}
    ${'9.1.3-alpha.1'} | ${'aws'}   | ${true}           | ${true}  | ${[]}
    ${'9.2.3'}         | ${'aws'}   | ${true}           | ${false} | ${['9.3.0']}
    ${'9.2.3'}         | ${'aws'}   | ${false}          | ${false} | ${['9.2.4-beta3', '9.2.4-beta4', '9.3.0']}
    ${'9.2.4-beta3'}   | ${'aws'}   | ${true}           | ${false} | ${['9.3.0']}
    ${'9.2.4-beta3'}   | ${'aws'}   | ${false}          | ${false} | ${['9.2.4-beta4', '9.3.0']}
    ${'10.1.0'}        | ${'aws'}   | ${true}           | ${false} | ${[]}
    ${'9.3.0'}         | ${'aws'}   | ${true}           | ${false} | ${[]}
    ${'9.3.0'}         | ${'aws'}   | ${true}           | ${true}  | ${[]}
    ${'9.3.0'}         | ${'azure'} | ${true}           | ${false} | ${['10.0.23', '10.1.0']}
    ${'9.3.0'}         | ${'azure'} | ${true}           | ${true}  | ${['10.0.0', '10.0.23', '10.1.0']}
    ${'8.0.1'}         | ${'azure'} | ${true}           | ${false} | ${['9.0.3', '9.1.0', '9.1.5', '9.2.3', '9.3.0']}
    ${'8.0.1'}         | ${'azure'} | ${true}           | ${true}  | ${['9.0.0', '9.0.1', '9.0.2', '9.0.3', '9.1.0', '9.1.5', '9.2.3', '9.3.0']}
    ${'9.1.0'}         | ${'azure'} | ${true}           | ${false} | ${['9.1.5', '9.2.3', '9.3.0', '10.0.23', '10.1.0']}
    ${'9.1.0'}         | ${'azure'} | ${true}           | ${true}  | ${['9.1.5', '9.2.3', '9.3.0', '10.0.0', '10.0.23', '10.1.0']}
  `(
    'gets supported upgrade versions for $currVersion on $provider',
    ({ currVersion, provider, ignorePreReleases, isAdmin, expected }) => {
      const helper = new ReleaseHelper({
        currentReleaseVersion: currVersion,
        availableReleases,
        provider,
        ignorePreReleases: ignorePreReleases,
        isAdmin,
      });

      const supportedUpgradeVersions = helper
        .getSupportedUpgradeVersions()
        .map((v) => v.toString());
      expect(supportedUpgradeVersions).toStrictEqual(expected);
    }
  );
});

function createRelease(version: string, active: boolean): IRelease {
  return {
    version,
    active,
    timestamp: '2020-06-11T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.16.3' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
    kubernetesVersion: '1.16.3',
    releaseNotesURL: 'dummy',
  } as IRelease;
}
