import moment from 'moment';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import validate from 'validate.js';

export function dedent(strings, ...values) {
  let raw = [];

  if (typeof strings === 'string') {
    // dedent can be used as a plain function
    raw = [strings];
  } else {
    raw = strings.raw;
  }

  // first, perform interpolation
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i]
      // handle escaped backticks
      .replace(/\\`/g, '`');

    if (i < values.length) {
      result += values[i];
    }
  }

  // now strip indentation
  const lines = result.split('\n');
  let mindent = null;
  lines.forEach(l => {
    const m = /^(\s+)\S+/.exec(l);
    if (m) {
      const indent = m[1].length;
      if (!mindent) {
        // this is the first indented line
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    result = lines
      .map(l => (l.startsWith(' ') ? l.slice(mindent) : l))
      .join('\n');
  }

  // dedent eats leading and trailing whitespace too
  result = result.trim();

  // handle escaped newlines at the end to ensure they don't get stripped too
  return result.replace(/\\n/g, '\n');
}

export function humanFileSize(bytes, si = true, decimals = 1) {
  // http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
  // eslint-disable-next-line no-magic-numbers
  const thresh = si ? 1000 : 1024;
  let newBytes = bytes;

  if (Math.abs(newBytes) < thresh) {
    return {
      value: newBytes.toFixed(decimals),
      unit: 'B',
    };
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  let u = -1;

  do {
    newBytes /= thresh;
    ++u;
  } while (Math.abs(newBytes) >= thresh && u < units.length - 1);

  return {
    value: newBytes.toFixed(decimals),
    unit: units[u],
  };
}

// validateOrRaise
// ----------------
// Helper method that validates an object based on constraints.
// Raises a TypeError with helpful message if the validation fails.
//
export function validateOrRaise(validatable, constraints) {
  const validationErrors = validate(validatable, constraints, {
    fullMessages: false,
  });

  if (validationErrors) {
    // If there are validation errors, throw a TypeError that has readable
    // information about what went wrong.
    const messages = Object.entries(validationErrors).map(
      ([field, errorMessages]) => {
        return `${field}: ${errorMessages.join(', ')}`;
      }
    );
    throw new TypeError(messages.join('\n'));
  }
}

export function formatDate(ISO8601DateString) {
  // http://momentjs.com/docs/#/displaying/
  return moment.utc(ISO8601DateString).format('D MMM YYYY, HH:mm z');
}

export function relativeDate(ISO8601DateString) {
  if (!ISO8601DateString) {
    return <span>n/a</span>;
  }

  const formattedDate = formatDate(ISO8601DateString);
  const relDate = moment.utc(ISO8601DateString).fromNow();

  return (
    <OverlayTrigger
      overlay={<Tooltip id='tooltip'>{formattedDate}</Tooltip>}
      placement='top'
    >
      <span>{relDate}</span>
    </OverlayTrigger>
  );
}

export function toTitleCase(str) {
  // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Truncate a string in a smart way
 *
 * @param {string} str - String to truncate
 * @param {string} replacer - The symbol displayed between the start chars and the end chars
 * @param {number} numStartChars - Chars to keep unmangled in the beginning
 * @param {number} numEndChars - Chars to keep unmangled in the end
 * @returns {string}
 */
export function truncate(str, replacer, numStartChars, numEndChars) {
  const maxLength = numStartChars + numEndChars + replacer.length;

  if (str.length <= maxLength || numEndChars === 0 || numEndChars === 0) {
    return str;
  }

  const result = [
    str.substring(0, numStartChars),
    replacer,
    str.substring(str.length - numEndChars),
  ];

  return result.join('');
}

export function makeKubeConfigTextFile(cluster, keyPairResult, useInternalAPI) {
  let apiEndpoint = cluster.api_endpoint;

  // Change something like: https://api.j7j4c.g8s.fra-1.giantswarm.io
  // into: https://internal-api.j7j4c.g8s.fra-1.giantswarm.io
  // if useInternalAPI is true.
  if (useInternalAPI) {
    apiEndpoint = apiEndpoint.replace('api', 'internal-api');
  }

  const namePrefix = `giantswarm-${cluster.id}`;
  const currentContext = `${namePrefix}-context`;
  const currentUser = `${namePrefix}-user`;

  return `
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        certificate-authority-data: ${btoa(
          keyPairResult.certificate_authority_data
        )}
        server: ${apiEndpoint}
      name: ${namePrefix}
    contexts:
    - context:
        cluster: ${namePrefix}
        user: ${currentUser}
      name: ${currentContext}
    current-context: ${currentContext}
    users:
    - name: ${currentUser}
      user:
        client-certificate-data: ${btoa(keyPairResult.client_certificate_data)}
        client-key-data: ${btoa(keyPairResult.client_key_data)}
    `;
}

// clustersForOrg takes a orgId and a list of clusters and returns just the clusters
// that are owned by that orgId
export function clustersForOrg(orgId, allClusters) {
  return allClusters
    ? Object.values(allClusters).filter(cluster => cluster.owner === orgId)
    : [];
}

// isJwtExpired expired takes a JWT token and will return true if it is expired.
export function isJwtExpired(token) {
  const msToS = 1000;
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const parsedToken = JSON.parse(window.atob(base64));

  const now = Math.round(Date.now() / msToS); // Browsers have millisecond precision, which we don't need.
  const expire = parsedToken.exp;

  return now > expire;
}

/**
 * Validate if a string is within a given interval of
 * number of letters.
 * @param str - The string to check.
 * @param min - The minimum permitted length.
 * @param max - The maximum permitted length.
 */
export function hasAppropriateLength(
  str: string,
  min: number,
  max: number
): {
  isValid: boolean;
  message: string;
} {
  let isValid = false;
  let message = '';
  if (str.trim().length < min) {
    if (min > 0) {
      message = `Name must not contain less than ${min} characters`;
    } else {
      message = 'Name must not be empty';
    }
  } else if (str.length > max) {
    message = `Name must not contain more than ${max} characters`;
  } else {
    isValid = true;
  }

  return { isValid, message };
}
