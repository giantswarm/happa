import { Box, Text } from 'grommet';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesCAPA,
} from 'MAPI/utils';
import * as capav1beta1 from 'model/services/mapi/capav1beta1';
import React from 'react';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

interface IWorkerNodesSpotInstancesCAPAProps {
  providerNodePool?: capav1beta1.IAWSMachinePool;
}

const WorkerNodesSpotInstancesCAPA: React.FC<
  React.PropsWithChildren<IWorkerNodesSpotInstancesCAPAProps>
> = ({ providerNodePool }) => {
  const spotInstances = getProviderNodePoolSpotInstances(providerNodePool) as
    | INodePoolSpotInstancesCAPA
    | undefined;

  const onDemandBaseCapacity = spotInstances?.onDemandBaseCapacity ?? -1;
  const spotPercentage = spotInstances
    ? // eslint-disable-next-line no-magic-numbers
      100 - spotInstances.onDemandPercentageAboveBaseCapacity
    : -1;
  const spotInstancesEnabled = spotInstances?.enabled ?? false;
  const spotInstancesMaxPrice = spotInstances?.maxPrice ?? '';

  const spotInstancesEnabledText = `Spot instances ${
    spotInstancesEnabled ? 'enabled' : 'disabled'
  }`;

  return (
    <OptionalValue
      value={providerNodePool}
      loaderWidth={30}
      replaceEmptyValue={false}
    >
      {(value) => (
        <TooltipContainer
          content={
            <Tooltip id={`${value.metadata.name}-spot-instances-tooltip`}>
              <Box>
                <Text size='xsmall' textAlign='center'>
                  {spotInstancesEnabledText}
                </Text>
                {spotInstancesEnabled && (
                  <Text size='xsmall' textAlign='center'>
                    {spotInstancesMaxPrice
                      ? `Using maximum price: $${spotInstancesMaxPrice}`
                      : `Using current on-demand pricing as maximum`}
                  </Text>
                )}
                <Text
                  size='xsmall'
                  margin={{ top: 'xsmall' }}
                  textAlign='center'
                >
                  On-demand base capacity:{' '}
                  {onDemandBaseCapacity >= 0 ? (
                    onDemandBaseCapacity
                  ) : (
                    <NotAvailable />
                  )}
                </Text>
                <Text size='xsmall' textAlign='center'>
                  Spot instance percentage:{' '}
                  {spotPercentage >= 0 ? spotPercentage : <NotAvailable />}
                </Text>
              </Box>
            </Tooltip>
          }
        >
          <Text>
            <i
              role='presentation'
              className={spotInstancesEnabled ? 'fa fa-done' : 'fa fa-close'}
              aria-label={spotInstancesEnabledText}
            />
          </Text>
        </TooltipContainer>
      )}
    </OptionalValue>
  );
};

export default WorkerNodesSpotInstancesCAPA;
