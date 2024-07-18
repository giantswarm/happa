import { Providers } from 'model/constants';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import * as ui from 'UI/Display/MAPI/releases/types';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { IRelease, ReleaseHelper } from 'utils/ReleaseHelper';

export function getReleaseHelper(
  currVersion: string,
  provider: PropertiesOf<typeof Providers>,
  isAdmin: boolean,
  releases: releasev1alpha1.IRelease[],
  ignorePreReleases = true
) {
  const mappedReleases = releases.reduce(
    (acc: Record<string, IRelease>, r: releasev1alpha1.IRelease) => {
      const normalizedVersion = normalizeReleaseVersion(r.metadata.name);

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

export function getSupportedUpgradeVersions(
  currVersion: string,
  provider: PropertiesOf<typeof Providers>,
  isAdmin: boolean,
  releases: releasev1alpha1.IRelease[]
): ui.IReleaseVersion[] {
  try {
    const releaseHelper = getReleaseHelper(
      currVersion,
      provider,
      isAdmin,
      releases
    );

    const availableReleases = releaseHelper.getSupportedUpgradeVersions();

    return availableReleases.map((r) => {
      const status =
        r.getPreRelease().length > 0
          ? ui.ReleaseVersionStatus.PreRelease
          : ui.ReleaseVersionStatus.Stable;

      return {
        version: r.toString(),
        status,
      };
    });
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);

    return [];
  }
}

interface IComponent {
  name: string;
  version: string;
}

export function reduceReleaseToComponents(
  release: releasev1alpha1.IRelease
): Record<string, IComponent> {
  const components: Record<string, IComponent> = {};

  for (const component of release.spec.components) {
    components[component.name] = {
      name: component.name,
      version: component.version,
    };
  }

  if (release.spec.apps) {
    for (const component of release.spec.apps) {
      components[component.name] = {
        name: component.name,
        version: component.componentVersion ?? component.version,
      };
    }
  }

  return components;
}

export function getReleaseComponentsDiff(
  a: releasev1alpha1.IRelease,
  b: releasev1alpha1.IRelease
): ui.IReleaseComponentsDiff {
  const aComponents = reduceReleaseToComponents(a);
  const bComponents = reduceReleaseToComponents(b);

  const diff: ui.IReleaseComponentsDiff = {
    changes: [],
  };

  for (const component of Object.values(aComponents)) {
    const oldVersion = component.version;
    const newVersion = bComponents[component.name]?.version;

    if (!newVersion) {
      // The component no longer exists, so it has been deleted.
      diff.changes.push({
        component: component.name,
        changeType: ui.ReleaseComponentsDiffChangeType.Delete,
        oldVersion,
      });

      continue;
    }

    if (oldVersion !== newVersion) {
      // A component's version has changed.
      diff.changes.push({
        component: component.name,
        changeType: ui.ReleaseComponentsDiffChangeType.Update,
        oldVersion,
        newVersion,
      });
    }
  }

  // Look for newly added components.
  for (const component of Object.values(bComponents)) {
    if (aComponents.hasOwnProperty(component.name)) continue;

    diff.changes.push({
      component: component.name,
      changeType: ui.ReleaseComponentsDiffChangeType.Add,
      newVersion: component.version,
    });
  }

  // Sort changes by component name, in an ascending order.
  diff.changes = diff.changes.sort((rA, rB) =>
    rA.component.localeCompare(rB.component)
  );

  return diff;
}

export function getPreviewReleaseVersions(
  releases: releasev1alpha1.IRelease[]
): string[] {
  const releaseVersions: string[] = [];

  for (const release of releases) {
    if (release.spec.state === 'preview')
      releaseVersions.push(release.metadata.name);
  }

  return releaseVersions;
}

export function normalizeReleaseVersion(version: string): string {
  const normalizedVersion = version.replace(/^(aws-|azure-)/, '');
  if (normalizedVersion.toLowerCase().startsWith('v')) {
    return normalizedVersion.substring(1);
  }

  return normalizedVersion;
}
