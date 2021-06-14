export interface ICredential {
  id: string;

  awsAdminRole?: string;
  awsOperatorRole?: string;

  azureSubscriptionID?: string;
  azureTenantID?: string;
  azureClientID?: string;
}

export interface ICredentialList {
  items: ICredential[];
}
