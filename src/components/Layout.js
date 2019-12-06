import * as UserActions from 'actions/userActions';
import {
  batchedLayout,
  batchedOrganizationSelect,
} from 'actions/batchedActions';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
//<<<<<<< HEAD:src/components/Layout.js
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { organizationSelect } from 'actions/organizationActions';
import { organizationsLoad } from 'actions/organizationActions';
//=======
//>>>>>>> master:src/components/layout.js
import { push } from 'connected-react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import AccountSettings from './AccountSettings/AccountSettings';
import AppCatalog from './AppCatalog/AppCatalog';
import DocumentTitle from 'react-document-title';
import GiantSwarm from 'giantswarm';
import Home from './Home/Home';
import LoadingOverlay from './UI/loading_overlay';
import Modals from './Modals/Modals';
import Navigation from './UI/navigation';
import Organizations from './Organizations/Organizations';
import PropTypes from 'prop-types';
import React from 'react';
import Users from './Users/Users';

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
