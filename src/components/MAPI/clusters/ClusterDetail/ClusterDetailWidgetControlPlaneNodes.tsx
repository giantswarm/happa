import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import {
  Cluster,
  ControlPlane,
  ControlPlaneNode,
  ProviderCluster,
} from 'MAPI/types';
import {
  fetchControlPlaneForCluster,
  fetchControlPlaneForClusterKey,
  fetchControlPlaneNodesForCluster,
  fetchControlPlaneNodesForClusterKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { usePermissionsForControlPlanes } from '../permissions/usePermissionsForControlPlanes';
import { usePermissionsForCPNodes } from '../permissions/usePermissionsForCPNodes';
import ClusterDetailHACPNodesSwitcher from './ClusterDetailHACPNodesSwitcher';
import {
  canSwitchClusterToHACPNodes,
  computeControlPlaneNodesStats,
} from './utils';

function formatNodesCountLabel(readyCount?: number, totalCount?: number) {
  if (typeof readyCount === 'undefined' || typeof totalCount === 'undefined') {
    return undefined;
  }

  if (readyCount < 0 || totalCount <= 0) {
    return '';
  }

  switch (true) {
    case readyCount < totalCount && totalCount !== 1:
      return `${readyCount} of ${totalCount} control plane nodes`;
    case readyCount < totalCount:
      return `${readyCount} of ${totalCount} control plane node`;
    case totalCount === 1:
      return 'Control plane node';
    default:
      return `All ${totalCount} control plane nodes`;
  }
}

function formatAvailabilityZonesLabel(
  provider: PropertiesOf<typeof Providers>,
  availabilityZones: string[] = []
): string {
  const label = provider === Providers.GCP ? 'Zone' : 'Availability zone';

  return availabilityZones.length === 1 ? label : `${label}s`;
}

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterDetailWidgetControlPlaneNodesProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: Cluster;
  providerCluster?: ProviderCluster;
}

const ClusterDetailWidgetControlPlaneNodes: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetControlPlaneNodesProps>
> = ({ cluster, providerCluster, ...props }) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;

  const { canGet: canGetCP } = usePermissionsForControlPlanes(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const controlPlaneKey =
    cluster && canGetCP ? fetchControlPlaneForClusterKey(cluster) : null;

  const {
    data: controlPlane,
    error: controlPlaneError,
    isLoading: controlPlaneIsLoading,
  } = useSWR<ControlPlane, GenericResponseError>(controlPlaneKey, () =>
    fetchControlPlaneForCluster(clientFactory, auth, cluster!)
  );

  useEffect(() => {
    if (controlPlaneError) {
      ErrorReporter.getInstance().notify(controlPlaneError);
    }
  }, [controlPlaneError]);

  const { canList, canUpdate } = usePermissionsForCPNodes(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const controlPlaneNodesKey =
    cluster && canList ? fetchControlPlaneNodesForClusterKey(cluster) : null;

  const {
    data: controlPlaneNodes,
    error: controlPlaneNodesError,
    isLoading: controlPlaneNodesIsLoading,
  } = useSWR<ControlPlaneNode[], GenericResponseError>(
    controlPlaneNodesKey,
    () => fetchControlPlaneNodesForCluster(clientFactory, auth, cluster!)
  );

  const isLoading =
    typeof cluster === 'undefined' ||
    controlPlaneIsLoading ||
    controlPlaneNodesIsLoading;

  useEffect(() => {
    if (controlPlaneNodesError) {
      ErrorReporter.getInstance().notify(controlPlaneNodesError);
    }
  }, [controlPlaneNodesError]);

  const stats = useMemo(() => {
    if (isLoading) {
      return {
        totalCount: undefined,
        readyCount: undefined,
        availabilityZones: undefined,
      };
    }

    if (typeof controlPlaneNodes === 'undefined' || !canList) {
      return {
        totalCount: -1,
        readyCount: -1,
        availabilityZones: [],
      };
    }

    return computeControlPlaneNodesStats(controlPlaneNodes, controlPlane);
  }, [canList, controlPlane, controlPlaneNodes, isLoading]);

  const canSwitchToHA =
    typeof cluster !== 'undefined' &&
    typeof providerCluster !== 'undefined' &&
    typeof controlPlaneNodes !== 'undefined' &&
    canSwitchClusterToHACPNodes(
      provider,
      cluster,
      providerCluster,
      controlPlaneNodes
    );

  const [isSwitchingToHA, setIsSwitchingToHA] = useState(false);

  const onSwitchToHAExit = () => {
    setIsSwitchingToHA(false);
  };

  const handleSetSwitchToHA = () => {
    if (canUpdate) setIsSwitchingToHA(true);
  };

  return (
    <ClusterDetailWidget
      title='Control plane'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
      }}
      {...props}
    >
      <OptionalValue
        value={formatNodesCountLabel(stats.readyCount, stats.totalCount)}
        loaderWidth={200}
        replaceEmptyValue={false}
      >
        {(value) =>
          value ? (
            <Text aria-label={`${value} ready`}>
              {value} <code>Ready</code>
            </Text>
          ) : (
            <Text>
              <NotAvailable /> control plane nodes <code>Ready</code>
            </Text>
          )
        }
      </OptionalValue>
      <StyledDot />
      <Text margin={{ right: 'xsmall' }}>
        {formatAvailabilityZonesLabel(provider, stats.availabilityZones)}
      </Text>
      <OptionalValue
        value={stats.availabilityZones?.sort()}
        loaderWidth={100}
        loaderHeight={26}
      >
        {(value) => (
          <AvailabilityZonesLabels zones={value} labelsChecked={[]} />
        )}
      </OptionalValue>

      {canSwitchToHA && (
        <Box basis='100%' margin={{ top: 'small' }}>
          <ClusterDetailHACPNodesSwitcher
            open={isSwitchingToHA}
            cluster={cluster}
            onSubmit={onSwitchToHAExit}
            onCancel={onSwitchToHAExit}
          />

          {!isSwitchingToHA && (
            <Box
              direction='row'
              align='center'
              gap='small'
              animation={{ type: 'fadeIn', duration: 300 }}
            >
              <Button onClick={handleSetSwitchToHA} unauthorized={!canUpdate}>
                Switch to high availability…
              </Button>
              {!canUpdate && (
                <Text size='small'>
                  For switching to high availability, you need additional
                  permissions. Please talk to your administrator.
                </Text>
              )}
            </Box>
          )}
        </Box>
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetControlPlaneNodes;
