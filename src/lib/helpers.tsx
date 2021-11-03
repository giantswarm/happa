import compareAsc from 'date-fns/fp/compareAsc';
import format from 'date-fns/fp/format';
import formatDistance from 'date-fns/fp/formatDistance';
import parseISO from 'date-fns/fp/parseISO';
import toDate from 'date-fns-tz/toDate';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import React, { ReactElement } from 'react';
import { IKeyPair } from 'shared/types';
import { getOrganizationByID } from 'stores/organization/utils';
import NotAvailable from 'UI/Display/NotAvailable';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
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
  let maxIndent: number | null = null;
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

    if (!maxIndent) {
      maxIndent = indent;
    } else {
      maxIndent = Math.max(maxIndent, indent);
    }
  }

  if (minIndent !== null && minIndent === maxIndent) {
    result = lines.join('\n');
  } else if (minIndent !== null) {
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

export interface IHumanFileSizeValue<T extends boolean> {
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
  constraints: Partial<Record<keyof T, Record<string, unknown>>>
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
 * @param date
 */
export function formatDate(date: string | number | Date): string {
  const givenDate = date instanceof Date ? date : parseISO(date);
  const parsedDate = utcToZonedTime(givenDate, 'UTC');

  return `${format('d MMM yyyy, HH:mm')(parsedDate)} UTC`;
}

/**
 * Get a formatted date structure, relative to now (e.g. 2 days ago, or 1 year ago).
 * @param date
 */
export function getRelativeDateFromNow(date: string | number | Date): string {
  const givenDate = date instanceof Date ? date : parseISO(date);
  const now = new Date();
  let distance = formatDistance(now)(givenDate);

  if (compareAsc(now)(givenDate) < 0) {
    distance += ' ago';
  } else {
    distance = `in ${distance}`;
  }

  return distance;
}

export function compareDates(
  dateA: Date | string | number,
  dateB: Date | string | number
): -1 | 0 | 1 {
  const a = toDate(dateA, { timeZone: 'UTC' });
  const b = toDate(dateB, { timeZone: 'UTC' });

  return compareAsc(b)(a) as -1 | 0 | 1;
}

/**
 * Get a component containing a formatted given date, relative
 * from now (e.g. 2 days ago).
 * @param date
 */
// TODO(axbarsan): Refactor a part of this into a UI component.
export function relativeDate(date?: string | number | Date): ReactElement {
  if (!date) {
    return <NotAvailable />;
  }

  const formattedDate = formatDate(date);
  const relDate = getRelativeDateFromNow(date);

  return (
    <TooltipContainer content={<Tooltip>{formattedDate}</Tooltip>}>
      <span>{relDate}</span>
    </TooltipContainer>
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
export function makeKubeConfigTextFile(
  cluster: Cluster,
  keyPair: IKeyPair,
  useInternalAPI: boolean
): string {
  let apiEndpoint: string = cluster.api_endpoint;

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
 * @param organizations
 * @param allClusters
 */
export function clustersForOrg(
  orgId: string,
  organizations: IOrganization[],
  allClusters?: IClusterMap
): Cluster[] {
  if (!allClusters) return [];

  const organization = getOrganizationByID(orgId, organizations);
  if (!organization) return [];

  const organizationID = organization.name ?? organization?.id;

  return Object.values(allClusters).filter(
    (cluster) => cluster.owner === organizationID
  );
}

/**
 * Check if a JWT token is expired or not.
 * @param token
 */
export function isJwtExpired(token: string): boolean {
  const msToS = 1000;
  const tokenParts = token.split('.');
  if (tokenParts.length < 2) return true;

  const base64Url = tokenParts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const parsedToken = JSON.parse(window.atob(base64));

  const now = Math.round(Date.now() / msToS); // Browsers have millisecond precision, which we don't need.
  const expire = parsedToken.exp ?? 0;

  return now > expire;
}

/**
 * Validate if a string is within a given interval of
 * number of letters.
 * @param str - The string to check.
 * @param min - The minimum permitted length.
 * @param max - The maximum permitted length.
 * @param strLabel - The label for the string. If provided, this customizes the returned validation message.
 */
export function hasAppropriateLength(
  str: string,
  min: number,
  max: number,
  strLabel: string = 'Name'
): {
  isValid: boolean;
  message: string;
} {
  let isValid = false;
  let message = '';
  const trimmedStr = str.trim();
  if (trimmedStr.length < min) {
    if (trimmedStr.length > 0) {
      message = `${strLabel} must not contain less than ${min} characters`;
    } else {
      message = `${strLabel} must not be empty`;
    }
  } else if (str.length > max) {
    message = `${strLabel} must not contain more than ${max} characters`;
  } else {
    isValid = true;
  }

  return { isValid, message };
}
