import add from 'date-fns/fp/add';
import compareAsc from 'date-fns/fp/compareAsc';
import toDate from 'date-fns-tz/toDate';
import * as keypairs from 'model/services/mapi/legacy/keypairs';

export function isKeyPairActive(keyPair: keypairs.IKeyPair) {
  const creationDate = toDate(keyPair.create_date, { timeZone: 'UTC' });
  const expirationDate = add({
    hours: keyPair.ttl,
  })(creationDate);

  const now = toDate(new Date(), { timeZone: 'UTC' });

  return compareAsc(expirationDate)(now) < 0;
}
