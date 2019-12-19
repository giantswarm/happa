import NumberPicker from 'UI/NumberPicker';
import PropTypes from 'prop-types';
import React from 'react';
import cmp from 'semver-compare';
import styled from '@emotion/styled';

const FlexWrapperAZDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  p {
    margin-right: 18px;
    transform: translateY(-4px);
  }
`;

const AvailabilityZonesSelector = ({
  minValue,
  maxValue,
  value,
  available,
  readOnly,
  onChange,
}) => {
  return (
    <label className='availability-zones' htmlFor='availability-zones'>
      <span className='label-span'>Availability Zones</span>
      {available ? (
        <FlexWrapperAZDiv>
          <p>Number of availability zones to use:</p>
          <div>
            <NumberPicker
              label=''
              max={maxValue}
              min={minValue}
              onChange={onChange}
              readOnly={readOnly}
              stepSize={1}
              value={value}
            />
          </div>
        </FlexWrapperAZDiv>
      ) : (
        <>
          <p>
            Selection of availability zones is only possible for release version
            6.1.0 or greater.
          </p>
          <div className='col-3'>
            <NumberPicker readOnly={true} value={1} />
          </div>
        </>
      )}
    </label>
  );
};

AvailabilityZonesSelector.defaultProps = {
  minValue: 1,
  maxValue: 1,
  // eslint-disable-next-line no-empty-function
  onChange: () => {},
  readOnly: false,
  value: 1,
  available: false,
};

AvailabilityZonesSelector.propTypes = {
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.number,
  available: PropTypes.bool,
};

export default AvailabilityZonesSelector;
