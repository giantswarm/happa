import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Grid, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  getProviderClusterAccountID,
  getProviderClusterLocation,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import styled from 'styled-components';
import useSWR from 'swr';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { usePermissionsForOrgCredentials } from '../permissions/usePermissionsForOrgCredentials';
import { getCredentialsAccountID, getCredentialsAzureTenantID } from './utils';

const StyledLink = styled.a`
  color: ${({ theme }) => normalizeColor('text-weak', theme)};
`;

function getProviderInfo(
  cluster?: capiv1beta1.ICluster,
  providerCluster?: ProviderCluster,
  credentials?: legacyCredentials.ICredential[],
  credentialListIsLoading?: boolean
): {
  label?: string;
  value?: string;
  link?: string;
  loaderWidth?: number;
}[] {
  const infrastructureRef = cluster?.spec?.infrastructureRef;

  switch (infrastructureRef?.kind) {
    case capgv1beta1.GCPCluster: {
      const projectID = getProviderClusterAccountID(providerCluster);

      return [
        {
          label: 'GCP region',
          value: getProviderClusterLocation(providerCluster),
        },
        {
          label: 'Project ID',
          value: projectID,
          link: `https://console.cloud.google.com/home/dashboard?project=${projectID}`,
          loaderWidth: 200,
        },
      ];
    }

    case capzv1beta1.AzureCluster: {
      const subscriptionID = credentialListIsLoading
        ? undefined
        : credentials
        ? getCredentialsAccountID(credentials)
        : getProviderClusterAccountID(providerCluster);

      const tenantID = credentials
        ? getCredentialsAzureTenantID(credentials)
        : providerCluster
        ? ''
        : undefined;

      return [
        {
          label: 'Azure region',
          value: getProviderClusterLocation(providerCluster),
        },
        {
          label: 'Subscription ID',
          value: subscriptionID,
          loaderWidth: 250,
        },
        {
          label: 'Tenant ID',
          value: tenantID,
          loaderWidth: 250,
        },
      ];
    }

    case infrav1alpha3.AWSCluster: {
      const accountID = credentialListIsLoading
        ? undefined
        : credentials
        ? getCredentialsAccountID(credentials)
        : getProviderClusterAccountID(providerCluster);

      return [
        {
          label: 'AWS region',
          value: getProviderClusterLocation(providerCluster),
        },
        {
          label: 'Account ID',
          value: accountID,
          link: `https://${accountID}.signin.aws.amazon.com/console`,
        },
      ];
    }

    default: {
      const provider = window.config.info.general.provider;
      const itemsCount = provider === Providers.AZURE ? 3 : 2;

      return Array.from(Array(itemsCount)).map(() => ({}));
    }
  }
}

interface IClusterDetailWidgetProviderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
  providerCluster?: ProviderCluster;
}

const ClusterDetailWidgetProvider: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderProps>
> = ({ cluster, providerCluster, ...props }) => {
  const { orgId } = useParams<{ clusterId: string; orgId: string }>();
  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const selectedOrgID = selectedOrg?.name ?? selectedOrg?.id;

  const credentialListClient = useHttpClient();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;

  const { canList } = usePermissionsForOrgCredentials(
    provider,
    selectedOrg?.namespace ?? ''
  );

  const credentialListKey =
    cluster && canList && selectedOrgID
      ? legacyCredentials.getCredentialListKey(selectedOrgID)
      : undefined;

  const {
    data: credentialList,
    isValidating: credentialListIsValidating,
    error: credentialListError,
  } = useSWR<legacyCredentials.ICredentialList, GenericResponseError>(
    credentialListKey,
    () =>
      legacyCredentials.getCredentialList(
        credentialListClient,
        auth,
        selectedOrgID!
      )
  );

  useEffect(() => {
    if (credentialListError) {
      new FlashMessage(
        `Could not fetch provider-specific credentials for organization ${orgId}`,
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(credentialListError)
      );

      ErrorReporter.getInstance().notify(credentialListError);
    }
  }, [credentialListError, orgId]);

  const credentialListIsLoading =
    typeof credentialList === 'undefined' && credentialListIsValidating;

  const providerInfoItems = getProviderInfo(
    cluster,
    providerCluster,
    credentialListIsLoading ? undefined : credentialList?.items,
    credentialListIsLoading
  );

  return (
    <ClusterDetailWidget title='Provider' inline={true} {...props}>
      <Grid
        columns={['auto', 'flex']}
        gap={{ column: 'small' }}
        data-testid='provider-info'
      >
        {providerInfoItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <OptionalValue value={item.label}>
              {(value) => <Text>{value}</Text>}
            </OptionalValue>
            <OptionalValue value={item.value} loaderWidth={item.loaderWidth}>
              {(value) =>
                typeof item.link === 'undefined' ? (
                  <code>{value}</code>
                ) : (
                  <StyledLink
                    href={item.link}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    <code>{value}</code>
                    <i
                      className='fa fa-open-in-new'
                      aria-hidden={true}
                      role='presentation'
                    />
                  </StyledLink>
                )
              }
            </OptionalValue>
          </React.Fragment>
        ))}
      </Grid>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetProvider;
