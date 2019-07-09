import { Breadcrumb } from 'react-breadcrumbs';
import { catalogLoadIndex, catalogsLoad } from '../../actions/catalogActions';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from '../../lib/flash_message';
import { Route, Switch } from 'react-router-dom';
import { spinner } from '../../images';
import AppList from './app_list';
import Catalogs from './catalogs';
import Detail from './detail';
import PropTypes from 'prop-types';
import React from 'react';

class CatalogIndex extends React.Component {
  state = {
    loading: true,
  };

  componentDidMount() {
    this.props
      .dispatch(catalogsLoad())
      .then(catalogs => {
        let promises = Object.keys(catalogs).map(catalog => {
          return this.props.dispatch(catalogLoadIndex(catalogs[catalog]));
        });

        return Promise.all(promises);
      })
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(error => {
        new FlashMessage(
          'Something went wrong while trying to load the catalogs.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );
        console.error(error);
      });
  }

  render() {
    return (
      <Breadcrumb
        data={{
          title: 'App Catalogs'.toUpperCase(),
          pathname: '/app-catalogs/',
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
                component={AppList}
                exact
                path={`${this.props.match.path}/:repo`}
              />
              <Route
                component={Detail}
                exact
                path={`${this.props.match.path}/:repo/:app`}
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
    return (
      <div className='app-loading'>
        <div className='app-loading-contents'>
          <img className='loader' src={spinner} />
        </div>
      </div>
    );
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
