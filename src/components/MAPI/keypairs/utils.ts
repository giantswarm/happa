import add from 'date-fns/fp/add';
import compareAsc from 'date-fns/fp/compareAsc';
import differenceInHours from 'date-fns/fp/differenceInHours';
import toDate from 'date-fns-tz/toDate';
import * as keypairs from 'model/services/mapi/legacy/keypairs';

export function getKeyPairExpirationDate(keyPair: keypairs.IKeyPair) {
  const creationDate = toDate(keyPair.create_date, { timeZone: 'UTC' });
  const expirationDate = add({
    hours: keyPair.ttl,
  })(creationDate);

  return expirationDate;
}

export function isKeyPairActive(keyPair: keypairs.IKeyPair) {
  const expirationDate = getKeyPairExpirationDate(keyPair);
  const now = toDate(new Date(), { timeZone: 'UTC' });

  return compareAsc(expirationDate)(now) < 0;
}

export function isKeyPairExpiringSoon(keyPair: keypairs.IKeyPair) {
  const expirationDate = getKeyPairExpirationDate(keyPair);
  const now = toDate(new Date(), { timeZone: 'UTC' });

  // eslint-disable-next-line no-magic-numbers
  return differenceInHours(now)(expirationDate) < 24;
}
