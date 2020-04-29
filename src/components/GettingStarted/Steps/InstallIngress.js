import {
  CLUSTER_INSTALL_APP_REQUEST,
  CLUSTER_LOAD_APPS_REQUEST,
} from 'actions/actionTypes';
import { installApp, loadApps } from 'actions/appActions';
import { spinner } from 'images';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
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
  const clusterId = props.cluster.id;
  const dispatch = props.dispatch;

  useEffect(() => {
    dispatch(loadApps(clusterId));
  }, [clusterId, dispatch]);

  const [installing, setInstalling] = useState(false);

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
    const loading = (
      <img style={{ width: '20px' }} className='loader' src={spinner} />
    );
    const ingressInstalled =
      '🎉 Ingress controller installed. Please continue to the next step.';
    const noIngressYet = (
      <>
        Click this button to install an ingress controller on{' '}
        <ClusterIDLabel clusterID={prps.cluster.id} />
      </>
    );

    if (installing) return { message: loading, disabled: true, visible: true };

    if (prps.ingressApp)
      return { message: ingressInstalled, disabled: true, visible: false };

    if (prps.appsLoading)
      return { message: loading, disabled: true, visible: true };

    return { message: noIngressYet, disabled: false, visible: true };
  };

  const installIngressController = async () => {
    try {
      setInstalling(true);

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
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Breadcrumb
      data={{
        title: 'INSTALL INGRESS',
        pathname: clusterGuideIngressPath,
      }}
    >
      <div className='centered col-9'>
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

        <div
          className='well'
          style={{ verticalAlign: 'middle', overflow: 'auto' }}
        >
          {buttonState(props).visible ? (
            <button
              type='button'
              className='primary'
              disabled={buttonState(props).disabled}
              style={{
                marginBottom: '0px',
                float: 'left',
                marginRight: '18px',
              }}
              onClick={installIngressController}
            >
              Install Ingress Controller
            </button>
          ) : undefined}
          <p style={{ marginTop: '9px' }}>{buttonState(props).message}</p>
        </div>

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
