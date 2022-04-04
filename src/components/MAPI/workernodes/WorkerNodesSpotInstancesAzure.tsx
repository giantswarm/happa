import { Box, Text } from 'grommet';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAzure,
} from 'MAPI/utils';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import React from 'react';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

interface IWorkerNodesSpotInstancesAzureProps {
  providerNodePool?:
    | capzexpv1alpha3.IAzureMachinePool
    | capzv1beta1.IAzureMachinePool;
}

const WorkerNodesSpotInstancesAzure: React.FC<
  IWorkerNodesSpotInstancesAzureProps
> = ({ providerNodePool }) => {
  const spotInstances = getProviderNodePoolSpotInstances(providerNodePool) as
    | INodePoolSpotInstancesAzure
    | undefined;
  const featureEnabled = spotInstances?.enabled ?? false;

  let headline = 'Spot virtual machines disabled';
  if (featureEnabled) {
    headline = 'Spot virtual machines enabled';
  }

  let maxPriceText = '';
  if (featureEnabled) {
    const maxPrice = spotInstances!.maxPrice;
    if (maxPrice && maxPrice > 0) {
      maxPriceText = `Using maximum price: $${maxPrice}`;
    } else {
      maxPriceText = `Using current on-demand pricing as maximum`;
    }
  }

  return (
    <OptionalValue
      value={providerNodePool}
      loaderWidth={30}
      replaceEmptyValue={false}
    >
      {(value) => (
        <TooltipContainer
          content={
            <Tooltip
              id={`${
                (value as capzexpv1alpha3.IAzureMachinePool).metadata.name
              }-spot-instances-tooltip`}
            >
              <Box width='180px'>
                <Text size='xsmall' textAlign='center'>
                  {headline}
                </Text>
                {maxPriceText && (
                  <Text
                    size='xsmall'
                    margin={{ top: 'xsmall' }}
                    textAlign='center'
                  >
                    {maxPriceText}
                  </Text>
                )}
              </Box>
            </Tooltip>
          }
        >
          <Text>
            <i
              role='presentation'
              className={featureEnabled ? 'fa fa-done' : 'fa fa-close'}
              aria-label={headline}
            />
          </Text>
        </TooltipContainer>
      )}
    </OptionalValue>
  );
};

export default WorkerNodesSpotInstancesAzure;
