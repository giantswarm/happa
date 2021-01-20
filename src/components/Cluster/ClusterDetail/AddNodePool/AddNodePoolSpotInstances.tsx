import PropTypes from 'prop-types';
import * as React from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';
import ClusterCreationLabelSpan from 'UI/ClusterCreation/ClusterCreationLabelSpan';
import NumberPicker from 'UI/NumberPicker';

const SpotValuesLabelText = styled.span`
  font-weight: 300;
  font-size: 16px;
  line-height: 32px;
  display: inline-block;
  width: 210px;
`;

const SpotValuesNumberPickerWrapper = styled.div`
  margin-bottom: 8px;

  .spot-number-picker {
    margin-right: 8px;
  }
`;

const SpotValuesHelpText = styled.p`
  padding-bottom: 20px;
  padding-left: 28px;
  font-size: 14px;
  i {
    white-space: nowrap;
  }
`;

type SpecChangeHandler<T> = (patch: { value: T; valid: boolean }) => void;

interface IAddNodePoolSpotInstancesProps {
  provider: PropertiesOf<typeof Providers>;
  spotPercentage: number;
  setSpotPercentage: SpecChangeHandler<number>;
  onDemandBaseCapacity: number;
  setOnDemandBaseCapacity: SpecChangeHandler<number>;
}

const AddNodePoolSpotInstances: React.FC<IAddNodePoolSpotInstancesProps> = ({
  provider,
  spotPercentage,
  setSpotPercentage,
  onDemandBaseCapacity,
  setOnDemandBaseCapacity,
}) => {
  return (
    <>
      <ClusterCreationLabelSpan>Spot instances</ClusterCreationLabelSpan>

      {provider === Providers.AWS && (
        <>
          <SpotValuesNumberPickerWrapper>
            <SpotValuesLabelText>Spot instance percentage</SpotValuesLabelText>
            <NumberPicker
              readOnly={false}
              max={100}
              min={0}
              stepSize={10}
              value={spotPercentage}
              onChange={setSpotPercentage}
              theme='spot-number-picker'
              eventNameSuffix='SPOT_PERCENTAGE'
            />
            <SpotValuesLabelText>percent</SpotValuesLabelText>
          </SpotValuesNumberPickerWrapper>
          <SpotValuesHelpText>
            Controls the percentage of spot instances to be used for worker
            nodes beyond the number of <i>on demand base capacity</i>.
          </SpotValuesHelpText>
          <SpotValuesNumberPickerWrapper>
            <SpotValuesLabelText>On demand base capacity</SpotValuesLabelText>
            <NumberPicker
              readOnly={false}
              min={0}
              max={32767}
              stepSize={1}
              value={onDemandBaseCapacity}
              onChange={setOnDemandBaseCapacity}
              theme='spot-number-picker'
              eventNameSuffix='ONDEMAND_BASE_CAPACITY'
            />
            <SpotValuesLabelText>instances</SpotValuesLabelText>
          </SpotValuesNumberPickerWrapper>
          <SpotValuesHelpText>
            Controls how much of the initial capacity is made up of on-demand
            instances.
          </SpotValuesHelpText>
        </>
      )}
    </>
  );
};

AddNodePoolSpotInstances.propTypes = {
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
  spotPercentage: PropTypes.number.isRequired,
  setSpotPercentage: PropTypes.func.isRequired,
  onDemandBaseCapacity: PropTypes.number.isRequired,
  setOnDemandBaseCapacity: PropTypes.func.isRequired,
};

export default AddNodePoolSpotInstances;
