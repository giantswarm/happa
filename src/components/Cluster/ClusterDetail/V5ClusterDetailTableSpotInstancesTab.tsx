import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

import { NodePoolsColumnHeader } from './V5ClusterDetailTable';

interface IV5ClusterDetailTableSpotInstancesTabProps {
  provider: PropertiesOf<typeof Providers>;
}

const V5ClusterDetailTableSpotInstancesTab: React.FC<IV5ClusterDetailTableSpotInstancesTabProps> =
  ({ provider }) => {
    const explanation = getExplanation(provider);
    const tabLabel = getTabLabel(provider);

    return (
      <OverlayTrigger
        overlay={<Tooltip id='spot-tooltip'>{explanation}</Tooltip>}
        placement='top'
      >
        <NodePoolsColumnHeader>{tabLabel}</NodePoolsColumnHeader>
      </OverlayTrigger>
    );
  };

export default V5ClusterDetailTableSpotInstancesTab;

function getExplanation(provider: PropertiesOf<typeof Providers>) {
  switch (provider) {
    case Providers.AZURE:
      return Constants.SPOT_COLUMN_EXPLANATION_AZURE;
    case Providers.AWS:
      return Constants.SPOT_COLUMN_EXPLANATION_AWS;
    default:
      return '';
  }
}

function getTabLabel(provider: PropertiesOf<typeof Providers>) {
  switch (provider) {
    case Providers.AZURE:
      return 'Spot VMs';
    case Providers.AWS:
      return 'Spot count';
    default:
      return '';
  }
}
