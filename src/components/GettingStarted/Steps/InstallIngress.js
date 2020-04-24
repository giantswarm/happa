import {
  CLUSTER_INSTALL_APP_REQUEST,
  CLUSTER_LOAD_APPS_REQUEST,
} from 'actions/actionTypes';
import { installApp, loadApps } from 'actions/appActions';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  selectClusterById,
  selectIngressAppFromCluster,
  selectLoadingFlagByAction,
} from 'selectors/clusterSelectors';
import { OrganizationsRoutes } from 'shared/constants/routes';
import ClusterIDLabel from 'UI/ClusterIDLabel';

const InstallIngress = (props) => {
  useEffect(() => {
    props.dispatch(loadApps(props.cluster.id));
  }, [props.cluster.id]);

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

  const buttonState = (prps) => {
    const appsLoading =
      'Checking if an ingress controller is already installed.';
    const installingIngress = 'Installing your ingress controller now.';
    const ingressInstalled = '✅ Ingress controller already installed!';
    const noIngressYet = (
      <>
        Click this button to install an ingress controller on{' '}
        <ClusterIDLabel clusterID={prps.cluster.id} />
      </>
    );

    if (prps.appsLoading) return { message: appsLoading, disabled: true };
    if (prps.ingressInstalling)
      return { message: installingIngress, disabled: true };
    if (prps.ingressApp) return { message: ingressInstalled, disabled: true };

    return { message: noIngressYet, disabled: false };
  };

  const installIngressController = async () => {
    await props.dispatch(
      installApp(
        {
          catalog: 'giantswarm',
          chartName: 'nginx-ingress-controller-app',
          namespace: 'kube-system',
          name: 'nginx-ingress-controller-app',
          valuesYAML: '',
          secretsYAML: '',
          version: '1.6.9',
        },
        props.cluster.id
      )
    );

    await props.dispatch(loadApps(props.cluster.id));
  };

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
          Controller&apos; button below to immediately install the{' '}
          <code>nginx-ingress-controller</code>
          on your cluster.
        </p>

        <div
          className='well'
          style={{ verticalAlign: 'middle', overflow: 'auto' }}
        >
          <button
            type='button'
            className='primary'
            disabled={buttonState(props).disabled}
            style={{ marginBottom: '0px', float: 'left', marginRight: '18px' }}
            onClick={installIngressController}
          >
            Install Ingress Controller
          </button>
          <p style={{ marginTop: '9px' }}>{buttonState(props).message}</p>
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
  dispatch: PropTypes.func,
  appsLoading: PropTypes.bool,
  ingressApp: PropTypes.object,
  ingressInstalling: PropTypes.bool,
};

function mapStateToProps(state, ownProps) {
  const selectedCluster = selectClusterById(
    state,
    ownProps.match.params.clusterId
  );

  const appsLoading = selectLoadingFlagByAction(
    state,
    CLUSTER_LOAD_APPS_REQUEST
  );
  const ingressInstalling = selectLoadingFlagByAction(
    state,
    CLUSTER_INSTALL_APP_REQUEST
  );
  const ingressApp = selectIngressAppFromCluster(selectedCluster);

  return {
    cluster: selectedCluster,
    ingressApp,
    appsLoading,
    ingressInstalling,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstallIngress);
