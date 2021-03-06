import { withAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import MapiUnauthorized from 'Auth/MAPI/MapiUnauthorized';
import DocumentTitle from 'components/shared/DocumentTitle';
import GiantSwarm from 'giantswarm';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  AccountSettingsRoutes,
  AppsRoutes,
  ExceptionNotificationTestRoutes,
  MainRoutes,
  OrganizationsRoutes,
  UsersRoutes,
} from 'shared/constants/routes';
import { batchedLayout, batchedOrganizationSelect } from 'stores/batchActions';
import {
  getHasAccessToResources,
  getLoggedInUser,
} from 'stores/main/selectors';

import AccountSettings from './AccountSettings/AccountSettings';
import Apps from './Apps/Apps';
import ExceptionNotificationTest from './ExceptionNotificationTest/ExceptionNotificationTest';
import Home from './Home/Home';
import Modals from './Modals/Modals';
import Organizations from './Organizations/Organizations';
import Navigation from './UI/Controls/Navigation/Navigation';
import LoadingOverlay from './UI/Display/Loading/LoadingOverlay';
import Users from './Users/Users';

const ONE_SECOND = 1000;

const defaultClient = GiantSwarm.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = window.config.defaultRequestTimeoutSeconds * ONE_SECOND;

class Layout extends React.Component {
  componentDidMount() {
    const { dispatch, authProvider } = this.props;

    dispatch(batchedLayout(authProvider));
  }

  selectOrganization = (orgId) => {
    const { dispatch } = this.props;
    dispatch(batchedOrganizationSelect(orgId, true));
  };

  render() {
    const { user } = this.props;

    return (
      <DocumentTitle>
        <LoadingOverlay loading={!this.props.firstLoadComplete}>
          {this.props.hasAccessToResources ? (
            <>
              <Modals />
              <Navigation
                onSelectOrganization={this.selectOrganization}
                organizations={this.props.organizations}
                selectedOrganization={this.props.selectedOrganization}
                showApps={Object.keys(this.props.catalogs.items).length > 0}
                user={user}
              />
              <Breadcrumb data={{ title: 'HOME', pathname: MainRoutes.Home }}>
                <div className='main' data-testid='main'>
                  <Switch>
                    {/*prettier-ignore*/}
                    <Route component={Home} exact path={MainRoutes.Home} />
                    <Route component={Apps} path={AppsRoutes.Home} />
                    <Route component={Users} exact path={UsersRoutes.Home} />
                    <Route
                      component={Organizations}
                      path={OrganizationsRoutes.Home}
                    />
                    <Route
                      component={AccountSettings}
                      exact
                      path={AccountSettingsRoutes.Home}
                    />
                    <Route
                      component={ExceptionNotificationTest}
                      exact
                      path={ExceptionNotificationTestRoutes.Home}
                    />

                    <Redirect path='*' to={MainRoutes.Home} />
                  </Switch>
                </div>
              </Breadcrumb>
            </>
          ) : (
            <MapiUnauthorized user={user} />
          )}
        </LoadingOverlay>
      </DocumentTitle>
    );
  }
}

Layout.propTypes = {
  user: PropTypes.object,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
  catalogs: PropTypes.object,
  firstLoadComplete: PropTypes.bool,
  authProvider: PropTypes.object,
  hasAccessToResources: PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: getLoggedInUser(state),
    selectedOrganization: state.main.selectedOrganization,
    catalogs: state.entities.catalogs,
    firstLoadComplete: state.main.firstLoadComplete,
    hasAccessToResources: getHasAccessToResources(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withAuthProvider(Layout));
