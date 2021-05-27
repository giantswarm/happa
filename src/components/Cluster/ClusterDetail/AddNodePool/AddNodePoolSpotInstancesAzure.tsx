import PropTypes from 'prop-types';
import * as React from 'react';
import { Constants } from 'shared/constants';
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

const AddNodePoolSpotInstancesAzure: React.FC<IAddNodePoolSpotInstancesAzureProps> = ({
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
        label='Maximum price per hour'
        error={maxPriceValidationError}
        disabled={useOnDemandPricing}
        help='The maximum price per hour that a single node pool VM instance can reach before it is deallocated.'
        contentProps={{
          width: 'small',
        }}
      />
      <CheckboxWrapper>
        <CheckBoxInput
          checked={useOnDemandPricing}
          onChange={(e) => setUseOnDemandPricing(e.target.checked)}
          label='Use current on-demand pricing as max'
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
