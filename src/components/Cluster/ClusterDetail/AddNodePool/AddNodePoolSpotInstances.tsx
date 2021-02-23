import PropTypes from 'prop-types';
import * as React from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';
import ClusterCreationLabelSpan from 'UI/Display/Cluster/ClusterCreation/ClusterCreationLabelSpan';
import NumberPicker from 'UI/Inputs/NumberPicker';

import AddNodePoolSpotInstancesAzure from './AddNodePoolSpotInstancesAzure';

const SpotValuesLabelText = styled.span`
  font-weight: 300;
  font-size: 16px;
  line-height: 32px;
  display: inline-block;
  width: 210px;
`;

const SpotValuesNumberPickerWrapper = styled.div`
  margin-bottom: 8px;
`;

const StyledNumberPicker = styled(NumberPicker)`
  margin-right: 8px;
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
  maxPrice: number;
  setMaxPrice: (newPrice: number) => void;
  maxPriceValidationError: string;
  useOnDemandPricing: boolean;
  setUseOnDemandPricing: (isActive: boolean) => void;
}

const AddNodePoolSpotInstances: React.FC<IAddNodePoolSpotInstancesProps> = ({
  provider,
  spotPercentage,
  setSpotPercentage,
  onDemandBaseCapacity,
  setOnDemandBaseCapacity,
  maxPrice,
  setMaxPrice,
  maxPriceValidationError,
  useOnDemandPricing,
  setUseOnDemandPricing,
}) => {
  if (provider === Providers.AWS) {
    return (
      <>
        <ClusterCreationLabelSpan>Spot instances</ClusterCreationLabelSpan>
        <SpotValuesNumberPickerWrapper>
          <SpotValuesLabelText>Spot instance percentage</SpotValuesLabelText>
          <StyledNumberPicker
            readOnly={false}
            max={100}
            min={0}
            stepSize={10}
            value={spotPercentage}
            onChange={setSpotPercentage}
          />
          <SpotValuesLabelText>percent</SpotValuesLabelText>
        </SpotValuesNumberPickerWrapper>
        <SpotValuesHelpText>
          Controls the percentage of spot instances to be used for worker nodes
          beyond the number of <i>on demand base capacity</i>.
        </SpotValuesHelpText>
        <SpotValuesNumberPickerWrapper>
          <SpotValuesLabelText>On demand base capacity</SpotValuesLabelText>
          <StyledNumberPicker
            readOnly={false}
            min={0}
            max={32767}
            stepSize={1}
            value={onDemandBaseCapacity}
            onChange={setOnDemandBaseCapacity}
          />
          <SpotValuesLabelText>instances</SpotValuesLabelText>
        </SpotValuesNumberPickerWrapper>
        <SpotValuesHelpText>
          Controls how much of the initial capacity is made up of on-demand
          instances.
        </SpotValuesHelpText>
      </>
    );
  } else if (provider === Providers.AZURE) {
    return (
      <AddNodePoolSpotInstancesAzure
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        maxPriceValidationError={maxPriceValidationError}
        useOnDemandPricing={useOnDemandPricing}
        setUseOnDemandPricing={setUseOnDemandPricing}
      />
    );
  }

  return null;
};

AddNodePoolSpotInstances.propTypes = {
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
  spotPercentage: PropTypes.number.isRequired,
  setSpotPercentage: PropTypes.func.isRequired,
  onDemandBaseCapacity: PropTypes.number.isRequired,
  setOnDemandBaseCapacity: PropTypes.func.isRequired,
  maxPrice: PropTypes.number.isRequired,
  setMaxPrice: PropTypes.func.isRequired,
  maxPriceValidationError: PropTypes.string.isRequired,
  useOnDemandPricing: PropTypes.bool.isRequired,
  setUseOnDemandPricing: PropTypes.func.isRequired,
};

export default AddNodePoolSpotInstances;
