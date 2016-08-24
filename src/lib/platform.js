'use strict';

//
// A wrapper around platform.js that returns just:
// 'Windows', 'Mac', 'Linux', or 'Unknown'
//
// https://github.com/bestiejs/platform.js/
//
//

var platform = require('platform');

var result = 'Unknown';

// Get a string representing the platform
// It is too detailed for us though, so we do a bit more work later.
var detailedPlatform = platform.os.family;
            // * Common values include:
            // * 'Windows', 'Windows 7 / Server 2008 R2', 'Windows Vista / Server 2008',
            // * 'Windows XP', 'OS X', 'Ubuntu', 'Debian', 'Fedora', 'Red Hat', 'SuSE',
            // * 'Android', 'iOS' and 'Windows Phone'

var mapping = {
  'Linux': ['Ubuntu', 'Debian', 'Fedora', 'Red Hat', 'SuSE', 'Android'],
  'Mac': ['iOS', 'OS X'],
  'Windows': ['Windows']
};

//
// Loop over mapping, comparing each value with detailedPlatform
// if detailedPlatform contains one of those values in it somewhere
// set the result to the key.
//
outer:
  for (var key in mapping) {
     if (mapping.hasOwnProperty(key)) {
        var eligibleMatches = mapping[key];
        var resultingPlatform = key;

        for (var find of eligibleMatches) {

          if (detailedPlatform.indexOf(find) !== -1) {
            result = key;
            break outer;
          }

        }
     }
  }

module.exports = result;

