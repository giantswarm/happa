export interface ICredential {
  id: string;
  name: string;

  awsAdminRole?: string;
  awsOperatorRole?: string;

  azureSubscriptionID?: string;
  azureTenantID?: string;
  azureClientID?: string;
}

export interface ICredentialList {
  items: ICredential[];
}
