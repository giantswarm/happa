'use strict';

import { catalogsLoad } from '../../actions/catalogActions';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
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
    this.props.dispatch(catalogsLoad()).then(() => {
      this.setState({
        loading: false,
      });
    });
  }

  render() {
    return (
      <DocumentTitle title={'App Catalog | Giant Swarm '}>
        <React.Fragment>
          <Loading loading={this.state.loading}>
            <h1>App Catalog</h1>
            <div className='row'>
              <div className='col-2'>
                <div className='repo-selection'>
                  <h4>Repository</h4>
                  <ul>
                    <li>
                      <b>All</b>
                    </li>
                    <li>giantswarm/stable</li>
                    <li>helm/stable</li>
                  </ul>
                </div>
              </div>
              <div className='col-10'>
                <div className='row'>
                  <div className='apps clearfix'>
                    <div className='col-4 app'>
                      <div className='app-icon' />
                      <div className='app-details'>
                        <span className='app-version'>v1.0.0</span>
                        <h3>Prometheus</h3>
                        <span className='app-repo'>giantswarm/stable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Loading>
        </React.Fragment>
      </DocumentTitle>
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
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  organizationId: PropTypes.string,
};

function mapStateToProps() {
  return {};
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
