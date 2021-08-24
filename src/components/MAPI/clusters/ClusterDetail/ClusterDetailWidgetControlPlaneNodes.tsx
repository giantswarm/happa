import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { ControlPlaneNodeList } from 'MAPI/types';
import {
  fetchMasterListForCluster,
  fetchMasterListForClusterKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
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

const ClusterDetailWidgetControlPlaneNodes: React.FC<IClusterDetailWidgetControlPlaneNodesProps> = ({
  cluster,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const controlPlaneNodeListKey = cluster
    ? fetchMasterListForClusterKey(cluster)
    : null;

  const {
    data: controlPlaneNodeList,
    error: controlPlaneNodeListError,
  } = useSWR<ControlPlaneNodeList, GenericResponseError>(
    controlPlaneNodeListKey,
    () => fetchMasterListForCluster(clientFactory, auth, cluster!)
  );

  useEffect(() => {
    if (controlPlaneNodeListError) {
      ErrorReporter.getInstance().notify(controlPlaneNodeListError);
    }
  }, [controlPlaneNodeListError]);

  const stats = useMemo(() => {
    if (typeof controlPlaneNodeListError !== 'undefined') {
      return {
        totalCount: -1,
        readyCount: -1,
        availabilityZones: [],
      };
    }

    if (!controlPlaneNodeList) {
      return {
        totalCount: undefined,
        readyCount: undefined,
        availabilityZones: undefined,
      };
    }

    return computeControlPlaneNodesStats(controlPlaneNodeList.items);
  }, [controlPlaneNodeList, controlPlaneNodeListError]);

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

ClusterDetailWidgetControlPlaneNodes.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
};

export default ClusterDetailWidgetControlPlaneNodes;
