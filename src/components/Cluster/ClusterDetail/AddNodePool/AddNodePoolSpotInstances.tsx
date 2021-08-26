import { FormField } from 'grommet';
import * as React from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';
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
  display: flex;
  align-items: center;
  margin-bottom: 8px;
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
      <FormField
        label='Spot instances'
        contentProps={{
          border: false,
        }}
      >
        <SpotValuesNumberPickerWrapper>
          <SpotValuesLabelText>Spot instance percentage</SpotValuesLabelText>
          <NumberPicker
            max={100}
            min={0}
            step={10}
            value={spotPercentage}
            onChange={setSpotPercentage}
            contentProps={{
              width: 'small',
            }}
            formFieldProps={{
              margin: {
                right: 'small',
              },
            }}
          />
          <SpotValuesLabelText>percent</SpotValuesLabelText>
        </SpotValuesNumberPickerWrapper>
        <SpotValuesHelpText>
          Controls the percentage of spot instances to be used for worker nodes
          beyond the number of <i>on demand base capacity</i>.
        </SpotValuesHelpText>
        <SpotValuesNumberPickerWrapper>
          <SpotValuesLabelText>On demand base capacity</SpotValuesLabelText>
          <NumberPicker
            min={0}
            max={32767}
            value={onDemandBaseCapacity}
            onChange={setOnDemandBaseCapacity}
            contentProps={{
              width: 'small',
            }}
            formFieldProps={{
              margin: {
                right: 'small',
              },
            }}
          />
          <SpotValuesLabelText>instances</SpotValuesLabelText>
        </SpotValuesNumberPickerWrapper>
        <SpotValuesHelpText>
          Controls how much of the initial capacity is made up of on-demand
          instances.
        </SpotValuesHelpText>
      </FormField>
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

export default AddNodePoolSpotInstances;
