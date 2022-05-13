import { Box, Text } from 'grommet';
import { Providers } from 'model/constants';
import * as React from 'react';
import styled from 'styled-components';
import NumberPicker from 'UI/Inputs/NumberPicker';

import AddNodePoolSpotInstancesAzure from './AddNodePoolSpotInstancesAzure';

const NumberPickerWrapper = styled(Box)`
  position: relative;
`;

const NumberPickerAdditionalText = styled(Box)`
  position: absolute;
  left: 170px;
  top: 0;
  bottom: 0;
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

const AddNodePoolSpotInstances: React.FC<
  React.PropsWithChildren<IAddNodePoolSpotInstancesProps>
> = ({
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
      <Box margin={{ bottom: 'xsmall' }}>
        <NumberPickerWrapper>
          <NumberPicker
            label='Spot instance percentage'
            max={100}
            min={0}
            step={10}
            value={spotPercentage}
            onChange={setSpotPercentage}
            help={
              <Text size='small' weight='normal' color='text-weak'>
                Controls the percentage of spot instances to be used for worker
                nodes beyond the number of{' '}
                <strong>on demand base capacity</strong>.
              </Text>
            }
            contentProps={{
              width: 'small',
            }}
          >
            <NumberPickerAdditionalText direction='column' justify='center'>
              <Text>percent</Text>
            </NumberPickerAdditionalText>
          </NumberPicker>
        </NumberPickerWrapper>
        <NumberPickerWrapper>
          <NumberPicker
            label='On demand base capacity'
            min={0}
            max={32767}
            value={onDemandBaseCapacity}
            onChange={setOnDemandBaseCapacity}
            help='Controls how much of the initial capacity is made up of on-demand
          instances.'
            contentProps={{
              width: 'small',
            }}
          >
            <NumberPickerAdditionalText direction='column' justify='center'>
              <Text>instances</Text>
            </NumberPickerAdditionalText>
          </NumberPicker>
        </NumberPickerWrapper>
      </Box>
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
