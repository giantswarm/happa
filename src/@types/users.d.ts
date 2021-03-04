interface ILoggedInUserAuthScheme {
  scheme: import('shared/types').PropertiesOf<
    typeof import('shared/constants').AuthorizationTypes
  >;
  token: string;

  /* OIDC specific. */
  refreshToken?: string;
  expiresAt?: number;
}

interface ILoggedInUser {
  auth: ILoggedInUserAuthScheme;
  email: string;
  isAdmin: boolean;
  type: import('stores/main/utils').LoggedInUserTypes;

  /* OIDC specific. */
  emailVerified?: boolean;
  groups?: string[];

  /* @deprecated */
  authToken?: string;
}

interface IUser {
  created: string;
  email: string;
  expiry: string;
  emaildomain: string;
}

interface IInvitation {
  created: string;
  email: string;
  emaildomain: string;
  expiry: string;
  invited_by: string;
  organizations: string;
  status: string;
}
