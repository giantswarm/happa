import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { selectClusterById } from 'selectors/clusterSelectors';
import { AppRoutes } from 'shared/constants/routes';

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
        `Cluster <code>${clusterID}</code> no longer exists.`,
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(AppRoutes.Home));
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

ClusterDetail.propTypes = {};

export default ClusterDetail;
