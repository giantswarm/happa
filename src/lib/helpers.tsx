import moment from 'moment';
import React, { ReactElement } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { IKeyPair } from 'shared/types';
import validate from 'validate.js';

/**
 * Format code in a user-friendly way.
 * Note: Newline backticks need to be escaped.
 * @example `kubectl version \\
 *       long \\
 *       command`
 * @param str
 */
export function dedent(str: string): string {
  const raw = str;

  // First, perform interpolation.
  const escapeBackticksRegexp = /\\`/g;
  let result = Array.from(raw).reduce((agg: string, char: string) => {
    return agg + char.replace(escapeBackticksRegexp, '`');
  }, '');

  // Now strip indentation.
  const lines = result.split('\n');
  const spacesRegexp = /^(\s+)\S+/;
  let minIndent: number | null = null;
  for (const line of lines) {
    const m = spacesRegexp.exec(line);
    if (!m) continue;

    const indent = m[1].length;
    if (!minIndent) {
      // This is the first indented line.
      minIndent = indent;
    } else {
      minIndent = Math.min(minIndent, indent);
    }
  }

  if (minIndent !== null) {
    result = lines
      .map((l) => (l.startsWith(' ') ? l.slice(minIndent as number) : l))
      .join('\n');
  }

  // Dedent eats leading and trailing whitespace, too.
  result = result.trim();

  // Handle escaped newlines at the end to ensure they don't get stripped too.
  return result.replace(/\\n/g, '\n');
}

type FileSizeUnitSI =
  | 'B'
  | 'kB'
  | 'MB'
  | 'GB'
  | 'TB'
  | 'PB'
  | 'EB'
  | 'ZB'
  | 'YB';
type FileSizeUnitNonSI =
  | 'B'
  | 'KiB'
  | 'MiB'
  | 'GiB'
  | 'TiB'
  | 'PiB'
  | 'EiB'
  | 'ZiB'
  | 'YiB';
type FileSizeUnit<T> = T extends true ? FileSizeUnitSI : FileSizeUnitNonSI;

interface IHumanFileSizeValue<T extends boolean> {
  value: string;
  unit: FileSizeUnit<T>;
}
/**
 * Print a file size into a user-friendly way (e.g. GB/GiB)
 * @param bytes
 * @param si - Whether to use the international system of notation, or not
 * In SI, units like `GB` or `MB` will be used. Without it,
 * units like `GiB` or `MiB` will be used.
 * @param decimals
 * @source http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
 */
export function humanFileSize<T extends boolean = true>(
  bytes: number,
  si: T = true as T,
  decimals = 1
): IHumanFileSizeValue<T> {
  // eslint-disable-next-line no-magic-numbers
  const thresh = si ? 1000 : 1024;
  let newBytes = bytes;

  if (Math.abs(newBytes) < thresh) {
    return {
      value: newBytes.toFixed(decimals),
      unit: 'B' as FileSizeUnit<T>,
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
    unit: units[u] as FileSizeUnit<T>,
  };
}

/**
 * Helper method that validates an object based on constraints.
 * @param validatable - The object to validate.
 * @param constraints - The `validate.js` constraints.
 * @throws {TypeError} Error with a helpful message if the validation fails.
 */
export function validateOrRaise<T>(
  validatable: T,
  constraints: Record<keyof T, Record<string, unknown>>
): void {
  const validationErrors: Record<string, string[]> = validate(
    validatable,
    constraints,
    {
      fullMessages: false,
    }
  );
  if (!validationErrors) return;

  /**
   * If there are validation errors, throw a TypeError that
   * has readable information about what went wrong.
   */
  const messages = Object.entries(validationErrors).map(
    ([field, errorMessages]) => {
      return `${field}: ${errorMessages.join(', ')}`;
    }
  );

  throw new TypeError(messages.join('\n'));
}

/**
 * Format a date into a pretty way.
 * @param date - The date in the `ISO8601DateString` format.
 * @source http://momentjs.com/docs/#/displaying/
 */
export function formatDate(date: string): string {
  return moment.utc(date).format('D MMM YYYY, HH:mm z');
}

/**
 * Get a component containing a formatted given date, relative
 * from now (e.g. 2 days ago).
 * @param date - The date in the `ISO8601DateString` format.
 */
// TODO(axbarsan): Refactor a part of this into a UI component.
export function relativeDate(date: string): ReactElement {
  if (!date) {
    return <span>n/a</span>;
  }

  const formattedDate = formatDate(date);
  const relDate = moment.utc(date).fromNow();

  return (
    <OverlayTrigger
      overlay={<Tooltip id='tooltip'>{formattedDate}</Tooltip>}
      placement='top'
    >
      <span>{relDate}</span>
    </OverlayTrigger>
  );
}

/**
 * Convert a string to title case (e.g. `A Title Cased Example`).
 * @param str
 * @source http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Truncate a string in a smart way.
 * @param str - String to truncate.
 * @param replacer - The symbol displayed between the start chars and the end chars.
 * @param numStartChars - Count of chars to keep unmangled in the beginning.
 * @param numEndChars - Count of chars to keep unmangled in the end.
 */
export function truncate(
  str: string,
  replacer: string,
  numStartChars: number,
  numEndChars: number
): string {
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

/**
 * Generate a kubeconfig YAML file.
 * @param cluster
 * @param keyPair
 * @param useInternalAPI
 */
// FIXME(axbarsan): Use proper cluster type.
export function makeKubeConfigTextFile(
  cluster: Record<string, unknown>,
  keyPair: IKeyPair,
  useInternalAPI: boolean
): string {
  let apiEndpoint: string = cluster.api_endpoint as string;

  /**
   * Change something like: https://api.j7j4c.g8s.fra-1.giantswarm.io
   * into: https://internal-api.j7j4c.g8s.fra-1.giantswarm.io
   * if `useInternalAPI` is true.
   */
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
        certificate-authority-data: ${btoa(keyPair.certificate_authority_data)}
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
        client-certificate-data: ${btoa(keyPair.client_certificate_data)}
        client-key-data: ${btoa(keyPair.client_key_data)}
    `;
}

/**
 * Get all the clusters owned by a given organization.
 * @param orgId
 * @param allClusters
 */
export function clustersForOrg(
  orgId: string,
  // FIXME(axbarsan): Use proper cluster type.
  allClusters: Record<string, Record<string, unknown>>
): Record<string, unknown>[] {
  if (!allClusters) return [];

  return Object.values(allClusters).filter(
    (cluster) => cluster.owner === orgId
  );
}

/**
 * Check if a JWT token is expired or not.
 * @param token
 */
export function isJwtExpired(token: string): boolean {
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
