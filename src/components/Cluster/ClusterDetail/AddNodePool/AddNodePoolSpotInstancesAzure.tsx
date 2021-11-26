import { Constants } from 'model/constants';
import * as React from 'react';
import styled from 'styled-components';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import CurrencyInput from 'UI/Inputs/CurrencyInput';

const AzureSpotInstances = styled.div`
  position: relative;
`;

const CheckboxWrapper = styled.div`
  position: absolute;
  left: 170px;
  top: 73px;
`;

interface IAddNodePoolSpotInstancesAzureProps {
  maxPrice: number;
  setMaxPrice: (newPrice: number) => void;
  useOnDemandPricing: boolean;
  setUseOnDemandPricing: (isActive: boolean) => void;
  maxPriceValidationError: string;
}

const AddNodePoolSpotInstancesAzure: React.FC<
  IAddNodePoolSpotInstancesAzureProps
> = ({
  maxPrice,
  setMaxPrice,
  maxPriceValidationError,
  useOnDemandPricing,
  setUseOnDemandPricing,
}) => {
  return (
    <AzureSpotInstances>
      <CurrencyInput
        id='spot-instances-max-price'
        onChange={setMaxPrice}
        value={maxPrice}
        /* Minimum value is set to `0` to allow user to type `0.xxx` values using their keyboard. */
        min={0}
        max={Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MAX}
        precision={Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_PRECISION}
        label='Price limit'
        error={maxPriceValidationError}
        disabled={useOnDemandPricing}
        help='The highest amount per hour (in USD) you are willing to pay, per virtual machine.'
        contentProps={{
          width: 'small',
        }}
      />
      <CheckboxWrapper>
        <CheckBoxInput
          checked={useOnDemandPricing}
          onChange={(e) => setUseOnDemandPricing(e.target.checked)}
          label='Use the on-demand price as limit'
        />
      </CheckboxWrapper>
    </AzureSpotInstances>
  );
};

export default AddNodePoolSpotInstancesAzure;
