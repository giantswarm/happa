import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { extractErrorMessage } from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { MainRoutes } from 'shared/constants/routes';
import { mutate } from 'swr';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';

import { deleteCluster } from './utils';

interface IClusterDetailOverviewDeleteProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  cluster: capiv1alpha3.ICluster;
}

const ClusterDetailOverviewDelete: React.FC<IClusterDetailOverviewDeleteProps> = ({
  cluster,
  ...props
}) => {
  const { orgId } = useParams<{ clusterId: string; orgId: string }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const [isLoading, setIsLoading] = useState(false);

  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const showConfirmation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setConfirmationVisible(true);
  };

  const hideConfirmation = () => {
    window.setTimeout(() => {
      setConfirmationVisible(false);
    });
  };

  const dispatch = useDispatch();

  const handleDelete = async () => {
    if (!cluster) return;

    setIsLoading(true);
    setConfirmationVisible(false);

    try {
      const client = clientFactory();

      const updatedCluster = await deleteCluster(
        client,
        auth,
        cluster.metadata.namespace!,
        cluster.metadata.name
      );

      new FlashMessage(
        `Cluster ${updatedCluster.metadata.name} deleted successfully.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      dispatch(push(MainRoutes.Home));

      mutate(
        capiv1alpha3.getClusterKey(
          cluster.metadata.namespace!,
          cluster.metadata.name
        ),
        updatedCluster
      );
      mutate(
        capiv1alpha3.getClusterListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelOrganization]: orgId,
            },
          },
        })
      );
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `Could not delete cluster ${cluster.metadata.name}:`,
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      setIsLoading(false);

      ErrorReporter.getInstance().notify(err as never);
    }
  };

  return (
    <Box direction='column' gap='medium' pad={{ top: 'medium' }} {...props}>
      <Text weight='bold' size='large' margin='none'>
        Delete this cluster
      </Text>
      <Box width='large'>
        <Text>
          All workloads on this cluster will be terminated. Data stored on the
          worker nodes will be lost. There is no way to undo this action.
        </Text>
      </Box>
      <Box>
        <ConfirmationPrompt
          open={confirmationVisible}
          onConfirm={handleDelete}
          onCancel={hideConfirmation}
          confirmButton={
            <Button bsStyle='danger' onClick={handleDelete}>
              <i
                className='fa fa-delete'
                role='presentation'
                aria-hidden={true}
                aria-label='Delete'
              />{' '}
              Delete {cluster.metadata.name}
            </Button>
          }
          title={`Do you really want to delete cluster ${cluster.metadata.name}?`}
        >
          <Text>
            As you might have read in the text above, this means that there is
            no way back.
          </Text>
        </ConfirmationPrompt>

        {!confirmationVisible && (
          <Box animation={{ type: 'fadeIn', duration: 300 }}>
            <Button
              bsStyle='danger'
              onClick={showConfirmation}
              loading={isLoading}
            >
              <i
                className='fa fa-delete'
                role='presentation'
                aria-hidden={true}
                aria-label='Delete'
              />{' '}
              Delete cluster
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

ClusterDetailOverviewDelete.propTypes = {
  cluster: (PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>)
    .isRequired,
};

export default ClusterDetailOverviewDelete;
