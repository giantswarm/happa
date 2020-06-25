import styled from '@emotion/styled';
import * as actionTypes from 'actions/actionTypes';
import { selectCluster } from 'actions/appActions';
import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectErrorByIdAndAction } from 'selectors/clusterSelectors';
import cmp from 'semver-compare';
import { Constants } from 'shared/constants';
import { AppCatalogRoutes } from 'shared/constants/routes';
import Button from 'UI/Button';
import ClusterDetailPreinstalledApp from 'UI/ClusterDetailPreinstalledApp';

import AppDetailsModal from './AppDetailsModal/AppDetailsModal';
import UserInstalledApps from './UserInstalledApps/UserInstalledApps';

// The `appMetas` object below is a mapping of known
// release component names to logos and categories.
const appMetas = {
  'aws-cni': {
    name: 'aws-cni',
    logoUrl: '/images/app_icons/awscni@2x.png',
    category: 'essentials',
  },
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
  containerlinux: (version) => {
    const component = {
      name: 'containerlinux',
      logoUrl: '/images/app_icons/container_linux@2x.png',
      category: 'essentials',
    };

    if (cmp(version, Constants.FLATCAR_CONTAINERLINUX_SINCE) >= 0) {
      component.logoUrl = '/images/app_icons/flatcar_linux@2x.png';
    }

    return component;
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
    logoUrl: '/images/app_icons/cert_exporter@2x.png',
    category: 'management',
  },
  'net-exporter': {
    name: 'net-exporter',
    logoUrl: '/images/app_icons/net_exporter@2x.png',
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
  kiam: {
    name: 'kiam',
    logoUrl: '/images/app_icons/kiam@2x.png',
    category: 'essentials',
  },
  'external-dns': {
    name: 'external-dns',
    logoUrl: '/images/app_icons/external_dns@2x.png',
    category: 'essentials',
  },
};

const OptionalIngressNotice = styled.div``;

const SmallHeading = styled.h6`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const BrowseButton = styled(Button)`
  margin-top: 5px;
  margin-bottom: 10px;
`;

const Disclaimer = styled.p`
  margin: 0 0 20px;
  line-height: 1.2;
`;

// This component shows the list of components and apps installed on a cluster.
// Apps can be:
//  - installed by users,
//  - installed automatically by our operators during cluster creation
//
// Components are
//  - not really ever installed (no App CR) but still something we want to show
//    here. These would be components from the release.
class ClusterApps extends React.Component {
  static getDerivedStateFromProps(newProps, prevState) {
    if (prevState.appDetailsModal.visible) {
      const appToDisplay =
        newProps.installedApps?.find(
          (app) => app.metadata.name === prevState.appDetailsModal.appName
        ) ?? [];

      if (appToDisplay.length < 1) {
        new FlashMessage(
          'The app you were looking at was deleted from the cluster by someone else.',
          messageType.ERROR,
          messageTTL.LONG
        );

        return {
          appDetailsModal: {
            visible: false,
            app: null,
          },
        };
      }
    }

    return null;
  }

  isComponentMounted = false;

  state = {
    appDetailsModal: {
      visible: false,
      app: null,
    },
  };

  componentDidMount() {
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

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

    for (i = 0; i < this.props.release?.components.length; i++) {
      const { name, version } = this.props.release.components[i];

      // Remove component that is now present in the release response
      // from the manuallyAddAppMetas list to avoid showing them twice.
      this.manuallyAddAppMetas = this.manuallyAddAppMetas.filter((app) => {
        return app.name !== name;
      });

      // Find the component in the mapping above. If it's not there, then
      // it isn't something we want to show here.
      if (appMetas[name]) {
        let appMeta = appMetas[name];

        if (typeof appMeta === 'function') {
          appMeta = appMeta(version);
        }
        // Add the app to the list of apps we'll show in the interface, in the
        // correct category.
        displayApps[appMeta.category].push({
          ...appMeta,
          version,
        });
      }
    }

    for (i = 0; i < this.manuallyAddAppMetas.length; i++) {
      const appMeta = this.manuallyAddAppMetas[i];

      displayApps[appMeta.category].push(appMeta);
    }

    return displayApps;
  }

  imgError = (e) => {
    const imageUrl = e.target.src;
    const iconErrors = {};
    iconErrors[imageUrl] = true;

    this.setState((prevState) => ({
      iconErrors: Object.assign({}, prevState.iconErrors, iconErrors),
    }));
  };

  openAppCatalog = () => {
    this.props.dispatch(selectCluster(this.props.clusterId));
    this.props.dispatch(push(AppCatalogRoutes.Home));
  };

  showAppDetail = (appName) => {
    this.setState({
      appDetailsModal: {
        appName: appName,
        visible: true,
      },
    });
  };

  hideAppModal = () => {
    if (this.isComponentMounted) {
      this.setState({
        appDetailsModal: {
          appName: null,
          visible: false,
        },
      });
    }
  };

  /**
   * Returns a list of just the apps that the user installed
   * since the list of apps in a cluster also includes apps that were installed
   * automatically.
   */
  getUserInstalledApps = (apps) => {
    if (!apps) {
      return [];
    }

    return apps.filter(
      (app) =>
        app.metadata.labels['giantswarm.io/managed-by'] !== 'cluster-operator'
    );
  };

  render() {
    const { appsLoadError, installedApps } = this.props;
    const userInstalledApps = this.getUserInstalledApps(installedApps);
    const preinstalledApps = this.preinstalledApps();

    return (
      <>
        {this.props.showInstalledAppsBlock && (
          <UserInstalledApps
            apps={userInstalledApps}
            error={appsLoadError}
            onShowDetail={this.showAppDetail}
          >
            <div>
              <BrowseButton onClick={this.openAppCatalog}>
                <i className='fa fa-add-circle' />
                Install App
              </BrowseButton>
            </div>
          </UserInstalledApps>
        )}

        <div className='row cluster-apps'>
          <h3 className='table-label'>Preinstalled Apps</h3>
          <Disclaimer>
            These apps and services are preinstalled on your cluster and managed
            by Giant Swarm.
          </Disclaimer>
          <div className='row'>
            {this.props.release ? (
              <>
                <div className='col-4' key='essentials'>
                  <SmallHeading>essentials</SmallHeading>
                  {preinstalledApps.essentials.map((app) => (
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
                  {preinstalledApps.management.map((app) => (
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
                      <Disclaimer>
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
                      </Disclaimer>
                    </OptionalIngressNotice>
                  )}
                  {preinstalledApps.ingress.map((app) => (
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
        {this.state.appDetailsModal.appName && (
          <AppDetailsModal
            // Instead of just assigning the selected app to the state of this component,
            // this ensures any updates to the apps continue to flow down into the modal.
            app={this.props.installedApps?.find(
              (x) => x.metadata.name === this.state.appDetailsModal.appName
            )}
            clusterId={this.props.clusterId}
            dispatch={this.props.dispatch}
            onClose={this.hideAppModal}
            visible={this.state.appDetailsModal.visible}
          />
        )}
      </>
    );
  }
}

ClusterApps.propTypes = {
  dispatch: PropTypes.func,
  appsLoadError: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
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
