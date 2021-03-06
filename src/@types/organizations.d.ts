interface IOrganizationMember {
  email: string;
}

interface IAzureCredential {
  credential: {
    client_id: string;
    subscription_id: string;
    tenant_id: string;
  };
}

interface IAWSCredential {
  roles: {
    admin: string;
    awsoperator: string;
  };
}

interface ICredential {
  id: string;
  provider: import('shared/types').PropertiesOf<
    typeof import('shared/constants').Providers
  >;

  azure?: IAzureCredential;
  aws?: IAWSCredential;
}

interface IOrganization {
  id: string;

  // Injected by client-side.
  members?: IOrganizationMember[] | null;
  credentials?: ICredential[] | null;
}
