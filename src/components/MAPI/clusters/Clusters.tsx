import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import RoutePath from 'lib/routePath';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { IState } from 'stores/state';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';

import ClusterListItem from './ClusterListItem';

const AnimationWrapper = styled.div`
  .cluster-list-item-enter,
  .cluster-list-item-appear {
    opacity: 0;
  }

  .cluster-list-item-appear.cluster-list-item-appear-active {
    opacity: 1;
    transition: opacity 150ms ease-in;
  }

  .cluster-list-item-enter.cluster-list-item-enter-active {
    opacity: 1;
    transition: opacity 150ms ease-in;
  }

  .cluster-list-item-exit {
    opacity: 1;
  }

  .cluster-list-item-exit.cluster-list-item-exit-active {
    opacity: 0;
    transition: opacity 150ms ease-in;
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

  if (clusterListIsLoading) {
    return <div>Loading...</div>;
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
              <Button bsStyle='primary'>
                <i className='fa fa-add-circle' /> Launch New Cluster
              </Button>
            </Link>

            {clusterList!.items.length > 1 && (
              <Text>
                Ready to launch your first cluster? Click the green button!
              </Text>
            )}
          </Box>
        )}

        <Box>
          <AnimationWrapper>
            <TransitionGroup
              className='cluster-list'
              appear={true}
              enter={true}
            >
              {clusterList!.items.map((cluster) => (
                <CSSTransition
                  classNames='cluster-list-item'
                  key={cluster.metadata.name}
                  timeout={200}
                  exit={false}
                >
                  <ClusterListItem
                    cluster={cluster}
                    margin={{ bottom: 'medium' }}
                  />
                </CSSTransition>
              ))}
            </TransitionGroup>
          </AnimationWrapper>
        </Box>
      </Box>
    </DocumentTitle>
  );
};

export default Clusters;
