import { Box, Text } from 'grommet';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAWS,
} from 'MAPI/utils';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import React from 'react';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

interface IWorkerNodesSpotInstancesAWSProps {
  providerNodePool?: infrav1alpha3.IAWSMachineDeployment;
}

const WorkerNodesSpotInstancesAWS: React.FC<
  IWorkerNodesSpotInstancesAWSProps
> = ({ providerNodePool }) => {
  const spotInstances = getProviderNodePoolSpotInstances(providerNodePool) as
    | INodePoolSpotInstancesAWS
    | undefined;

  const onDemandBaseCapacity = spotInstances?.onDemandBaseCapacity ?? -1;
  const spotPercentage = spotInstances
    ? // eslint-disable-next-line no-magic-numbers
      100 - spotInstances.onDemandPercentageAboveBaseCapacity
    : -1;
  const nodeCount = spotInstances?.nodeCount ?? -1;

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
          <Text aria-label='Number of nodes using spot instances'>
            {nodeCount >= 0 ? nodeCount : <NotAvailable />}
          </Text>
        </TooltipContainer>
      )}
    </OptionalValue>
  );
};

export default WorkerNodesSpotInstancesAWS;
