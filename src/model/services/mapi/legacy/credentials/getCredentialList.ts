import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as corev1 from 'model/services/mapi/corev1';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';

import { credentialsNamespace, ICredential, ICredentialList } from './';
import { decodeCredential, extractIDFromARN } from './key';

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
    const newCredential: ICredential = {} as ICredential;

    newCredential.id = secret.metadata.name.split('-')[1] ?? '';
    if (newCredential.id.length === 0 || !secret.data) continue;

    newCredential.name = secret.metadata.name;

    // AWS-specific options.
    newCredential.awsAdminRole = extractIDFromARN(
      decodeCredential(secret.data['aws.admin.arn'])
    );
    newCredential.awsOperatorRole = extractIDFromARN(
      decodeCredential(secret.data['aws.awsoperator.arn'])
    );

    // Azure-specific options.
    newCredential.azureSubscriptionID = decodeCredential(
      secret.data['azure.azureoperator.subscriptionid']
    );
    newCredential.azureTenantID = decodeCredential(
      secret.data['azure.azureoperator.tenantid']
    );
    newCredential.azureClientID = decodeCredential(
      secret.data['azure.azureoperator.clientid']
    );

    // Delete unset options.
    for (const [key, value] of Object.entries(newCredential)) {
      if (typeof value === 'undefined') {
        delete newCredential[key as keyof ICredential];
      }
    }

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
