import AvailabilityZonesParser from 'cluster/detail/AvailabilityZonesParser';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const MultiAZWrapper = styled.div`
  .danger {
    color: ${props => props.theme.colors.error};
  }
  /* display: flex;
  justify-content: flex-start;
  align-items: center;

  & > div {
    display: flex;
    align-items: center;
  }

  & > div + div {
    margin-left: 18px;
  } */
`;

const AzureMultiAZSelector = ({
  availableZones,
  onChange,
  minValue,
  maxValue,
  defaultValue,
}) => {
  const updateAZ = azPayload => {
    onChange(azPayload.zonesArray);
  };

  return (
    <label htmlFor='availability-zones'>
      <span className='label-span'>Availability Zones</span>
      <MultiAZWrapper>
        <AvailabilityZonesParser
          min={minValue}
          max={maxValue}
          defaultValue={defaultValue}
          zones={availableZones}
          updateAZValuesInParent={updateAZ}
          isLabels={true}
          isRadioButtons={false}
        />

        {availableZones.length < 1 && (
          <p className='danger'>Please select at least one availability zone</p>
        )}
      </MultiAZWrapper>
    </label>
  );
};

AzureMultiAZSelector.defaultProps = {
  onChange: () => {},
  minValue: 1,
  maxValue: 5,
  defaultValue: 1,
  availableZones: [],
};

AzureMultiAZSelector.propTypes = {
  onChange: PropTypes.func,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  defaultValue: PropTypes.number,
  availableZones: PropTypes.arrayOf(PropTypes.string),
};

export default AzureMultiAZSelector;
