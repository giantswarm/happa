import { Constants, Providers } from 'model/constants';

import { IVersion, VersionImpl } from './Version';

export interface IRelease {
  version: string;
  active: boolean;
}

export interface ReleaseHelperConfig {
  currentReleaseVersion: string;
  availableReleases: Record<string, IRelease>;
  provider: PropertiesOf<typeof Providers>;
  ignorePreReleases?: boolean;
  isAdmin?: boolean;
}

export class ReleaseHelper {
  public static isPreReleaseUpgradableTo(preReleaseInfo: string): boolean {
    if (!preReleaseInfo) return true;

    // Only support pre-release versions that start with the `beta*` prefix.
    return preReleaseInfo.toLowerCase().startsWith('beta');
  }

  public static isPreReleaseUpgradable(preReleaseInfo: string): boolean {
    if (!preReleaseInfo) return true;

    // Block versions that start with the `alpha*` prefix.
    return !preReleaseInfo.toLowerCase().startsWith('alpha');
  }

  /**
   * A helper class for validating release-specific logic.
   * @param config
   * @throws
   */
  constructor(config: ReleaseHelperConfig) {
    this.currentVersion = new VersionImpl(config.currentReleaseVersion);

    this.provider = config.provider;
    this.isAdmin = config.isAdmin ?? false;
    this.ignorePreReleases = config.ignorePreReleases ?? true;

    this.availableReleases = config.availableReleases;
    this.computeVersions();
    this.computeSupportedUpgradeVersions();
  }

  /**
   * Get the next release version that the current version can upgrade to.
   */
  public getNextVersion(): IVersion | null {
    return this.versionsForUpgrade[0] ?? null;
  }

  /**
   * Check if the current version allows an upgrade to a given version.
   * @param toVersion
   */
  public supportsUpgrade(toVersion: string): boolean {
    try {
      const targetVersion = new VersionImpl(toVersion);

      return Boolean(
        this.versionsForUpgrade.find((v) => v.compare(targetVersion) === 0)
      );
    } catch {
      // Couldn't parse the given version.
      return false;
    }
  }

  /**
   * Get all the versions that the current version can upgrade to.
   */
  public getSupportedUpgradeVersions(): IVersion[] {
    return this.versionsForUpgrade.slice();
  }

  protected computeSupportedUpgradeVersions(): void {
    const currentPreReleaseInfo = this.currentVersion.getPreRelease();
    if (!ReleaseHelper.isPreReleaseUpgradable(currentPreReleaseInfo)) {
      // The current version is a pre-release that can't be upgraded.
      this.versionsForUpgrade = [];

      return;
    }

    const awsV5Version = new VersionImpl(Constants.AWS_V5_VERSION);

    let currVersionFound = false;
    const upgradeVersions: IVersion[] = this.versions.filter((version) => {
      if (version === this.currentVersion) {
        currVersionFound = true;

        return false;
      } else if (!currVersionFound) {
        return false;
      }

      if (
        this.provider === Providers.AWS &&
        this.currentVersion.compare(awsV5Version) < 0 &&
        version.compare(awsV5Version) >= 0
      ) {
        // AWS does not allow upgrading from a pre-NP to a NP version.
        return false;
      }

      const versionNumber = version.toString();
      if (!this.availableReleases[versionNumber].active && !this.isAdmin) {
        // Admins can upgrade to inactive versions, but regular users don't.
        return false;
      }

      const preReleaseInfo = version.getPreRelease();
      if (this.ignorePreReleases && preReleaseInfo) {
        // Pre-releases are configured to be invalid, but the version is a pre-release.
        return false;
      }
      if (!ReleaseHelper.isPreReleaseUpgradableTo(preReleaseInfo)) {
        // This is not a pre-release that we can upgrade to.
        return false;
      }

      const currentMajor = parseInt(this.currentVersion.getMajor(), 10);
      const nextMajor = parseInt(version.getMajor(), 10);
      if (nextMajor - currentMajor > 1) {
        // Tried to skip a major version. We don't allow skipping major versions.
        return false;
      }

      return true;
    });

    this.versionsForUpgrade = upgradeVersions;
  }

  protected computeVersions(): void {
    let versions: IVersion[] = [];

    versions.push(this.currentVersion);
    const currentReleaseVersion = this.currentVersion.toString();

    for (const release of Object.values(this.availableReleases)) {
      if (currentReleaseVersion === release.version) {
        continue;
      }

      try {
        const version = new VersionImpl(release.version);
        versions.push(version);
      } catch {
        continue;
      }
    }

    // Sort versions in ascending order.
    versions = versions.sort((a, b) => a.compare(b));

    this.versions = versions;
  }

  protected availableReleases: Record<string, IRelease> = {};
  protected isAdmin: boolean = false;
  protected ignorePreReleases: boolean = false;
  protected provider: PropertiesOf<typeof Providers>;

  protected currentVersion: IVersion;
  protected versions: IVersion[] = [];
  protected versionsForUpgrade: IVersion[] = [];
}
