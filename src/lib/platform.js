//
// A wrapper around platform.js that returns just:
// 'Windows', 'Mac', 'Linux', or 'Unknown'
//
// https://github.com/bestiejs/platform.js/
//
//

const platform = require('platform');

let result = 'Unknown';

// Get a string representing the platform
// It is too detailed for us though, so we do a bit more work later.
const detailedPlatform = platform.os.family;
// * Common values include:
// * 'Windows', 'Windows 7 / Server 2008 R2', 'Windows Vista / Server 2008',
// * 'Windows XP', 'OS X', 'Ubuntu', 'Debian', 'Fedora', 'Red Hat', 'SuSE',
// * 'Android', 'iOS' and 'Windows Phone'

const mapping = {
  Linux: ['Ubuntu', 'Debian', 'Fedora', 'Red Hat', 'SuSE', 'Android'],
  Mac: ['iOS', 'OS X'],
  Windows: ['Windows'],
};

//
// Loop over mapping, comparing each value with detailedPlatform
// if detailedPlatform contains one of those values in it somewhere
// set the result to the key.
//
// eslint-disable-next-line no-labels
outer: for (const key in mapping) {
  if (mapping.hasOwnProperty(key)) {
    const eligibleMatches = mapping[key];

    for (const find of eligibleMatches) {
      if (detailedPlatform !== null && detailedPlatform.indexOf(find) !== -1) {
        result = key;

        // eslint-disable-next-line no-labels
        break outer;
      }
    }
  }
}

module.exports = result;
