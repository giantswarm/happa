import { Text } from 'grommet';
import { ProviderCluster } from 'MAPI/types';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';

export function getClusterRegionLabel(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1alpha3.AzureCluster:
      return 'Azure region';

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return 'AWS region';

    default:
      return '';
  }
}

export function getClusterAccountIDLabel(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1alpha3.AzureCluster:
      return 'Subscription ID';

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
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

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1alpha3.AzureCluster:
      return 'https://portal.azure.com/';

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
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

const ClusterDetailWidgetProvider: React.FC<IClusterDetailWidgetProviderProps> = ({
  cluster,
  providerCluster,
  ...props
}) => {
  const region = providerCluster?.spec.location;

  const accountID = useMemo(() => {
    if (!providerCluster) return undefined;
    if (!providerCluster?.spec.subscriptionID) return '';

    return providerCluster?.spec.subscriptionID;
  }, [providerCluster]);

  const accountIDPath = getClusterAccountIDPath(cluster, accountID);

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
      <ClusterDetailWidgetOptionalValue
        value={getClusterRegionLabel(cluster)}
        loaderWidth={85}
      >
        {(value) => <Text>{value}</Text>}
      </ClusterDetailWidgetOptionalValue>
      <ClusterDetailWidgetOptionalValue value={region} loaderWidth={80}>
        {(value) => (
          <Text>
            <code>{value}</code>
          </Text>
        )}
      </ClusterDetailWidgetOptionalValue>
      <StyledDot />
      <ClusterDetailWidgetOptionalValue
        value={getClusterAccountIDLabel(cluster)}
      >
        {(value) => <Text>{value}</Text>}
      </ClusterDetailWidgetOptionalValue>
      <ClusterDetailWidgetOptionalValue
        value={accountID}
        loaderWidth={300}
        replaceEmptyValue={true}
      >
        {(value) => (
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
        )}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetProvider.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
  providerCluster: PropTypes.object as PropTypes.Requireable<ProviderCluster>,
};

export default ClusterDetailWidgetProvider;
