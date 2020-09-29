import styled from '@emotion/styled';
import InstallIngressButton from 'Cluster/ClusterDetail/Ingress/InstallIngressButton';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectClusterById } from 'stores/cluster/selectors';
import { OrganizationsRoutes } from 'shared/constants/routes';

const StyledInstallIngressButton = styled(InstallIngressButton)`
  margin-bottom: ${({ theme }) => theme.spacingPx * 5}px;
`;

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
        title: 'INSTALL INGRESS',
        pathname: clusterGuideIngressPath,
      }}
    >
      <>
        <h1>Install an ingress controller</h1>

        <p>
          Your cluster does not come with an ingress controller installed by
          default. Without an ingress controller you won&apos;t be able to
          access any services running on the cluster from the browser.
        </p>

        <h3>Using the Giant Swarm App Platform</h3>
        <p>
          You can use our app platform to install the popular nginx ingress
          controller. We provide a tuned implementation in the &quot;Giant Swarm
          Catalog&quot;, which you can browse by clicking &quot;App
          Catalogs&quot; in the navigation above.
        </p>

        <p>
          For convenience however, you can click on the &apos;Install Ingress
          Controller&apos; button below to immediately install the nginx ingress
          controller on your cluster.
        </p>

        <StyledInstallIngressButton cluster={props.cluster} />

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
      </>
    </Breadcrumb>
  );
};

InstallIngress.propTypes = {
  match: PropTypes.object,
  cluster: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const selectedCluster = selectClusterById(
    state,
    ownProps.match.params.clusterId
  );

  return {
    cluster: selectedCluster,
  };
}

export default connect(mapStateToProps)(InstallIngress);
