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
  /* @deprecated */
  authToken?: string;
}

interface IUser {
  created: string;
  email: string;
  expiry: string;
  emaildomain: string;
}
