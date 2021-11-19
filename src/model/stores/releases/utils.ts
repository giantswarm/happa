import { compareDates, getRelativeDateFromNow } from 'utils/helpers';

export function getKubernetesReleaseEOLStatus(eolDate: string): {
  message: string;
  isEol: boolean;
} {
  const result = {
    message: '',
    isEol: false,
  };

  if (!eolDate) return result;

  const now = new Date().toISOString();
  const relativeDate = getRelativeDateFromNow(eolDate);
  switch (compareDates(now, eolDate)) {
    case -1:
      result.message = `This Kubernetes version will reach its end of life ${relativeDate}.`;
      break;
    case 0:
      result.message = 'This Kubernetes version reached its end of life today.';
      result.isEol = true;
      break;
    case 1:
      result.message = `This Kubernetes version reached its end of life ${relativeDate}.`;
      result.isEol = true;
      break;
  }

  return result;
}

const preReleaseRegexp = /([0-9]*)\.([0-9]*)\.([0-9]*)([-+].*)/;

/**
 * Check if a version number is a pre-release Semver version.
 * @param version
 */
export function isPreRelease(version: string): boolean {
  return preReleaseRegexp.test(version);
}
