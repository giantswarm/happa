export const emptyInvitesResponse = [];

export const invitesResponse = [
  {
    created: '2020-02-25T12:28:19.848933',
    email: 'invited-user@giantswarm.io',
    expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // eslint-disable-line no-magic-numbers
    invited_by: 'inviter@giantswarm.io',
    organizations: ['giantswarm'],
    status: 'pending',
  },
];
