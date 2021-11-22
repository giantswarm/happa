import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import { ProviderCluster } from 'MAPI/types';
import {
  extractErrorMessage,
  getProviderClusterAccountID,
  getProviderClusterLocation,
} from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR from 'swr';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { usePermissionsForOrgCredentials } from '../permissions/usePermissionsForOrgCredentials';
import { getCredentialsAccountID } from './utils';

export function getClusterRegionLabel(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return 'Azure region';

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return 'AWS region';

    default:
      return '';
  }
}

export function getClusterAccountIDLabel(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return 'Subscription ID';

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return 'Account ID';

    default:
      return '';
  }
}

export function getClusterAccountIDPath(
  cluster?: capiv1alpha3.ICluster,
  accountID?: string
) {
  if (!cluster || !accountID) return undefined;

  switch (cluster.spec?.infrastructureRef?.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return 'https://portal.azure.com/';

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return `https://${accountID}.signin.aws.amazon.com/console`;

    default:
      return '';
  }
}

const StyledDot = styled(Dot)`
  padding: 0;
`;

const StyledLink = styled.a`
  color: ${({ theme }) => theme.global.colors['text-weak'].dark};
`;

interface IClusterDetailWidgetProviderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
  providerCluster?: ProviderCluster;
}

const ClusterDetailWidgetProvider: React.FC<IClusterDetailWidgetProviderProps> =
  ({ cluster, providerCluster, ...props }) => {
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
      canList && selectedOrgID
        ? legacyCredentials.getCredentialListKey(selectedOrgID)
        : null;

    const { data: credentialList, error: credentialListError } = useSWR(
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

    const credentialAccountID = getCredentialsAccountID(credentialList?.items);
    const accountID = credentialListKey
      ? credentialAccountID
      : getProviderClusterAccountID(providerCluster);
    const accountIDPath = getClusterAccountIDPath(cluster, accountID);

    const region = getProviderClusterLocation(providerCluster);

    return (
      <ClusterDetailWidget
        title='Provider'
        inline={true}
        contentProps={{
          direction: 'row',
          gap: 'xsmall',
          wrap: true,
          align: 'center',
        }}
        {...props}
      >
        <OptionalValue value={getClusterRegionLabel(cluster)} loaderWidth={85}>
          {(value) => <Text>{value}</Text>}
        </OptionalValue>
        <OptionalValue value={region} loaderWidth={80}>
          {(value) => (
            <Text>
              <code>{value}</code>
            </Text>
          )}
        </OptionalValue>
        <StyledDot />
        <OptionalValue value={getClusterAccountIDLabel(cluster)}>
          {(value) => <Text>{value}</Text>}
        </OptionalValue>
        <OptionalValue
          value={accountID}
          loaderWidth={300}
          replaceEmptyValue={false}
        >
          {(value) =>
            value === '' ? (
              <NotAvailable />
            ) : (
              <StyledLink
                color='text-weak'
                href={accountIDPath}
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
      </ClusterDetailWidget>
    );
  };

export default ClusterDetailWidgetProvider;
