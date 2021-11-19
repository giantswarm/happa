import MasterNodes from 'Cluster/NewCluster/MasterNodes';
import { Constants } from 'model/constants';
import React, { useMemo } from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import { computeControlPlaneNodesStats } from '../ClusterDetail/utils';
import {
  IClusterPropertyProps,
  withClusterControlPlaneNodesCount,
} from './patches';

interface ICreateClusterControlPlaneNodesCountProps
  extends IClusterPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof InputGroup>,
      'onChange' | 'id'
    > {}

const CreateClusterControlPlaneNodesCount: React.FC<ICreateClusterControlPlaneNodesCountProps> =
  ({ controlPlaneNodes, onChange, ...props }) => {
    const handleChange = (isHA: boolean) => {
      let count = 1;
      if (isHA) {
        count = Constants.AWS_HA_MASTERS_MAX_NODES;
      }

      onChange({
        isValid: true,
        patch: withClusterControlPlaneNodesCount(count),
      });
    };

    const value = useMemo(() => {
      const nodesCount =
        computeControlPlaneNodesStats(controlPlaneNodes).totalCount;

      if (nodesCount > 1) {
        return true;
      }

      return false;
    }, [controlPlaneNodes]);

    return (
      <MasterNodes
        onChange={handleChange}
        isHighAvailability={value}
        margin='none'
        {...props}
      />
    );
  };

export default CreateClusterControlPlaneNodesCount;
