import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import React, { useEffect, useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import {
  selectClusterById,
  selectTargetRelease,
} from 'selectors/clusterSelectors';
import { getAllReleases } from 'selectors/releaseSelectors';
import { AppRoutes } from 'shared/constants/routes';

import GettingStarted from '../../GettingStarted/GettingStarted';
import ClusterDetailView from './ClusterDetailView';

const ClusterDetail = () => {
  const dispatch = useDispatch();

  const match = useRouteMatch();
  const clusterID = match.params.clusterId;
  const orgID = match.params.orgId;

  const cluster = useSelector((state) => selectClusterById(state, clusterID));
  const allReleases = useSelector((state) => getAllReleases(state) || {});
  const release = allReleases[cluster?.release_version] ?? null;
  const isV5Cluster = useSelector((state) =>
    state.entities.clusters.v5Clusters.includes(clusterID)
  );
  const credentials = useSelector((state) => state.entities.credentials);
  const catalogs = useSelector((state) => state.entities.catalogs);
  const nodePools = useSelector((state) => state.entities.nodePools.items);
  const provider = useSelector((state) => state.main.info.general.provider);
  const user = useSelector((state) => state.main.loggedInUser);
  const region = useSelector((state) => state.main.info.general.datacenter);
  const isAdmin = useSelector((state) => state.main.loggedInUser.isAdmin);

  const defaultTargetRelease = useSelector((state) => {
    const targetReleaseVersion = selectTargetRelease(state, cluster);

    return state.entities.releases.items[targetReleaseVersion] ?? null;
  });
  const [targetRelease, setTargetRelease] = useState(defaultTargetRelease);
  const handleChangeTargetRelease = (newReleaseVersion) => {
    const newRelease = allReleases[newReleaseVersion];
    if (newRelease) {
      setTargetRelease(newRelease);
    }
  };
  const cancelChangeTargetRelease = () => {
    setTargetRelease(defaultTargetRelease);
  };

  useEffect(() => {
    if (!cluster) {
      new FlashMessage(
        `Cluster <code>${clusterID}</code> doesn't exist.`,
        messageType.INFO,
        messageTTL.MEDIUM
      );

      dispatch(push(AppRoutes.Home));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          render={() => (
            <ClusterDetailView
              match={match}
              cluster={cluster}
              isV5Cluster={isV5Cluster}
              organizationId={orgID}
              targetRelease={targetRelease}
              setTargetRelease={handleChangeTargetRelease}
              cancelSetTargetRelease={cancelChangeTargetRelease}
              release={release}
              clusterId={clusterID}
              credentials={credentials}
              catalogs={catalogs}
              nodePools={nodePools}
              provider={provider}
              user={user}
              region={region}
              isAdmin={isAdmin}
            />
          )}
        />
      </Switch>
    </Breadcrumb>
  );
};

ClusterDetail.propTypes = {};

export default ClusterDetail;
