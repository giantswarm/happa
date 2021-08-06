import { Box, Text } from 'grommet';
import {
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAzure,
} from 'MAPI/utils';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import OptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/OptionalValue';

interface IWorkerNodesAzureMachinePoolSpotInstancesProps {
  providerNodePool?: capzexpv1alpha3.IAzureMachinePool;
}

const WorkerNodesAzureMachinePoolSpotInstances: React.FC<IWorkerNodesAzureMachinePoolSpotInstancesProps> = ({
  providerNodePool,
}) => {
  const featureEnabled =
    typeof providerNodePool?.spec?.template.spotVMOptions !== 'undefined';
  let headline = 'Spot virtual machines disabled';
  if (featureEnabled) {
    headline = 'Spot virtual machines enabled';
  }

  let maxPriceText = '';
  if (featureEnabled) {
    const maxPrice = (getProviderNodePoolSpotInstances(
      providerNodePool
    ) as INodePoolSpotInstancesAzure).maxPrice;
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
        <OverlayTrigger
          overlay={
            <Tooltip
              id={`${
                (value as capzexpv1alpha3.IAzureMachinePool).metadata.name
              }-spot-instances-tooltip`}
            >
              <Box width='small'>
                <Text size='xsmall'>{headline}</Text>
                {maxPriceText && (
                  <Text size='xsmall' margin={{ top: 'xsmall' }}>
                    {maxPriceText}
                  </Text>
                )}
              </Box>
            </Tooltip>
          }
          placement='top'
        >
          <Text>
            <i
              role='presentation'
              className={featureEnabled ? 'fa fa-done' : 'fa fa-close'}
              aria-label={headline}
            />
          </Text>
        </OverlayTrigger>
      )}
    </OptionalValue>
  );
};

WorkerNodesAzureMachinePoolSpotInstances.propTypes = {
  providerNodePool: PropTypes.object as PropTypes.Requireable<capzexpv1alpha3.IAzureMachinePool>,
};

export default WorkerNodesAzureMachinePoolSpotInstances;
