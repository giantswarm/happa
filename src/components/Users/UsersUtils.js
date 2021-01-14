import parseISO from 'date-fns/fp/parseISO';

export const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

export const isExpiringSoon = (timestamp) => {
  // eslint-disable-next-line no-magic-numbers
  const expiryTime = 60 * 60 * 24;

  const now = new Date().getUTCSeconds();
  const expirationDate = parseISO(timestamp).getUTCSeconds();
  const expirySeconds = expirationDate - now;

  return expirySeconds > 0 && expirySeconds < expiryTime;
};

export const isExpired = (timestamp) => {
  if (timestamp === NEVER_EXPIRES) {
    return false;
  }

  const now = new Date().getUTCSeconds();
  const expirationDate = parseISO(timestamp).getUTCSeconds();
  const expirySeconds = expirationDate - now;

  return expirySeconds < 0;
};
