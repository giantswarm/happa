'use strict';

import { Breadcrumb } from 'react-breadcrumbs';
import Button from '../../shared/button';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

class AppDetail extends React.Component {
  state = {};

  constructor() {
    super();
  }

  render() {
    console.log(this.props.appVersions[0]);
    return (
      <DocumentTitle title={`${this.props.appVersions[0].name} | Giant Swarm `}>
        <Breadcrumb
          data={{
            title: this.props.appVersions[0].name,
            pathname: this.props.match.url,
          }}
        >
          <div className='app-detail'>
            <div className='app-detail--header clearfix'>
              <img src={this.props.appVersions[0].icon} />
              <h2>{this.props.appVersions[0].name}</h2>
              {this.props.appVersions[0].keywords.map(x => (
                <span key={x} className='keyword'>
                  {x}
                </span>
              ))}
            </div>

            <div className='app-detail--body'>
              <p>{this.props.appVersions[0].description}</p>
            </div>
            <Button>
              <Link to='/app-katalog'>Back to the App Katalog</Link>
            </Button>
          </div>
        </Breadcrumb>
      </DocumentTitle>
    );
  }
}

AppDetail.propTypes = {
  appVersions: PropTypes.array,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  var repo = decodeURIComponent(ownProps.match.params.repo);
  var appName = decodeURIComponent(ownProps.match.params.app);

  var appVersions = [];
  if (
    state.entities.catalogs.items[repo] &&
    state.entities.catalogs.items[repo].apps[appName]
  ) {
    appVersions = state.entities.catalogs.items[repo].apps[appName];
  }

  return {
    loading: state.entities.catalogs.isFetching,
    appVersions,
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
)(AppDetail);
