import { compare } from './semver';

export interface IVersion {
  /**
   * Get the major part of a version (e.g. for `1.0.2`, the major part will be `1`).
   */
  getMajor(): string;

  /**
   * Get the minor part of a version (e.g. for `1.0.2`, the minor part will be `0`).
   */
  getMinor(): string;

  /**
   * Get the patch part of a version (e.g. for `1.0.2`, the patch part will be `2`).
   */
  getPatch(): string;

  /**
   * Get the version pre-release information (e.g for `1.0.1-beta`, the
   * pre-release information will be `beta`).
   */
  getPreRelease(): string;

  /**
   * Get the version metadata (e.g for `1.0.1+meta`, the
   * metadata will be `meta`).
   */
  getMetadata(): string;

  /**
   * Compare 2 versions.
   * Returns `-1` when the current version is older than the given version.
   * Returns `0` when the current version is equal to the given version.
   * Returns `1` when the current version is newer than the given version.
   * @param withVersion
   */
  compare(withVersion: IVersion): -1 | 0 | 1;

  /**
   * Serialize the version into the SemVer string representation.
   */
  toString(): string;
}

const semverRegexp =
  /(?<major>([0-9]+))\.(?<minor>([0-9]+))\.(?<patch>([0-9]+))(\-(?<prerelease>(.*?(?=\+|$))))?(\+(?<metadata>(.*?(?=\s|$))))?/;

export class VersionImpl implements IVersion {
  constructor(from?: string) {
    if (from) {
      this.parseFromString(from);
    }
  }

  public getMajor(): string {
    return this.major;
  }

  public getMinor(): string {
    return this.minor;
  }

  public getPatch(): string {
    return this.patch;
  }

  public getPreRelease(): string {
    return this.preRelease;
  }

  public getMetadata(): string {
    return this.metadata;
  }

  public compare(toVersion: IVersion): -1 | 0 | 1 {
    const from = this.toString();
    const to = toVersion.toString();

    return compare(from, to);
  }

  public toString(): string {
    let version = `${this.major}.${this.minor}.${this.patch}`;

    if (this.preRelease) {
      version += `-${this.preRelease}`;
    }

    if (this.metadata) {
      version += `+${this.metadata}`;
    }

    return version;
  }

  public toJSON(): string {
    return this.toString();
  }

  protected major = '0';
  protected minor = '0';
  protected patch = '0';
  protected preRelease = '';
  protected metadata = '';

  protected parseFromString(from: string): void {
    const groups = semverRegexp.exec(from)?.groups;
    if (!groups || !groups.major || !groups.minor || !groups.patch) {
      throw new Error('Invalid version provided.');
    }

    this.major = groups.major;
    this.minor = groups.minor;
    this.patch = groups.patch;
    this.preRelease = groups.prerelease ?? '';
    this.metadata = groups.metadata ?? '';
  }
}
