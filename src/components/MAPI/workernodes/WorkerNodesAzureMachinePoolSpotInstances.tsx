import { Box, Text } from 'grommet';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';

interface IWorkerNodesAzureMachinePoolSpotInstancesProps {
  providerNodePool?: capzexpv1alpha3.IAzureMachinePool;
}

const WorkerNodesAzureMachinePoolSpotInstances: React.FC<IWorkerNodesAzureMachinePoolSpotInstancesProps> = ({
  providerNodePool,
}) => {
  const featureEnabled =
    typeof providerNodePool?.spec?.template.spotVMOptions !== 'undefined';
  let headline = 'Spot instances disabled';
  if (featureEnabled) {
    headline = 'Spot instances enabled';
  }

  let maxPriceRow = '';
  if (featureEnabled) {
    const maxPrice = providerNodePool?.spec?.template.spotVMOptions?.maxPrice;
    if (maxPrice && maxPrice > 0) {
      maxPriceRow = `Using maximum price: $${maxPrice}`;
    } else {
      maxPriceRow = `Using current on-demand pricing as maximum`;
    }
  }

  return (
    <ClusterDetailWidgetOptionalValue
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
                <Text size='small'>{headline}</Text>
                {maxPriceRow && (
                  <Text size='small' margin={{ top: 'xsmall' }}>
                    {maxPriceRow}
                  </Text>
                )}
              </Box>
            </Tooltip>
          }
          placement='top'
        >
          <Text aria-label='Node pool spot instances status'>
            <i
              role='presentation'
              className={featureEnabled ? 'fa fa-done' : 'fa fa-close'}
              aria-label={headline}
            />
          </Text>
        </OverlayTrigger>
      )}
    </ClusterDetailWidgetOptionalValue>
  );
};

WorkerNodesAzureMachinePoolSpotInstances.propTypes = {
  providerNodePool: PropTypes.object as PropTypes.Requireable<capzexpv1alpha3.IAzureMachinePool>,
};

export default WorkerNodesAzureMachinePoolSpotInstances;
