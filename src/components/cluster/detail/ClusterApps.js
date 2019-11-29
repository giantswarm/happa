import { push } from 'connected-react-router';
import { selectCluster } from 'actions/appActions';
import AppDetailsModal from './AppDetailsModal';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';

// This component gets a list of managed services from the release endpoint
// and tries to organize them in a predefined way.
// The `appMetas` object below is a mapping of known
// release component names to logos and categories.

// Since some components are not yet in the release endpoint output, but we do
// still want to see them on this page, we manually add them to the release endpoint
// response before running the mapping.

class ClusterApps extends React.Component {
  state = {
    appDetailsModal: {
      visible: false,
      app: null,
    },
  };

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

  preinstalledApps() {
    if (this.props.release === undefined) {
      return {};
    }

    var displayApps = {
      essentials: [],
      management: [],
      ingress: [],
    };

    for (var i = 0; i < this.props.release.components.length; i++) {
      var component = this.props.release.components[i];

      // Find the component in the mapping above. If it's not there, then
      // it isn't something we want to show here.
      if (this.appMetas[component.name]) {
        // Fetch the metadata as defined above.
        let appMeta = this.appMetas[component.name];

        // Add the version.
        appMeta.version = component.version;

        // Add the app to the list of apps we'll show in the interface, in the
        // correct category.
        displayApps[appMeta.category].push(appMeta);
      }
    }

    for (i = 0; i < this.manuallyAddAppMetas.length; i++) {
      let appMeta = this.manuallyAddAppMetas[i];

      displayApps[appMeta.category].push(appMeta);
    }

    return displayApps;
  }

  imgError = e => {
    let imageUrl = e.target.src;
    var iconErrors = {};
    iconErrors[imageUrl] = true;

    this.setState({
      iconErrors: Object.assign({}, this.state.iconErrors, iconErrors),
    });
  };

  openAppCatalog = () => {
    this.props.dispatch(selectCluster(this.props.clusterId));
    this.props.dispatch(push('/app-catalogs/'));
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

  render() {
    return (
      <React.Fragment>
        {this.props.showInstalledAppsBlock && (
          <div data-testid='installed-apps-section' id='installed-apps-section'>
            <h3 className='table-label'>Installed Apps</h3>
            <div className='row'>
              {this.props.installedApps &&
                this.props.installedApps.length === 0 && (
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

              {this.props.errorLoading && (
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
              {this.props.installedApps && this.props.installedApps.length > 0 && (
                <div data-testid='installed-apps' id='installed-apps'>
                  {this.props.installedApps.map(app => {
                    return (
                      <div
                        className='installed-apps--app'
                        key={app.metadata.name}
                      >
                        <div className='details'>
                          {app.logoUrl &&
                            !this.state.iconErrors[app.logoUrl] && (
                              <img
                                alt={app.metadata.name + ' icon'}
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
                  <i className='fa fa-add-circle'></i>Install App
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
            {Object.keys(this.preinstalledApps()).map(appCategory => {
              return (
                <div className='col-4' key={appCategory}>
                  <h6>{appCategory}</h6>
                  {this.preinstalledApps()[appCategory].map(app => {
                    return (
                      <div className='cluster-apps--app' key={app.name}>
                        <img alt={app.title + ' icon'} src={app.logoUrl} />
                        {app.name}
                        <small>{app.version}&nbsp;</small>
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
      </React.Fragment>
    );
  }
}

ClusterApps.propTypes = {
  dispatch: PropTypes.func,
  errorLoading: PropTypes.bool,
  installedApps: PropTypes.array,
  showInstalledAppsBlock: PropTypes.bool,
  clusterId: PropTypes.string,
  organizationId: PropTypes.string,
  release: PropTypes.object,
};

export default ClusterApps;
