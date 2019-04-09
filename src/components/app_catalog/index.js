'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import { catalogsLoad } from '../../actions/catalogActions';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from '../../lib/flash_message';
import { Route, Switch } from 'react-router-dom';
import AppList from './app_list';
import Catalogs from './catalogs';
import Detail from './detail';
import PropTypes from 'prop-types';
import React from 'react';

class CatalogIndex extends React.Component {
  state = {
    loading: true,
  };

  constructor() {
    super();
  }

  componentDidMount() {
    if (this.props.catalogs.lastUpdated === 0) {
      this.props
        .dispatch(catalogsLoad())
        .then(() => {
          this.setState({
            loading: false,
          });
        })
        .catch(() => {
          new FlashMessage(
            'Something went wrong while trying to load the App Katalog.',
            messageType.ERROR,
            messageTTL.LONG,
            'Please try again later or contact support: support@giantswarm.io'
          );
        });
    } else {
      this.setState({
        loading: false,
      });
    }
  }

  render() {
    return (
      <Breadcrumb
        data={{
          title: 'App Katalog'.toUpperCase(),
          pathname: '/app-katalog/',
        }}
      >
        <div className='app-catalog'>
          <Loading loading={this.state.loading}>
            <Switch>
              <Route
                exact
                path={`${this.props.match.path}`}
                render={() => <Catalogs {...this.props} />}
              />
              <Route
                exact
                path={`${this.props.match.path}/:repo`}
                component={AppList}
              />
              <Route
                exact
                path={`${this.props.match.path}/:repo/:app`}
                component={Detail}
              />
            </Switch>
          </Loading>
        </div>
      </Breadcrumb>
    );
  }
}

function Loading(props) {
  if (props.loading) {
    return <img className='loader' src='/images/loader_oval_light.svg' />;
  } else {
    return props.children;
  }
}

CatalogIndex.propTypes = {
  catalogs: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  match: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    catalogs: state.entities.catalogs,
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
)(CatalogIndex);
