import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import PropTypes from 'prop-types';
import React from 'react';
import cmp from 'semver-compare';
import styled from 'styles';
import NumberPicker from 'UI/NumberPicker';

const AZWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  p {
    margin-right: 18px;
    transform: translateY(-4px);
  }
`;

const V4AvailabilityZonesSelector = ({
  minValue,
  maxValue,
  onChange,
  requiredReleaseVersion,
  currentReleaseVersion,
}) => {
  let isAvailable = true;

  if (requiredReleaseVersion && currentReleaseVersion) {
    isAvailable = cmp(currentReleaseVersion, requiredReleaseVersion) >= 0;
  }

  return (
    <label className='availability-zones' htmlFor='availability-zones'>
      <span className='label-span'>Availability Zones</span>
      {isAvailable ? (
        <AZWrapper>
          <p>Number of availability zones to use:</p>
          <div>
            <AvailabilityZonesParser
              max={maxValue}
              min={minValue}
              defaultValue={minValue}
              updateAZValuesInParent={onChange}
            />
          </div>
        </AZWrapper>
      ) : (
        <>
          <p>
            Selection of availability zones is only possible for release version{' '}
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

V4AvailabilityZonesSelector.defaultProps = {
  minValue: 1,
  maxValue: 1,
  // eslint-disable-next-line no-empty-function
  onChange: () => {},
};

V4AvailabilityZonesSelector.propTypes = {
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  requiredReleaseVersion: PropTypes.string,
  currentReleaseVersion: PropTypes.string,
};

export default V4AvailabilityZonesSelector;
