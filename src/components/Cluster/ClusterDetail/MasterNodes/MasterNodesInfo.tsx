import styled from '@emotion/styled';
import {
  getAvailabilityZonesSectionLabel,
  getReadinessLabel,
} from 'Cluster/ClusterDetail/MasterNodes/MasterNodesUtils';
import PropTypes from 'prop-types';
import React from 'react';
import AvailabilityZonesLabels from 'UI/AvailabilityZonesLabels';
import Button from 'UI/Button';

const Group = styled.span`
  & + & {
    margin-left: 0.4rem;
  }
`;

const AZGroup = styled(Group)`
  margin-left: 0.4rem;
  flex-shrink: 0;
`;

const ConvertButton = styled(Button)`
  padding-top: 4px;
  padding-bottom: 4px;
  margin-left: 12px;
`;

const AZLabel = styled.span`
  margin-right: 0.8rem;
`;

interface IMasterNodesInfoProps extends React.ComponentPropsWithoutRef<'div'> {
  isHA?: boolean;
  availabilityZones?: string[];
  numOfReadyNodes?: number | null;
  maxNumOfNodes?: number;
  onConvert?: () => void;
}

const MasterNodesInfo: React.FC<IMasterNodesInfoProps> = ({
  isHA,
  availabilityZones,
  maxNumOfNodes,
  numOfReadyNodes,
  onConvert,
  ...rest
}) => {
  const azLabel = getAvailabilityZonesSectionLabel(
    availabilityZones as string[]
  );

  const readinessLabel = getReadinessLabel(
    numOfReadyNodes as number | null,
    maxNumOfNodes as number
  );

  const handleOnConvert = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // eslint-disable-next-line no-unused-expressions
    onConvert?.();
  };

  return (
    <div {...rest}>
      <Group>{readinessLabel}</Group>
      <Group>&#183;</Group>
      <AZGroup>
        <AZLabel>{azLabel}</AZLabel>
        <AvailabilityZonesLabels zones={availabilityZones} labelsChecked={[]} />
      </AZGroup>

      {!isHA && numOfReadyNodes !== null && (
        <Group>
          <ConvertButton onClick={handleOnConvert}>
            Switch to high availability...
          </ConvertButton>
        </Group>
      )}
    </div>
  );
};

MasterNodesInfo.propTypes = {
  isHA: PropTypes.bool,
  availabilityZones: PropTypes.arrayOf(PropTypes.string.isRequired),
  numOfReadyNodes: PropTypes.number,
  maxNumOfNodes: PropTypes.number,
  onConvert: PropTypes.func,
};

MasterNodesInfo.defaultProps = {
  isHA: false,
  availabilityZones: [],
  numOfReadyNodes: null,
  maxNumOfNodes: 0,
};

export default MasterNodesInfo;
