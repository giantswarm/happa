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
  p:first-child {
    margin: 19px 0 0;
  }
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

/* .availability-zones {
    & > div {
      margin-bottom: 23px;
    }
    & > div > div,
    & > div > div > div {
      margin: 0;
    }
  } */

export default function AddNodePoolsAvailabilityZones({
  max,
  min,
  updateAZValuesInParent,
}) {
  // Input or buttons?
  const [isLabels, setIsLabels] = useState(false);
  const [AZPicker, setAZPicker] = useState({
    value: 1,
    valid: true,
  });
  const [AZLabels, setAZLabels] = useState({
    _number: 0,
    zonesString: '', // TODO (check if) the endpoint will be expecting a string of letters separated by a blank space
    zonesArray: [],
    valid: false,
  });

  // Custom functions.
  const toggle = () => setIsLabels(isLabels => !isLabels);

  const updateAZPicker = payload => {
    setAZPicker({ ...payload });
  };

  const updateAZLabels = (checked, payload) => {
    if (checked) {
      // add data to state
      console.log('checked');
    }
    console.log(checked, payload);
    // remove data from state
    // setAZLabels({ ...payload });
  };

  // Side effects.
  useEffect(() => {
    updateAZValuesInParent(AZPicker);
  }, [AZPicker]);

  useEffect(() => {
    updateAZValuesInParent(AZLabels);
  }, [AZLabels]);

  if (isLabels) {
    return (
      <FlexColumnDiv>
        <p>You can select up to {max} availability zones to make use of.</p>
        <FlexWrapperDiv>
          <AvailabilityZonesLabels
            zones={[
              'europe-west-1a',
              'europe-west-1b',
              'europe-west-1c',
              'europe-west-1d',
            ]}
            onToggleChecked={updateAZLabels}
          />
        </FlexWrapperDiv>
        <p>Please select at least one.</p>
        <p className='emphasized'>
          <span onClick={toggle} alt='Switch to random selection'>
            Switch to random selection
          </span>
        </p>
        {/* {true && <p>Please select at least one.</p>} */}
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
        <p>
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
  value: PropTypes.number,
  updateAZValuesInParent: PropTypes.func,
};
