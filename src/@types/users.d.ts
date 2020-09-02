interface IUserAuthScheme {
  scheme: import('shared/types').PropertiesOf<
    typeof import('shared/constants').AuthorizationTypes
  >;
  token: string;
}

interface IUser {
  auth: IUserAuthScheme;
  email: string;
  isAdmin: boolean;
  /* @deprecated */
  authToken?: string;
}
