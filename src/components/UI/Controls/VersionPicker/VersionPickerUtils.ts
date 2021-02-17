export interface IVersion {
  // The version.
  chartVersion: string;

  // When it was created.
  created: string;

  // The version of the app that this chart provides.
  includesVersion: string;

  // Whether or not this version is a test version.
  test: boolean;
}

export function checkIfContainsTestVersions(versionCollection?: IVersion[]) {
  return versionCollection?.some((v) => v.test) ?? false;
}

export function filterVersions(
  shouldIncludeTestVersions: boolean,
  versionCollection?: IVersion[]
) {
  if (!versionCollection) return [];

  return versionCollection.filter((version) => {
    if (!shouldIncludeTestVersions && version.test) {
      return false;
    }

    return true;
  });
}
