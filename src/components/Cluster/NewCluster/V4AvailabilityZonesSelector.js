import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import { compare } from 'lib/semver';
import React from 'react';
import styled from 'styled-components';
import InputGroup from 'UI/Inputs/InputGroup';
import NumberPicker from 'UI/Inputs/NumberPicker';

const AZWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  p {
    margin-right: 18px;
  }
`;

const PickerLabel = styled.p`
  font-size: 14px;
  margin-right: 18px;
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
    isAvailable = compare(currentReleaseVersion, requiredReleaseVersion) >= 0;
  }

  return (
    <InputGroup htmlFor='availability-zones' label='Availability zones'>
      {isAvailable ? (
        <AZWrapper>
          <PickerLabel>Number of availability zones to use:</PickerLabel>
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
          <PickerLabel>
            Selection of availability zones is only possible for release version{' '}
            {requiredReleaseVersion} or greater.
          </PickerLabel>
          <NumberPicker readOnly={true} value={1} />
        </>
      )}
    </InputGroup>
  );
};

V4AvailabilityZonesSelector.defaultProps = {
  minValue: 1,
  maxValue: 1,
  // eslint-disable-next-line no-empty-function
  onChange: () => {},
};

export default V4AvailabilityZonesSelector;
