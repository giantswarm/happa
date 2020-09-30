import styled from '@emotion/styled';
import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import { compare } from 'lib/semver';
import PropTypes from 'prop-types';
import React from 'react';
import ClusterCreationLabelSpan from 'UI/ClusterCreation/ClusterCreationLabelSpan';
import Section from 'UI/ClusterCreation/Section';
import NumberPicker from 'UI/NumberPicker';

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
    <Section className='availability-zones' htmlFor='availability-zones'>
      <ClusterCreationLabelSpan>Availability Zones</ClusterCreationLabelSpan>
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
    </Section>
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
