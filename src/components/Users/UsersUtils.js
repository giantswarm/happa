import moment from 'moment';

export const NEVER_EXPIRES = '0001-01-01T00:00:00Z';
const sToMs = 1000;

export const isExpiringSoon = timestamp => {
  // eslint-disable-next-line no-magic-numbers
  const expiryTime = 60 * 60 * 24;

  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / sToMs;

  return expirySeconds > 0 && expirySeconds < expiryTime;
};

export const isExpired = timestamp => {
  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / sToMs;

  if (timestamp === NEVER_EXPIRES) {
    return false;
  }

  return expirySeconds < 0;
};

export const formatStatus = user => {
  if (user.invited_by) {
    return 'PENDING';
  }

  if (isExpired(user.expiry)) {
    return 'EXPIRED';
  }

  if (isExpiringSoon(user.expiry)) {
    return 'EXPIRING SOON';
  }

  return 'ACTIVE';
};
