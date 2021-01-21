import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import toDate from 'date-fns-tz/toDate';

export const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

export const isExpiringSoon = (timestamp) => {
  // eslint-disable-next-line no-magic-numbers
  const expiryTime = 60 * 60 * 24;

  const expirationDate = toDate(timestamp, { timeZone: 'UTC' });
  const expirySeconds = differenceInSeconds(expirationDate)(new Date());

  return expirySeconds > 0 && expirySeconds < expiryTime;
};

export const isExpired = (timestamp) => {
  if (timestamp === NEVER_EXPIRES) {
    return false;
  }

  const expirationDate = toDate(timestamp, { timeZone: 'UTC' });
  const expirySeconds = differenceInSeconds(expirationDate)(new Date());

  return expirySeconds < 0;
};
