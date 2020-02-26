import { ORGANIZATION, USER_EMAIL } from './constantsAndHelpers';

export const orgsResponse = [{ id: ORGANIZATION }];

export const orgResponse = {
  id: ORGANIZATION,
  members: [{ email: USER_EMAIL }],
  credentials: [],
};

export const orgsWithGSResponse = [...orgsResponse, { id: 'giantswarm' }];

export const gsOrgResponse = {
  id: 'giantswarm',
  members: [{ email: USER_EMAIL }],
  credentials: [],
};
