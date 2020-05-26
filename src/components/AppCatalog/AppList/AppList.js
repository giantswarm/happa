import { CATALOG_LOAD_INDEX_REQUEST } from 'actions/actionTypes';
import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectLoadingFlagByAction,
  selectLoadingFlagByIdAndAction,
} from 'selectors/clusterSelectors';
import { AppCatalogRoutes } from 'shared/constants/routes';
import { listCatalogs } from 'stores/appcatalog/actions';
import LoadingOverlay from 'UI/LoadingOverlay';

import AppListInner from './AppListInner';

const AppList = ({
  catalog,
  catalogLoadIndex,
  loadingIndex,
  loadingCatalogs,
  ...props
}) => {
  const catalogName = catalog?.metadata?.name;
  const breadCrumbTitle = catalogName ? catalogName.toUpperCase() : '';

  useEffect(() => {
    if (catalogName) {
      catalogLoadIndex(catalog);
    }
  }, [catalogName, loadingCatalogs, catalogLoadIndex, catalog]);

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
          <LoadingOverlay loading={loadingCatalogs || loadingIndex}>
            <AppListInner catalog={catalog} {...props} />
          </LoadingOverlay>
        </>
      </DocumentTitle>
    </Breadcrumb>
  );
};

AppList.propTypes = {
  catalog: PropTypes.object,
  catalogLoadIndex: PropTypes.func,
  dispatch: PropTypes.func,
  location: PropTypes.object,
  loadingIndex: PropTypes.bool,
  loadingCatalogs: PropTypes.bool,
  match: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  return {
    catalog: state.entities.catalogs.items[ownProps.match.params.catalogName],
    loadingCatalogs: selectLoadingFlagByAction(
      state,
      listCatalogs().types.request
    ),
    loadingIndex: selectLoadingFlagByIdAndAction(
      state,
      ownProps.match.params.catalogName,
      CATALOG_LOAD_INDEX_REQUEST
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppList);
