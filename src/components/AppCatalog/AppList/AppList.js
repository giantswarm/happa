import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import AppListInner from './AppListInner';
import DocumentTitle from 'components/shared/DocumentTitle';
import LoadingOverlay from 'UI/LoadingOverlay';
import PropTypes from 'prop-types';
import React from 'react';

const AppList = ({ catalog, ...props }) => {
  const breadCrumbTitle = catalog ? catalog.metadata.name.toUpperCase() : '';
  const isLoading = !catalog || catalog.isFetchingIndex;

  return (
    <Breadcrumb
      data={{
        title: breadCrumbTitle,
        pathname: props.match.url,
      }}
    >
      <DocumentTitle title={'Apps | Giant Swarm '}>
        <>
          <Link className='back-link' to={'/app-catalogs/'}>
            <i aria-hidden='true' className='fa fa-chevron-left' />
            Back to all catalogs
          </Link>
          <br />
          <br />
          <LoadingOverlay loading={isLoading}>
            <AppListInner catalog={catalog} {...props} />
          </LoadingOverlay>
        </>
      </DocumentTitle>
    </Breadcrumb>
  );
};

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
