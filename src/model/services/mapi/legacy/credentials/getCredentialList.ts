import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as corev1 from 'model/services/mapi/corev1';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';

import {
  credentialsNamespace,
  defaultCredentialName,
  ICredential,
  ICredentialList,
} from './';

export async function getCredentialList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  organizationName: string
): Promise<ICredentialList> {
  const getOptions: corev1.IGetSecretListOptions = {
    namespace: credentialsNamespace,
    labelSelector: {
      matchingLabels: {
        [corev1.labelApp]: 'credentiald',
        [gscorev1alpha1.labelGiantSwarmOrganization]: organizationName,
      },
    },
  };
  const credentialsSecrets = await corev1.getSecretList(
    client,
    auth,
    getOptions
  );

  const credentialList: ICredentialList = {
    items: [],
  };

  for (const secret of credentialsSecrets.items) {
    // We don't want to show the default credential.
    if (secret.metadata.name === defaultCredentialName) continue;

    const newCredential: ICredential = {} as ICredential;

    newCredential.id = secret.metadata.name.split('-')[1] ?? '';
    if (newCredential.id.length === 0 || !secret.data) continue;

    // AWS-specific options.
    newCredential.awsAdminRole = secret.data['aws.admin.arn'];
    newCredential.awsOperatorRole = secret.data['aws.awsoperator.arn'];

    // Azure-specific options.
    newCredential.azureSubscriptionID =
      secret.data['azure.azureoperator.subscriptionid'];
    newCredential.azureTenantID = secret.data['azure.azureoperator.tenantid'];
    newCredential.azureClientID = secret.data['azure.azureoperator.clientid'];

    credentialList.items.push(newCredential);
  }

  return credentialList;
}

export function getCredentialListKey(organizationName: string) {
  const getOptions: corev1.IGetSecretListOptions = {
    namespace: credentialsNamespace,
    labelSelector: {
      matchingLabels: {
        [corev1.labelApp]: 'credentiald',
        [gscorev1alpha1.labelGiantSwarmOrganization]: organizationName,
      },
    },
  };

  return corev1.getSecretListKey(getOptions);
}
