import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import cmp from 'semver-compare';
import NumberPicker from 'UI/NumberPicker';

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
  readOnly,
  onChange,
  requiredReleaseVersion,
  currentReleaseVersion,
}) => {
  const isAvailable = cmp(currentReleaseVersion, requiredReleaseVersion) >= 0;

  return (
    <label className='availability-zones' htmlFor='availability-zones'>
      <span className='label-span'>Availability Zones</span>
      {isAvailable ? (
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
            {requiredReleaseVersion} or greater.
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
  requiredReleaseVersion: '0.0.1',
  currentReleaseVersion: '0.0.2',
};

AvailabilityZonesSelector.propTypes = {
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.number,
  requiredReleaseVersion: PropTypes.string,
  currentReleaseVersion: PropTypes.string,
};

export default AvailabilityZonesSelector;
