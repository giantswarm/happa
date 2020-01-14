import { USER_EMAIL } from './constantsAndHelpers';

export const userResponse = {
  email: USER_EMAIL,
  created: '2019-09-19T12:40:16.2231629Z',
  expiry: new Date(Date.now() + 31556952000).toISOString(), // eslint-disable-line no-magic-numbers
};
