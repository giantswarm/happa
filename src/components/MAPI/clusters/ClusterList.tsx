import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as React from 'react';
import useSWR from 'swr';

import ClusterListItem from './ClusterListItem';

interface IClusterListProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const ClusterList: React.FC<IClusterListProps> = () => {
  const client = useHttpClient();
  const auth = useAuthProvider();

  const { data, error, isValidating } = useSWR<
    capiv1alpha3.IClusterList,
    GenericResponse
  >(capiv1alpha3.getClusterListKey(client, auth), capiv1alpha3.getClusterList);

  if (error) {
    return <div>Error: {error.data}</div>;
  }

  // Initial load.
  if (!data) {
    return <div>Loading...</div>;
  }

  // Initial and other loads.
  if (isValidating) {
    return <div>Loading...</div>;
  }

  return (
    <Box direction='column' gap='medium' margin={{ bottom: 'large' }}>
      {data.items.map((cluster) => (
        <ClusterListItem key={cluster.metadata.name} cluster={cluster} />
      ))}
    </Box>
  );
};

export default ClusterList;
