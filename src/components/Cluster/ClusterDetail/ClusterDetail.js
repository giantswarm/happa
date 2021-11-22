import { push } from 'connected-react-router';
import { MainRoutes } from 'model/constants/routes';
import { selectClusterById } from 'model/stores/cluster/selectors';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, useRouteMatch } from 'react-router-dom';
import Route from 'Route';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';

import GettingStarted from '../../GettingStarted/GettingStarted';
import ClusterDetailView from './ClusterDetailView';

const ClusterDetail = () => {
  const dispatch = useDispatch();

  const match = useRouteMatch();
  const clusterID = match.params.clusterId;

  const cluster = useSelector((state) => selectClusterById(state, clusterID));
  const clusterExists = typeof cluster !== 'undefined' && cluster !== null;

  useEffect(() => {
    if (!clusterExists) {
      new FlashMessage(
        (
          <>
            Cluster <code>{clusterID}</code> no longer exists.
          </>
        ),
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(MainRoutes.Home));
    }
  }, [clusterExists, clusterID, dispatch]);

  return (
    <Breadcrumb
      data={{
        title: clusterID,
        pathname: match.url,
      }}
    >
      <Switch>
        <Route
          path={`${match.path}/getting-started/`}
          render={() => <GettingStarted match={match} />}
        />

        <Route
          path={`${match.path}`}
          render={() => <ClusterDetailView cluster={cluster} />}
        />
      </Switch>
    </Breadcrumb>
  );
};

export default ClusterDetail;
