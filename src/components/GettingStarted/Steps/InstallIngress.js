import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';

const InstallIngress = (props) => {
  const pathParams = {
    orgId: props.match.params.orgId,
    clusterId: props.match.params.clusterId,
  };

  const clusterGuideIngressPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.InstallIngress,
    pathParams
  );

  const clusterGuideConfigurationPath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.ConfigureKubeCtl,
    pathParams
  );

  const clusterGuideExamplePath = RoutePath.createUsablePath(
    OrganizationsRoutes.Clusters.GettingStarted.SimpleExample,
    pathParams
  );

  return (
    <Breadcrumb
      data={{
        title: 'INSTALL_INGRESS',
        pathname: clusterGuideIngressPath,
      }}
    >
      <div className='centered col-9'>
        Install an ingress yo.
        <div className='component_slider--nav'>
          <Link to={clusterGuideConfigurationPath}>
            <button type='button'>
              <i className='fa fa-chevron-left' /> Back
            </button>
          </Link>

          <Link to={clusterGuideExamplePath}>
            <button className='primary' type='button'>
              Continue <i className='fa fa-chevron-right' />
            </button>
          </Link>
        </div>
      </div>
    </Breadcrumb>
  );
};

InstallIngress.propTypes = {
  goToSlide: PropTypes.func,
  match: PropTypes.object,
  cluster: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const selectedCluster =
    state.entities.clusters.items[ownProps.match.params.clusterId];

  return {
    cluster: selectedCluster,
  };
}

export default connect(mapStateToProps)(InstallIngress);
