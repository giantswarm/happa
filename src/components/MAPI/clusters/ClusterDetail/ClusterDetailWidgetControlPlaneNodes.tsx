import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { ControlPlaneNode } from 'MAPI/types';
import {
  fetchControlPlaneNodesForCluster,
  fetchControlPlaneNodesForClusterKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR from 'swr';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

import { computeControlPlaneNodesStats } from './utils';

function formatNodesCountLabel(readyCount?: number, totalCount?: number) {
  if (typeof readyCount === 'undefined' || typeof totalCount === 'undefined') {
    return undefined;
  }

  if (readyCount < 0 || totalCount < 0) {
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
  availabilityZones: string[] = []
): string {
  if (availabilityZones.length === 1) {
    return 'Availability zone';
  }

  return 'Availability zones';
}

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterDetailWidgetControlPlaneNodesProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterDetailWidgetControlPlaneNodes: React.FC<IClusterDetailWidgetControlPlaneNodesProps> =
  ({ cluster, ...props }) => {
    const clientFactory = useHttpClientFactory();
    const auth = useAuthProvider();

    const controlPlaneNodesKey = cluster
      ? fetchControlPlaneNodesForClusterKey(cluster)
      : null;

    const {
      data: controlPlaneNodes,
      error: controlPlaneNodesError,
      isValidating: controlPlaneNodesIsValidating,
    } = useSWR<ControlPlaneNode[], GenericResponseError>(
      controlPlaneNodesKey,
      () => fetchControlPlaneNodesForCluster(clientFactory, auth, cluster!)
    );

    const isLoading =
      typeof cluster === 'undefined' ||
      (typeof controlPlaneNodes === 'undefined' &&
        typeof controlPlaneNodesError === 'undefined' &&
        controlPlaneNodesIsValidating);

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

      if (typeof controlPlaneNodes === 'undefined') {
        return {
          totalCount: -1,
          readyCount: -1,
          availabilityZones: [],
        };
      }

      return computeControlPlaneNodesStats(controlPlaneNodes);
    }, [controlPlaneNodes, isLoading]);

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
          {formatAvailabilityZonesLabel(stats.availabilityZones)}
        </Text>
        <OptionalValue
          value={stats.availabilityZones}
          loaderWidth={100}
          loaderHeight={26}
        >
          {(value) => (
            <AvailabilityZonesLabels zones={value} labelsChecked={[]} />
          )}
        </OptionalValue>
      </ClusterDetailWidget>
    );
  };

export default ClusterDetailWidgetControlPlaneNodes;
