import { OrganizationsRoutes } from 'model/constants/routes';
import { CLUSTERS_DETAILS_REQUEST } from 'model/stores/cluster/constants';
import { selectLoadingFlagByAction } from 'model/stores/loading/selectors';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';
import Route from 'Route';
import LoadingOverlay from 'UI/Display/Loading/LoadingOverlay';

import Detail from './Detail/Detail';
import List from './List/List';

const Organizations = (props) => {
  return (
    <Breadcrumb
      data={{ title: 'ORGANIZATIONS', pathname: OrganizationsRoutes.Home }}
    >
      <LoadingOverlay loading={props.loadingClustersDetails}>
        <Switch>
          <Route component={List} exact path={OrganizationsRoutes.List} />
          <Route component={Detail} path={OrganizationsRoutes.Detail} />
          <Redirect to={OrganizationsRoutes.Home} />
        </Switch>
      </LoadingOverlay>
    </Breadcrumb>
  );
};

function mapStateToProps(state) {
  const loadingClustersDetails =
    selectLoadingFlagByAction(state, CLUSTERS_DETAILS_REQUEST) ?? true;

  return {
    loadingClustersDetails,
  };
}

export default connect(mapStateToProps)(Organizations);
