import { Text } from 'grommet';
import { getProviderClusterLocation } from 'MAPI/utils';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import React from 'react';
import styled from 'styled-components';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

import { getAzureCredentialDetails } from './utils';

const ValueWrapper = styled.div`
  display: inline-block;
  line-height: 1.7;
`;

interface IClusterDetailWidgetProviderAzureProps {
  providerCluster: capzv1beta1.IAzureCluster;
  providerCredential?:
    | legacyCredentials.ICredential
    | capzv1beta1.IAzureClusterIdentity;
}

const ClusterDetailWidgetProviderAzure: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderAzureProps>
> = ({ providerCluster, providerCredential }) => {
  const credentialDetails = getAzureCredentialDetails(
    providerCluster,
    providerCredential
  );

  return (
    <>
      <Text>Azure region</Text>
      <ValueWrapper>
        <code>{getProviderClusterLocation(providerCluster)}</code>
      </ValueWrapper>

      <Text>Subscription ID</Text>
      <OptionalValue value={credentialDetails.subscriptionID} loaderWidth={250}>
        {(value) => <code>{value}</code>}
      </OptionalValue>

      <Text>Tenant ID</Text>
      <OptionalValue value={credentialDetails.tenantID} loaderWidth={250}>
        {(value) => <code>{value}</code>}
      </OptionalValue>
    </>
  );
};

export default ClusterDetailWidgetProviderAzure;
