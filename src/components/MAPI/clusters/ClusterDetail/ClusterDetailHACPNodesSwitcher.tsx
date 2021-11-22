import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import MasterNodeConverter from 'Cluster/ClusterDetail/MasterNodes/MasterNodesConverter';
import { Box, Collapsible } from 'grommet';
import { Cluster } from 'MAPI/types';
import { extractErrorMessage } from 'MAPI/utils';
import React, { useState } from 'react';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { switchClusterToHACPNodes } from './utils';

interface IClusterDetailHACPNodesSwitcherProps
  extends React.ComponentPropsWithoutRef<typeof Collapsible> {
  cluster?: Cluster;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const ClusterDetailHACPNodesSwitcher: React.FC<IClusterDetailHACPNodesSwitcherProps> =
  ({ cluster, onSubmit, onCancel, ...props }) => {
    const clientFactory = useHttpClientFactory();
    const auth = useAuthProvider();

    const [isLoading, setIsLoading] = useState(false);

    const onApply = async () => {
      if (!cluster) return;

      setIsLoading(true);

      try {
        await switchClusterToHACPNodes(clientFactory, auth, cluster);
        setIsLoading(false);

        onSubmit?.();
      } catch (err) {
        onCancel?.();
        setIsLoading(false);

        new FlashMessage(
          'Something went wrong while trying to update the cluster.',
          messageType.ERROR,
          messageTTL.LONG,
          extractErrorMessage(err)
        );

        ErrorReporter.getInstance().notify(err as Error);
      }
    };

    return (
      <Collapsible {...props}>
        <Box margin={{ top: 'small' }}>
          <MasterNodeConverter
            onApply={onApply}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </Box>
      </Collapsible>
    );
  };

export default ClusterDetailHACPNodesSwitcher;
