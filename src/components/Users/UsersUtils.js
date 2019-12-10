import moment from 'moment';

export const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

export const isExpired = timestamp => {
  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;

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

export const isExpiringSoon = timestamp => {
  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;

  return expirySeconds > 0 && expirySeconds < 60 * 60 * 24;
};
