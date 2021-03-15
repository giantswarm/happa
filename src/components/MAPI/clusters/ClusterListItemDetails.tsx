import { Box, Text } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import {
  getClusterInfraRef,
  getClusterInfraRefKey,
} from 'model/services/mapi/clusters/getClusterInfraRef';
import * as capiv1alpha3 from 'model/services/mapi/clusters/types/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/clusters/types/capzv1alpha3';
import * as k8sError from 'model/services/mapi/k8sError';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { getLoggedInUser } from 'stores/main/selectors';
import useSWR from 'swr';

interface IClusterListItemDetailsProps {
  cluster: capiv1alpha3.ICluster;
}

const ClusterListItemDetails: React.FC<IClusterListItemDetailsProps> = ({
  cluster,
}) => {
  const client = useHttpClient();
  const user = useSelector(getLoggedInUser);

  // Use type intersection for multiple cluster types.
  const { data, error } = useSWR<capzv1alpha3.IAzureCluster, GenericResponse>(
    getClusterInfraRefKey(user, cluster),
    getClusterInfraRef(client, user!, cluster)
  );

  if (
    k8sError.isStatusError(error?.data, k8sError.K8sStatusErrorReasons.NotFound)
  ) {
    return (
      <Box key='details'>
        <Text color='status-error'>Infrastructure ref not found.</Text>
      </Box>
    );
  }

  if (!data)
    return (
      <Box key='details'>
        <Text>Loading infrastructure ref...</Text>
      </Box>
    );

  if (data?.kind === capzv1alpha3.AzureCluster)
    return (
      <Box key='details'>
        <Text>Region: {data.spec.location}</Text>
      </Box>
    );

  return null;
};

ClusterListItemDetails.propTypes = {
  // @ts-expect-error
  cluster: PropTypes.object.isRequired,
};

export default ClusterListItemDetails;
