import * as UserActions from 'actions/userActions';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  batchedLayout,
  batchedOrganizationSelect,
} from 'actions/batchedActions';
import AccountSettings from './AccountSettings/AccountSettings';
import AppCatalog from './AppCatalog/AppCatalog';
import { Breadcrumb } from 'react-breadcrumbs';
import DocumentTitle from 'components/shared/DocumentTitle';
import GiantSwarm from 'giantswarm';
import Home from './Home/Home';
import LoadingOverlay from './UI/LoadingOverlay';
import Modals from './Modals/Modals';
import Navigation from './UI/Navigation/Navigation';
import Organizations from './Organizations/Organizations';
import PropTypes from 'prop-types';
import React from 'react';
import Users from './Users/Users';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

const defaultClient = GiantSwarm.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = 10000;
const defaultClientAuth =
  defaultClient.authentications['AuthorizationHeaderToken'];

class Layout extends React.Component {
  componentDidMount() {
    if (this.props.user) {
      defaultClientAuth.apiKeyPrefix = this.props.user.auth.scheme;
      defaultClientAuth.apiKey = this.props.user.auth.token;

      // This is the first component that loads, these are the
      // firsts calls happa makes to the API.
      this.props.dispatch(batchedLayout());
    } else {
      this.props.dispatch(push('/login'));
    }
  }

  selectOrganization = orgId => {
    const { dispatch } = this.props;

    dispatch(batchedOrganizationSelect(orgId));
    dispatch(push('/'));
  };

  render() {
    return (
      <DocumentTitle>
        <LoadingOverlay loading={this.props.loadingClustersList}>
          <Modals />
          <Navigation
            onSelectOrganization={this.selectOrganization}
            organizations={this.props.organizations}
            selectedOrganization={this.props.selectedOrganization}
            showAppCatalog={Object.keys(this.props.catalogs.items).length > 0}
            user={this.props.user}
          />
          <Breadcrumb data={{ title: 'HOME', pathname: '/' }}>
            <div className='main col-9'>
              <Switch>
                <Route component={Home} exact path='/' />
                <Route component={AppCatalog} path='/app-catalogs' />
                <Route component={Users} exact path='/users' />
                <Route component={Organizations} path='/organizations' />
                <Route
                  component={AccountSettings}
                  exact
                  path='/account-settings'
                />
                <Redirect path='*' to='/' />
              </Switch>
            </div>
          </Breadcrumb>
        </LoadingOverlay>
      </DocumentTitle>
    );
  }
}

Layout.propTypes = {
  location: PropTypes.object,
  children: PropTypes.object,
  routes: PropTypes.array,
  params: PropTypes.object,
  match: PropTypes.object,
  user: PropTypes.object,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
  firstLoadComplete: PropTypes.bool,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  catalogs: PropTypes.object,
  loadingClustersList: PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: state.app.loggedInUser,
    selectedOrganization: state.app.selectedOrganization,
    loadingClustersList: state.loadingFlags.CLUSTERS_LIST,
    catalogs: state.entities.catalogs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UserActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
