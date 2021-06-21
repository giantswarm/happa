import { IRelease, ReleaseHelper } from 'lib/ReleaseHelper';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export function getReleaseHelper(
  currVersion: string,
  provider: PropertiesOf<typeof Providers>,
  isAdmin: boolean,
  releases: releasev1alpha1.IRelease[],
  ignorePreReleases = true
) {
  const mappedReleases = releases.reduce(
    (acc: Record<string, IRelease>, r: releasev1alpha1.IRelease) => {
      // Remove the `v` prefix.
      const normalizedVersion = r.metadata.name.slice(1);

      acc[normalizedVersion] = {
        version: normalizedVersion,
        active: r.spec.state === 'active',
      };

      return acc;
    },
    {}
  );

  const releaseHelper = new ReleaseHelper({
    availableReleases: mappedReleases,
    provider,
    currentReleaseVersion: currVersion,
    isAdmin,
    ignorePreReleases,
  });

  return releaseHelper;
}
