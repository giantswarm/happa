import React from 'react';
import styled from 'styled-components';
import AvailabilityZonesLabels from 'UI/Display/Cluster/AvailabilityZones/AvailabilityZonesLabels';

/**
 * This component is a wrapper for positioning AZ labels in cluster views, in the node pool row.
 * It will create a grid with the length = number of AZs and it will reserve a column for each
 * one of the AZs.
 */

const Wrapper = styled.div`
  display: flex;
`;

// It returns a wrapper with grid template areas to position labels properly.
const AvailabilityZonesWrapper = ({ zones }) => {
  return (
    <Wrapper>
      <AvailabilityZonesLabels zones={zones} />
    </Wrapper>
  );
};

export default AvailabilityZonesWrapper;
