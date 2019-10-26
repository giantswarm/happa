import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import AppListInner from './AppListInner';
import DocumentTitle from 'react-document-title';
import LoadingOverlay from 'UI/loading_overlay';
import PropTypes from 'prop-types';
import React from 'react';

class AppList extends React.Component {
  render() {
    return (
      <Breadcrumb
        data={{
          title: this.props.catalog.metadata.name.toUpperCase(),
          pathname: this.props.match.url,
        }}
      >
        <DocumentTitle title={'Apps | Giant Swarm '}>
          <React.Fragment>
            <Link className='back-link' to={'/app-catalogs/'}>
              <i aria-hidden='true' className='fa fa-chevron-left' />
              Back to all catalogs
            </Link>
            <br />
            <br />
            <LoadingOverlay
              loading={
                this.props.catalog.isFetchingIndex && this.props.catalog.apps
              }
            >
              <AppListInner {...this.props} />
            </LoadingOverlay>
          </React.Fragment>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

AppList.propTypes = {
  catalog: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  loading: PropTypes.bool,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  return {
    catalog: state.entities.catalogs.items[ownProps.match.params.repo],
    loading: state.entities.catalogs.isFetching,
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
)(AppList);
