import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Keyboard, Text } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import RoutePath from 'lib/routePath';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { IState } from 'stores/state';
import styled from 'styled-components';
import BaseTransition from 'styles/transitions/BaseTransition';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';

import ClusterListItem from './ClusterListItem';
import { compareClusters } from './utils';

const LOADING_COMPONENTS = new Array(6).fill(0);

const AnimationWrapper = styled.div`
  .cluster-list-item-enter {
    opacity: 0.01;
    transform: translate3d(-50px, 0, 0);
  }
  .cluster-list-item-enter.cluster-list-item-enter-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: 0.2s cubic-bezier(1, 0, 0, 1);
  }
  .cluster-list-item-exit {
    opacity: 1;
  }
  .cluster-list-item-exit.cluster-list-item-exit-active {
    opacity: 0.01;
    transform: translate3d(-50px, 0, 0);
    transition: 0.2s cubic-bezier(1, 0, 0, 1);
  }
`;

interface IClustersProps {}

const Clusters: React.FC<IClustersProps> = () => {
  const selectedOrgName = useSelector(
    (state: IState) => state.main.selectedOrganization
  );

  const client = useHttpClient();
  const auth = useAuthProvider();

  const getOptions: capiv1alpha3.IGetClusterListOptions = React.useMemo(() => {
    if (!selectedOrgName) return {};

    return {
      labelSelector: {
        matchingLabels: { [capiv1alpha3.labelOrganization]: selectedOrgName },
      },
    };
  }, [selectedOrgName]);

  const clusterListKey = selectedOrgName
    ? capiv1alpha3.getClusterListKey(getOptions)
    : null;

  const {
    data: clusterList,
    error: clusterListError,
    isValidating: clusterListIsValidating,
  } = useSWR<capiv1alpha3.IClusterList, GenericResponse>(clusterListKey, () =>
    capiv1alpha3.getClusterList(client, auth, getOptions)
  );

  const clusterListIsLoading =
    typeof clusterList === 'undefined' &&
    typeof clusterListError === 'undefined' &&
    clusterListIsValidating;

  const sortedClusters = useMemo(
    () => clusterList?.items.sort(compareClusters),
    [clusterList?.items]
  );

  const newClusterPath = useMemo(() => {
    if (!selectedOrgName) return '';

    return RoutePath.createUsablePath(OrganizationsRoutes.Clusters.New, {
      orgId: selectedOrgName,
    });
  }, [selectedOrgName]);

  const title = selectedOrgName
    ? `Cluster Overview | ${selectedOrgName}`
    : 'Cluster Overview';

  if (clusterListError) {
    return <div>Error: {clusterListError.data}</div>;
  }

  return (
    <DocumentTitle title={title}>
      <Box direction='column' gap='medium'>
        {selectedOrgName && (
          <Box
            pad='medium'
            background='background-front'
            round='xsmall'
            direction='row'
            align='center'
          >
            <Link to={newClusterPath}>
              <Button bsStyle='primary' tabIndex={-1}>
                <i className='fa fa-add-circle' /> Launch New Cluster
              </Button>
            </Link>

            {!clusterListIsLoading && clusterList!.items.length < 1 && (
              <Text>
                Ready to launch your first cluster? Click the green button!
              </Text>
            )}
          </Box>
        )}

        <Box>
          {clusterListIsLoading &&
            LOADING_COMPONENTS.map((_, idx) => (
              <ClusterListItem key={idx} margin={{ bottom: 'medium' }} />
            ))}

          <Keyboard
            onSpace={(e) => {
              e.preventDefault();

              (e.target as HTMLElement).click();
            }}
          >
            <AnimationWrapper>
              <TransitionGroup>
                {!clusterListIsLoading &&
                  sortedClusters!.map((cluster) => (
                    <BaseTransition
                      in={false}
                      key={cluster.metadata.name}
                      appear={false}
                      exit={true}
                      timeout={{ enter: 200, exit: 200 }}
                      delayTimeout={0}
                      classNames='cluster-list-item'
                    >
                      <ClusterListItem
                        cluster={cluster}
                        margin={{ bottom: 'medium' }}
                      />
                    </BaseTransition>
                  ))}
              </TransitionGroup>
            </AnimationWrapper>
          </Keyboard>
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Clusters;
