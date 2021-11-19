interface ILoggedInUserAuthScheme {
  scheme: import('shared/types').PropertiesOf<
    typeof import('shared/constants').AuthorizationTypes
  >;
  token: string;
}

interface ILoggedInUser {
  auth: ILoggedInUserAuthScheme;
  email: string;
  isAdmin: boolean;
  type: import('model/stores/main/types').LoggedInUserTypes;

  /* OIDC specific. */
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
