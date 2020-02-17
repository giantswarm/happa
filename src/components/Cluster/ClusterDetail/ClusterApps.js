import styled from '@emotion/styled';
import * as actionTypes from 'actions/actionTypes';
import { selectCluster } from 'actions/appActions';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectErrorByIdAndAction } from 'selectors/clusterSelectors';
import { AppCatalogRoutes } from 'shared/constants/routes';
import Button from 'UI/Button';
import ClusterDetailPreinstalledApp from 'UI/ClusterDetailPreinstalledApp';

import AppDetailsModal from './AppDetailsModal';

// This component shows the list of components and apps installed on a cluster.
// Apps can be:
//  - installed by users,
//  - installed automatically by our operators during cluster creation
//
// Components are
//  - not really ever installed (no App CR) but still something we want to show
//    here. These would be components from the release.

const OptionalIngressNotice = styled.div``;

const SmallHeading = styled.h6`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

class ClusterApps extends React.Component {
  state = {
    appDetailsModal: {
      visible: false,
      app: null,
    },
  };

  // The `appMetas` object below is a mapping of known
  // release component names to logos and categories.
  appMetas = {
    calico: {
      name: 'calico',
      logoUrl: '/images/app_icons/calico@2x.png',
      category: 'essentials',
    },
    'cluster-autoscaler': {
      name: 'cluster-autoscaler',
      logoUrl: '/images/app_icons/cluster_autoscaler@2x.png',
      category: 'essentials',
    },
    containerlinux: {
      name: 'containerlinux',
      logoUrl: '/images/app_icons/container_linux@2x.png',
      category: 'essentials',
    },
    coredns: {
      name: 'coredns',
      logoUrl: '/images/app_icons/coredns@2x.png',
      category: 'essentials',
    },
    docker: {
      name: 'docker',
      logoUrl: '/images/app_icons/docker@2x.png',
      category: 'essentials',
    },
    etcd: {
      name: 'etcd',
      logoUrl: '/images/app_icons/etcd@2x.png',
      category: 'essentials',
    },
    kubernetes: {
      name: 'kubernetes',
      logoUrl: '/images/app_icons/kubernetes@2x.png',
      category: 'essentials',
    },
    'metrics-server': {
      name: 'metrics-server',
      logoUrl: '/images/app_icons/metrics_server@2x.png',
      category: 'essentials',
    },
    'kube-state-metrics': {
      name: 'kube-state-metrics',
      logoUrl: '/images/app_icons/kube_state_metrics@2x.png',
      category: 'management',
    },
    'chart-operator': {
      name: 'chart-operator',
      logoUrl: '/images/app_icons/chart_operator@2x.png',
      category: 'management',
    },
    'cert-exporter': {
      name: 'cert-exporter',
      logoUrl: '/images/app_icons/chart_operator@2x.png',
      category: 'management',
    },
    'net-exporter': {
      name: 'net-exporter',
      logoUrl: '/images/app_icons/chart_operator@2x.png',
      category: 'management',
    },
    'node-exporter': {
      name: 'node-exporter',
      logoUrl: '/images/app_icons/node_exporter@2x.png',
      category: 'management',
    },
    'nginx-ingress-controller': {
      name: 'nginx-ingress-controller',
      logoUrl: '/images/app_icons/nginx_ingress_controller@2x.png',
      category: 'ingress',
    },
  };

  // Since some components are not yet in the release endpoint output, but we do
  // still want to see them on this page, we manually add them to the release endpoint
  // response before running the mapping.

  // manuallyAddAppMetas represent all the components we currently do not
  // have in the release endpoint response, but that we still want to show in
  // Happa.
  manuallyAddAppMetas = [
    {
      name: 'cert-exporter',
      logoUrl: '/images/app_icons/cert_exporter@2x.png',
      category: 'management',
      version: 'n/a',
    },
    {
      name: 'net-exporter',
      logoUrl: '/images/app_icons/net_exporter@2x.png',
      category: 'management',
      version: 'n/a',
    },
    {
      name: 'RBAC and PSP defaults',
      logoUrl: '/images/app_icons/rbac_and_psp_defaults@2x.png',
      category: 'essentials',
      version: 'n/a',
    },
  ];

  // This makes a list of apps that are installed as part of the cluster creation.
  // It combines information from the release endpoint with the latest info
  // coming from App CRs.
  preinstalledApps() {
    let i = 0;

    const displayApps = {
      essentials: [],
      management: [],
      ingress: [],
    };

    for (i = 0; i < this.props.release.components.length; i++) {
      const component = this.props.release.components[i];

      // Find the component in the mapping above. If it's not there, then
      // it isn't something we want to show here.
      if (this.appMetas[component.name]) {
        // Fetch the metadata as defined above.
        const appMeta = this.appMetas[component.name];

        // Add the version.
        appMeta.version = component.version;

        // Add the app to the list of apps we'll show in the interface, in the
        // correct category.
        displayApps[appMeta.category].push(appMeta);
      }
    }

    for (i = 0; i < this.manuallyAddAppMetas.length; i++) {
      const appMeta = this.manuallyAddAppMetas[i];

      displayApps[appMeta.category].push(appMeta);
    }

    return displayApps;
  }

  imgError = e => {
    const imageUrl = e.target.src;
    const iconErrors = {};
    iconErrors[imageUrl] = true;

    this.setState(prevState => ({
      iconErrors: Object.assign({}, prevState.iconErrors, iconErrors),
    }));
  };

  openAppCatalog = () => {
    this.props.dispatch(selectCluster(this.props.clusterId));
    this.props.dispatch(push(AppCatalogRoutes.Home));
  };

  showAppDetail = appName => {
    this.setState({
      appDetailsModal: {
        appName: appName,
        visible: true,
      },
    });
  };

  hideAppModal = () => {
    this.setState({
      appDetailsModal: {
        appName: null,
        visible: false,
      },
    });
  };

  // getUserInstallApps returns a list of just the apps that the user installed
  // since the list of apps in a cluster also includes apps that were installed
  // automatically.
  getUserInstalledApps = () => {
    if (!this.props.installedApps) {
      return [];
    }

    return this.props.installedApps.filter(
      app =>
        app.metadata.labels['giantswarm.io/managed-by'] !== 'cluster-operator'
    );
  };

  render() {
    const { appsLoadError } = this.props;

    return (
      <>
        {this.props.showInstalledAppsBlock && (
          <div data-testid='installed-apps-section' id='installed-apps-section'>
            <h3 className='table-label'>Installed Apps</h3>
            <div className='row'>
              {this.getUserInstalledApps() &&
                this.getUserInstalledApps().length === 0 &&
                !appsLoadError && (
                  <p
                    className='well'
                    data-testid='no-apps-found'
                    id='no-apps-found'
                  >
                    <b>No apps installed on this cluster</b>
                    <br />
                    Browse the app catalog below and pick an app to install!
                  </p>
                )}

              {appsLoadError && (
                <p
                  className='well'
                  data-testid='error-loading-apps'
                  id='error-loading-apps'
                >
                  <b>Error Loading Apps:</b>
                  <br />
                  We had some trouble loading the list of apps you&apos;ve
                  installed on this cluster. Please refresh the page to try
                  again.
                </p>
              )}
              {this.getUserInstalledApps() &&
                this.getUserInstalledApps().length > 0 && (
                  <div data-testid='installed-apps' id='installed-apps'>
                    {this.getUserInstalledApps().map(app => {
                      return (
                        <div
                          className='installed-apps--app'
                          key={app.metadata.name}
                        >
                          <div className='details'>
                            {app.logoUrl &&
                              !this.state.iconErrors[app.logoUrl] && (
                                <img
                                  alt={`${app.metadata.name} icon`}
                                  height='36'
                                  onError={this.imgError}
                                  src={app.logoUrl}
                                  width='36'
                                />
                              )}
                            {app.metadata.name}
                            <small>
                              App Version:{' '}
                              {app && app.spec && app.spec.version
                                ? app.spec.version
                                : 'n/a'}
                            </small>
                          </div>
                          <div className='actions'>
                            <Button
                              onClick={this.showAppDetail.bind(
                                this,
                                app.metadata.name
                              )}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              <div className='browse-apps'>
                <Button onClick={this.openAppCatalog}>
                  <i className='fa fa-add-circle' />
                  Install App
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className='row cluster-apps'>
          <h3 className='table-label'>Preinstalled Apps</h3>
          <p>
            These apps and services are preinstalled on your cluster and managed
            by Giant Swarm.
          </p>
          <div className='row'>
            {this.props.release ? (
              <>
                <div className='col-4' key='essentials'>
                  <SmallHeading>essentials</SmallHeading>
                  {this.preinstalledApps().essentials.map(app => (
                    <ClusterDetailPreinstalledApp
                      logoUrl={app.logoUrl}
                      name={app.name}
                      version={app.version}
                      key={app.name}
                    />
                  ))}
                </div>

                <div className='col-4' key='management'>
                  <SmallHeading>management</SmallHeading>
                  {this.preinstalledApps().management.map(app => (
                    <ClusterDetailPreinstalledApp
                      logoUrl={app.logoUrl}
                      name={app.name}
                      version={app.version}
                      key={app.name}
                    />
                  ))}
                </div>

                <div className='col-4' key='ingress'>
                  <SmallHeading>ingress</SmallHeading>
                  {this.props.hasOptionalIngress && (
                    <OptionalIngressNotice>
                      <p>
                        The ingress controller is optional on this cluster.
                        <br />
                        You can install one using our app catalog.
                        <br />
                        <br />
                        Read more in our{' '}
                        <a
                          target='_blank'
                          rel='noopener noreferrer'
                          href='https://docs.giantswarm.io/guides/installing-optional-ingress-controller/'
                        >
                          installing an ingress controller guide.
                        </a>
                      </p>
                    </OptionalIngressNotice>
                  )}
                  {this.preinstalledApps().ingress.map(app => (
                    <ClusterDetailPreinstalledApp
                      logoUrl={app.logoUrl}
                      name={app.name}
                      version={app.version}
                      key={app.name}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className='flash-messages--flash-message flash-messages--danger'>
                Unable to load the list of preinstalled apps. Please try again
                later or contact support: support@giantswarm.io
              </div>
            )}
          </div>
        </div>
        <AppDetailsModal
          // Instead of just assigning the selected app to the state of this component,
          // this ensures any updates to the apps continue to flow down into the modal.
          app={
            this.props.installedApps &&
            this.props.installedApps.find(
              x => x.metadata.name === this.state.appDetailsModal.appName
            )
          }
          clusterId={this.props.clusterId}
          dispatch={this.props.dispatch}
          onClose={this.hideAppModal}
          visible={this.state.appDetailsModal.visible}
        />
      </>
    );
  }
}

ClusterApps.propTypes = {
  dispatch: PropTypes.func,
  appsLoadError: PropTypes.bool,
  installedApps: PropTypes.array,
  showInstalledAppsBlock: PropTypes.bool,
  clusterId: PropTypes.string,
  organizationId: PropTypes.string,
  release: PropTypes.object,
  hasOptionalIngress: PropTypes.bool,
};

function mapStateToProps(state, props) {
  return {
    loadingApps: state.loadingFlags.CLUSTER_LOAD_APPS,
    appsLoadError: selectErrorByIdAndAction(
      state,
      props.clusterId,
      actionTypes.CLUSTER_LOAD_APPS_REQUEST
    ),
  };
}

export default connect(mapStateToProps)(ClusterApps);
