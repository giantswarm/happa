import { compareDates, getRelativeDateFromNow } from 'lib/helpers';

export function getReleaseEOLStatus(
  eolDate: string
): { message: string; isEol: boolean } {
  const result = {
    message: '',
    isEol: false,
  };

  if (!eolDate) return result;

  const now = new Date().toISOString();
  const relativeDate = getRelativeDateFromNow(eolDate);
  switch (compareDates(now, eolDate)) {
    case -1:
      result.message = `This version will reach its end of life ${relativeDate}.`;
      break;
    case 0:
      result.message = 'This version reached its end of life today.';
      result.isEol = true;
      break;
    case 1:
      result.message = `This version reached its end of life ${relativeDate}.`;
      result.isEol = true;
      break;
  }

  return result;
}

const preReleaseRegexp = /([0-9]*)\.([0-9]*)\.([0-9]*)([-+]alpha.*)/;

/**
 * Check if a version number is a pre-release Semver version.
 * @param version
 */
export function isPreRelease(version: string): boolean {
  return preReleaseRegexp.test(version);
}
