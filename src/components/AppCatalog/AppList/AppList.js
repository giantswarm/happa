import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppCatalogRoutes } from 'shared/constants/routes';
import LoadingOverlay from 'UI/LoadingOverlay';

import AppListInner from './AppListInner';

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
      <DocumentTitle title='Apps'>
        <>
          <Link className='back-link' to={AppCatalogRoutes.Home}>
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
    catalog: state.entities.catalogs.items[ownProps.match.params.catalogName],
    loading: state.entities.catalogs.isFetching,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppList);
