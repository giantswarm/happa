import { Box, Text } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
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
    capiv1alpha3.getClusterInfraRefKey(user, cluster),
    capiv1alpha3.getClusterInfraRef(client, user!, cluster)
  );

  if (
    metav1.isStatusError(error?.data, metav1.K8sStatusErrorReasons.NotFound)
  ) {
    return (
      <Box key='details'>
        <Text color='status-error'>Infrastructure ref not found.</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box key='details'>
        <Text>Loading infrastructure ref...</Text>
      </Box>
    );
  }

  if (data?.kind === capzv1alpha3.AzureCluster) {
    return (
      <Box key='details'>
        <Text>Region: {data.spec.location}</Text>
      </Box>
    );
  }

  return null;
};

ClusterListItemDetails.propTypes = {
  // @ts-expect-error
  cluster: PropTypes.object.isRequired,
};

export default ClusterListItemDetails;
