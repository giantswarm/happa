import PropTypes from 'prop-types';
import * as React from 'react';
import { Constants } from 'shared/constants';
import styled from 'styled-components';
import Checkbox from 'UI/Inputs/Checkbox';
import CurrencyInput from 'UI/Inputs/CurrencyInput';

const AzureSpotInstances = styled.div`
  position: relative;
`;

const MaxPriceWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacingPx * 2}px;

  .max-price__currency-wrapper {
    width: 160px;
  }
`;

const CheckboxWrapper = styled.div`
  position: absolute;
  left: 170px;
  top: 34px;

  .checkbox-label {
    font-size: 14px;
    font-weight: normal;
  }
`;

interface IAddNodePoolSpotInstancesAzureProps {
  maxPrice: number;
  setMaxPrice: (newPrice: number) => void;
  useOnDemandPricing: boolean;
  setUseOnDemandPricing: (isActive: boolean) => void;
  maxPriceValidationError: string;
}

const AddNodePoolSpotInstancesAzure: React.FC<IAddNodePoolSpotInstancesAzureProps> = ({
  maxPrice,
  setMaxPrice,
  maxPriceValidationError,
  useOnDemandPricing,
  setUseOnDemandPricing,
}) => {
  return (
    <AzureSpotInstances>
      <MaxPriceWrapper>
        <CurrencyInput
          onChange={setMaxPrice}
          value={maxPrice}
          /* Minimum value is set to `0` to allow user to type `0.xxx` values using their keyboard. */
          min={0}
          max={Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MAX}
          precision={Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_PRECISION}
          label='Maximum price'
          validationError={maxPriceValidationError}
          disabled={useOnDemandPricing}
          inputWrapperProps={{
            className: 'max-price__currency-wrapper',
          }}
        />
      </MaxPriceWrapper>
      <CheckboxWrapper>
        <Checkbox
          checked={useOnDemandPricing}
          onChange={setUseOnDemandPricing}
          label='Use fixed on-demand pricing'
        />
      </CheckboxWrapper>
    </AzureSpotInstances>
  );
};

AddNodePoolSpotInstancesAzure.propTypes = {
  maxPrice: PropTypes.number.isRequired,
  setMaxPrice: PropTypes.func.isRequired,
  maxPriceValidationError: PropTypes.string.isRequired,
  useOnDemandPricing: PropTypes.bool.isRequired,
  setUseOnDemandPricing: PropTypes.func.isRequired,
};

export default AddNodePoolSpotInstancesAzure;
