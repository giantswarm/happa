import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import { CLUSTERS_DETAILS_REQUEST } from 'stores/cluster/constants';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
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

Organizations.propTypes = {
  loadingClustersDetails: PropTypes.bool,
};

function mapStateToProps(state) {
  const loadingClustersDetails =
    selectLoadingFlagByAction(state, CLUSTERS_DETAILS_REQUEST) ?? true;

  return {
    loadingClustersDetails,
  };
}

export default connect(mapStateToProps)(Organizations);
