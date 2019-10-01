import { css } from '@emotion/core';
import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import NumberPicker from 'UI/number_picker';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

export const Emphasized = css`
  .emphasized {
    font-size: 16px;
    span {
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .no-margin {
    margin-left: 18px;
  }
`;

const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  ${Emphasized};
`;

const FlexColumnDiv = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  p {
    font-size: 14px;
    margin: 0 0 14px 0;
    &:nth-of-type(2) {
      margin: 12px 0 25px;
    }
  }
  div {
    margin-bottom: 20px;
  }
  ${Emphasized};
`;

const initialStatePicker = {
  value: 1,
  valid: true,
};

const initialStateLabels = {
  number: 0,
  zonesString: '',
  zonesArray: [],
  valid: false,
};

/**
 * This component takes values from AvailabilityZonesLabel via AvailabilityZonesLabel
 * and acts as a buffer so to speak. This is, it takes data from individual labels and
 * aggregates this data to a state object to be passed to the AddNodePool component.
 *
 */

export default function AddNodePoolsAvailabilityZones({
  max,
  min,
  updateAZValuesInParent,
  updateIsLabelsInParent,
  zones,
}) {
  // Input or buttons?
  const [isLabels, setIsLabels] = useState(false);
  useEffect(() => {
    updateIsLabelsInParent(isLabels);
  }, [isLabels]);

  // Picker.
  const [AZPicker, setAZPicker] = useState(initialStatePicker);
  useEffect(() => {
    if (isLabels) return;

    // Reset Labels
    // TODO We could save state instead.
    setAZLabels(initialStateLabels);
    updateAZValuesInParent(AZPicker);
  }, [AZPicker]);

  // Labels.
  const [AZLabels, setAZLabels] = useState();
  useEffect(() => {
    if (!isLabels) return;

    // Reset picker
    setAZPicker(initialStatePicker);
    updateAZValuesInParent(AZLabels);
  }, [AZLabels]);

  // Custom functions.
  const toggle = () => setIsLabels(isLabels => !isLabels);

  // Function passed to child Number Picker component to allow it to update state here
  const updateAZPicker = payload => {
    setAZPicker(payload);
  };

  // Function passed to child AZLabels component to allow it to update state here
  const updateAZLabels = (checked, payload) => {
    // If checked, we will add the new AZ to state, else we will remove it.
    const zonesArray = checked
      ? [...AZLabels.zonesArray, payload.title]
      : AZLabels.zonesArray.filter(az => az !== payload.title);

    setAZLabels({
      number: zonesArray.length,
      zonesString: zonesArray.map(zone => zone.slice(-1)).join(' '),
      zonesArray,
      valid: zonesArray.length > 0 ? true : false,
    });
  };

  if (isLabels) {
    return (
      <FlexColumnDiv>
        <p>You can select up to {max} availability zones to make use of.</p>
        <FlexWrapperDiv>
          <AvailabilityZonesLabels
            zones={zones}
            onToggleChecked={updateAZLabels}
          />
        </FlexWrapperDiv>
        {AZLabels.zonesArray.length < 1 && <p>Please select at least one.</p>}
        <p className='emphasized'>
          <span onClick={toggle} alt='Switch to random selection'>
            Switch to random selection
          </span>
        </p>
      </FlexColumnDiv>
    );
  }

  return (
    <>
      <FlexWrapperDiv>
        <NumberPicker
          label=''
          max={max}
          min={min}
          onChange={updateAZPicker}
          readOnly={false}
          stepSize={1}
          value={AZPicker.value}
        />
        <p className='emphasized no-margin'>
          or{' '}
          <span onClick={toggle} alt='Select distinct availability zones'>
            Select distinct availability zones
          </span>
        </p>
      </FlexWrapperDiv>
      <FlexWrapperDiv>
        <p style={{ margin: '19px 0 0' }}>
          {AZPicker.value < 2
            ? `Covering one availability zone, the worker nodes of this node pool
               will be placed in the same availability zones as the
               cluster's master node.`
            : `Availability zones will be selected randomly.`}
        </p>
      </FlexWrapperDiv>
    </>
  );
}

AddNodePoolsAvailabilityZones.propTypes = {
  max: PropTypes.number,
  min: PropTypes.number,
  zones: PropTypes.array,
  value: PropTypes.number,
  updateAZValuesInParent: PropTypes.func,
  updateIsLabelsInParent: PropTypes.func,
};
