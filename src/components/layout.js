import * as UserActions from 'actions/userActions';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { catalogsLoad } from 'actions/catalogActions';
import { clustersLoadV5 } from 'actions/clusterActions';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { organizationSelect } from 'actions/organizationActions';
import { organizationsLoad } from 'actions/organizationActions';
import { push } from 'connected-react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import AccountSettings from './account_settings';
import AppCatalog from './app_catalog';
import DocumentTitle from 'react-document-title';
import GiantSwarm from 'giantswarm';
import Home from './home';
import LoadingOverlay from './UI/loading_overlay';
import Modals from './modals';
import Navigation from './UI/navigation';
import Organizations from './organizations';
import PropTypes from 'prop-types';
import React from 'react';
import Users from './users';

var defaultClient = GiantSwarm.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = 10000;
var defaultClientAuth =
  defaultClient.authentications['AuthorizationHeaderToken'];

class Layout extends React.Component {
  componentDidMount() {
    if (this.props.user) {
      defaultClientAuth.apiKeyPrefix = this.props.user.auth.scheme;
      defaultClientAuth.apiKey = this.props.user.auth.token;

      // This is the first component that loads,
      // and refreshUserInfo and the subsequent organisationsLoad() are the
      // first calls happa makes to the API.
      this.props.actions
        .refreshUserInfo()
        .then(() => {
          return this.props.dispatch(organizationsLoad());
        })
        .then(() => {
          this.props.dispatch(clustersLoadV5());
        })
        .then(() => {
          this.props.dispatch(catalogsLoad());
        })
        .catch(error => {
          console.error('Error refreshing user info', error);

          if (error.status === 401) {
            new FlashMessage(
              'Please log in again, as your previously saved credentials appear to be invalid.',
              messageType.WARNING,
              messageTTL.MEDIUM
            );

            this.props.dispatch(push('/login'));
          } else {
            new FlashMessage(
              'Something went wrong while trying to load user and organization information.',
              messageType.ERROR,
              messageTTL.LONG,
              'Please try again in a moment or contact support: support@giantswarm.io'
            );
          }
        });
    } else {
      this.props.dispatch(push('/login'));
    }
  }

  selectOrganization = orgId => {
    this.props.dispatch(organizationSelect(orgId));
  };

  render() {
    // prettier-ignore
    return (
        <DocumentTitle title='Giant Swarm'>
          <LoadingOverlay loading={!this.props.firstLoadComplete}>
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
                  <Route component={Home} exact                  path='/' />
                  <Route       component={AppCatalog}       path='/app-catalogs' />
                  <Route component={Users} exact             path='/users' />
                  <Route       component={Organizations}     path='/organizations' />
                  <Route component={AccountSettings} exact  path='/account-settings' />
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
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: state.app.loggedInUser,
    selectedOrganization: state.app.selectedOrganization,
    firstLoadComplete: state.app.firstLoadComplete,
    catalogs: state.entities.catalogs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UserActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout);
