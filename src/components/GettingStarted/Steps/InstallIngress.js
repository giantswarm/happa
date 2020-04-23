import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectClusterById } from 'selectors/clusterSelectors';
import { OrganizationsRoutes } from 'shared/constants/routes';
import ClusterIDLabel from 'UI/ClusterIDLabel';

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
        <h1>Install an ingress controller</h1>

        <p>
          Your cluster ({props.cluster.name}{' '}
          <ClusterIDLabel clusterID={props.cluster.id} />) does not come with an
          ingress controller installed by default. Without an ingress controller
          you won&apos;t be able to access any services running on the cluster
          from the browser. Once you have an ingress controller you&apos;ll be
          able to create Ingress resources which specify how external traffic
          should get routed to services running on you cluster.
        </p>

        <h3>Using the Giant Swarm App Platform</h3>
        <p>
          You can use our app platform to install the popular{' '}
          <code>nginx-ingress-controller</code>. We provide a tuned
          implementation of the <code>nginx-ingress-controller</code> in the
          &quot;Giant Swarm Catalog&quot;
        </p>

        <p>
          For convenience, you can click on the &apos;Install Ingress
          Controller&apos; button below to bring up a modal which will guide you
          through the process.
        </p>

        <div className='well' style={{ textAlign: 'center' }}>
          <button
            type='button'
            className='primary'
            style={{ marginBottom: '0px' }}
          >
            Install Ingress Controller
          </button>
        </div>
        <hr />

        <small>
          <i>
            Alternatively, you can click on &quot;App Catalogs&quot; in the
            navigation above, then pick &quot;Giant Swarm Catalog&quot;.
          </i>

          <br />
          <br />
          <i>Here you&apos;ll find all the apps we provide.</i>

          <br />
          <br />
          <i>
            Pick <code>nginx-ingress-controller-app</code> and click on
            &quot;Configure & Install&quot; to bring up a modal where you can
            pick which cluster you want to install it to.
            <br />
            <br />
            Pick your cluster <ClusterIDLabel
              clusterID={props.cluster.id}
            />{' '}
            from the list and go through the steps presented in the modal.
          </i>
        </small>

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
  const selectedCluster = selectClusterById(
    state,
    ownProps.match.params.clusterId
  );

  return {
    cluster: selectedCluster,
  };
}

export default connect(mapStateToProps)(InstallIngress);
