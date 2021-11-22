import * as platform from 'platform';

const mapping = {
  Linux: ['Ubuntu', 'Debian', 'Fedora', 'Red Hat', 'SuSE', 'Android'],
  Mac: ['iOS', 'OS X'],
  Windows: ['Windows'],
};
const detailedPlatform = platform.os?.family ?? null;

/**
 * Loop over mapping, comparing each value with `detailedPlatform`.
 * If detailedPlatform contains one of those values in it somewhere
 * set the result to the key.
 */
let result = 'Unknown';
if (detailedPlatform) {
  for (const [name, matches] of Object.entries(mapping)) {
    if (matches.find((entry) => detailedPlatform.includes(entry))) {
      result = name;

      break;
    }
  }
}

export default result;
