/**
 * Compare 2 versions formatted with the Semver format.
 * Returns `-1` when `a` is older than `b`.
 * Returns `0` when `a` is equal to `b`.
 * Returns `1` when `a` is newer than `b`.
 * @source https://github.com/substack/semver-compare/issues/1#issuecomment-594765531
 * @param a
 * @param b
 */
export function compare(a: string, b: string): -1 | 0 | 1 {
  const aParts = a.split('-');
  const bParts = b.split('-');
  const pa = aParts[0].split('.').map(Number);
  const pb = bParts[0].split('.').map(Number);

  // Compare release version number parts.
  let na = 0;
  let nb = 0;
  for (let i = 0; i < 3; i++) {
    na = pa[i];
    nb = pb[i];

    switch (true) {
      case na > nb:
      case !isNaN(na) && isNaN(nb):
        return 1;

      case nb > na:
      case isNaN(na) && !isNaN(nb):
        return -1;
    }
  }

  /**
   * Version numbers are equal.
   * Compare pre-release labels (such as `*-alpha` or `*-rc.1`).
   */
  switch (true) {
    case aParts[1] && bParts[1] && aParts[1] > bParts[1]:
    case bParts[1] && !aParts[1]:
      return 1;

    case aParts[1] && bParts[1] && aParts[1] < bParts[1]:
    case aParts[1] && !bParts[1]:
      return -1;

    default:
      return 0;
  }
}
