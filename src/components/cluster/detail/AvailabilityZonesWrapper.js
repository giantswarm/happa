import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

/**
 * This component is a wrapper for positioning AZ labels in cluster views, in the node pool row.
 * It will create a grid with the length = number of AZs and it will reserve a column for each
 * one of the AZs.
 */

const Wrapper = styled.div`
  display: grid;
  /* grid-gap: 5px; */
  grid-template-rows: 26px;
  /* grid-template-areas: 'a b c d'; */
  .a {
    grid-area: a;
  }
  .b {
    grid-area: b;
  }
  .c {
    grid-area: c;
  }
  .d {
    grid-area: d;
  }
  .e {
    grid-area: e;
  }
  .f {
    grid-area: f;
  }
  .g {
    grid-area: g;
  }
`;

// It returns a wrapper with grid template areas to position labels properly.
const AvailabilityZonesWrapper = ({
  zones,
  availableZonesGridTemplateAreas: gridTemplateAreas, // Renaming prop here.
}) => {
  const labelWidth = '30px';
  const gridTemplateColumns = gridTemplateAreas
    .split(' ')
    .map(() => labelWidth)
    .join(' ');

  return (
    <Wrapper style={{ gridTemplateAreas, gridTemplateColumns }}>
      <AvailabilityZonesLabels zones={zones} />
    </Wrapper>
  );
};

AvailabilityZonesWrapper.propTypes = {
  availableZonesGridTemplateAreas: PropTypes.string,
  zones: PropTypes.PropTypes.arrayOf(PropTypes.string),
};

export default AvailabilityZonesWrapper;
