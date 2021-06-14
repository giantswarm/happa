import { Text } from 'grommet';
import PropTypes, { string } from 'prop-types';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';
import NotAvailable from 'UI/Display/NotAvailable';

import { IControlPlaneNodeItem } from '../types';
import ClusterDetailWidget from './ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from './ClusterDetailWidgetOptionalValue';
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
  nodes?: IControlPlaneNodeItem[];
  errorMessage?: string;
}

const ClusterDetailWidgetControlPlaneNodes: React.FC<IClusterDetailWidgetControlPlaneNodesProps> = ({
  nodes,
  errorMessage,
  ...props
}) => {
  const hasError = Boolean(errorMessage);

  const stats = useMemo(() => {
    if (hasError) {
      return {
        totalCount: -1,
        readyCount: -1,
        availabilityZones: [],
      };
    }

    if (!nodes) {
      return {
        totalCount: undefined,
        readyCount: undefined,
        availabilityZones: undefined,
      };
    }

    return computeControlPlaneNodesStats(nodes);
  }, [nodes, hasError]);

  return (
    <ClusterDetailWidget
      title='Control plane nodes'
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
        value={formatNodesCountLabel(stats.readyCount, stats.totalCount)}
        loaderWidth={200}
        replaceEmptyValue={false}
      >
        {(value) =>
          value ? (
            <Text>
              {value} <code>Ready</code>
            </Text>
          ) : (
            <Text>
              <NotAvailable /> control plane nodes <code>Ready</code>
            </Text>
          )
        }
      </ClusterDetailWidgetOptionalValue>
      <StyledDot />
      <Text margin={{ right: 'xsmall' }}>
        {formatAvailabilityZonesLabel(stats.availabilityZones)}
      </Text>
      <ClusterDetailWidgetOptionalValue
        value={stats.availabilityZones}
        loaderWidth={100}
        loaderHeight={26}
      >
        {(value) => (
          <AvailabilityZonesLabels zones={value} labelsChecked={[]} />
        )}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetControlPlaneNodes.propTypes = {
  nodes: PropTypes.array,
  errorMessage: string,
};

export default ClusterDetailWidgetControlPlaneNodes;
