import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  display: grid;
  /* grid-gap: 5px; */
  grid-template-columns: 30px 30px 30px 30px;
  grid-template-rows: 26px;
  grid-template-areas: 'a b c d';
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

// Returns an array of AvailabilityZonesLabel components
const AvailabilityZonesWrapper = ({ zones, gridTemplateAreas }) => {
  const widthLabel = '30px;';
  const gridTemplateColumns = gridTemplateAreas.map(() => widthLabel).join(' ');

  return (
    <Wrapper style={{ gridTemplateAreas, gridTemplateColumns }}>
      {zones.map(az => {
        // we use the letter that is the last character as the label
        const letter = az.slice(-1);
        const label = letter.toUpperCase();

        return (
          <AvailabilityZonesLabels
            key={az}
            label={label}
            letter={letter}
            title={az}
          />
        );
      })}
    </Wrapper>
  );
};

AvailabilityZonesWrapper.propTypes = {
  gridTemplateAreas: PropTypes.string,
  zones: PropTypes.PropTypes.arrayOf(PropTypes.string),
};

export default AvailabilityZonesWrapper;
