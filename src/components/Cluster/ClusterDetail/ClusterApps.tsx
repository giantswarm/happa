import { push } from 'connected-react-router';
import { ingressControllerInstallationURL } from 'lib/docs';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { compare } from 'lib/semver';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Constants } from 'shared/constants';
import { AppsRoutes } from 'shared/constants/routes';
import { loadClusterApps } from 'stores/appcatalog/actions';
import {
  selectClusterById,
  selectIsClusterAwaitingUpgrade,
} from 'stores/cluster/selectors';
import { isClusterCreating, isClusterUpdating } from 'stores/cluster/utils';
import { selectErrorByIdAndAction } from 'stores/entityerror/selectors';
import { selectCluster } from 'stores/main/actions';
import { getKubernetesReleaseEOLStatus } from 'stores/releases/utils';
import { IState } from 'stores/state';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import Button from 'UI/Controls/Button';
import ClusterDetailPreinstalledApp from 'UI/Display/Cluster/ClusterDetailPreinstalledApp';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import NotAvailable from 'UI/Display/NotAvailable';

import AppDetailsModal from './AppDetailsModal/AppDetailsModal';
import UserInstalledApps from './UserInstalledApps/UserInstalledApps';

function formatAppVersion(release: IRelease, app: IAppMetaApp) {
  const { name, version } = app;

  if (
    name === 'kubernetes' &&
    release.k8sVersionEOLDate &&
    !version?.endsWith(Constants.APP_VERSION_EOL_SUFFIX)
  ) {
    const { isEol } = getKubernetesReleaseEOLStatus(release.k8sVersionEOLDate);
    if (isEol) {
      return `${version} ${Constants.APP_VERSION_EOL_SUFFIX}`;
    }
  }

  if (!version) {
    return <NotAvailable />;
  }

  return version;
}

interface IAppMetaApp {
  name: string;
  logoUrl: string;
  category: 'essentials' | 'management' | 'ingress';
  version?: string;
}

// The `appMetas` object below is a mapping of known
// release component names to logos and categories.
const appMetas: Record<
  string,
  IAppMetaApp | ((version: string) => IAppMetaApp)
> = {
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
  containerlinux: (version: string) => {
    const component: IAppMetaApp = {
      name: 'containerlinux',
      logoUrl: '/images/app_icons/container_linux@2x.png',
      category: 'essentials',
    };

    if (compare(version, Constants.FLATCAR_CONTAINERLINUX_SINCE) >= 0) {
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
  'cert-manager': {
    name: 'cert-manager',
    logoUrl: '/images/app_icons/cert_manager@2x.png',
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

const BrowseButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacingPx}px 0
    ${({ theme }) => theme.spacingPx * 2}px;
`;

const BrowseButton = styled(Button)`
  margin: 0;
`;

const Disclaimer = styled.p`
  margin: 0 0 20px;
  line-height: 1.2;
`;

const PreinstalledApps = styled.div`
  display: flex;

  & > div {
    flex: 1;
    margin-right: 15px;

    &:last-child {
      margin-right: 0px;
    }
  }
`;

interface IClusterAppsProps {
  clusterId: string;
  hasOptionalIngress?: boolean;
  showInstalledAppsBlock?: boolean;
  release?: IRelease;
  installedApps?: IInstalledApp[];

  dispatch: () => void;
  appsLoadError: string;
  clusterIsUpdating: boolean;
  clusterIsAwaitingUpgrade: boolean;
  clusterIsCreating: boolean;
}

const ClusterApps: React.FC<IClusterAppsProps> = ({
  clusterId,
  hasOptionalIngress,
  showInstalledAppsBlock,
  release,
  installedApps,
}) => {
  const [detailsModalIsVisible, setDetailsModalIsVisible] = useState(false);
  const [detailsModalAppName, setDetailsModalAppName] = useState('');

  useLayoutEffect(() => {
    if (!detailsModalIsVisible) return;

    const appToDisplay = installedApps?.find(
      (app) => app.metadata.name === detailsModalAppName
    );
    if (!appToDisplay) {
      new FlashMessage(
        'The app you were looking at was deleted from the cluster by someone else.',
        messageType.ERROR,
        messageTTL.LONG
      );

      setDetailsModalIsVisible(false);
      setDetailsModalAppName('');
    }
  }, [detailsModalIsVisible, detailsModalAppName, installedApps]);

  // Since some components are not yet in the release endpoint output, but we do
  // still want to see them on this page, we manually add them to the release endpoint
  // response before running the mapping.

  // manuallyAddAppMetas represent all the components we currently do not
  // have in the release endpoint response, but that we still want to show in
  // Happa.
  const manuallyAddAppMetas = useRef<IAppMetaApp[]>([
    {
      name: 'cert-exporter',
      logoUrl: '/images/app_icons/cert_exporter@2x.png',
      category: 'management',
    },
    {
      name: 'net-exporter',
      logoUrl: '/images/app_icons/net_exporter@2x.png',
      category: 'management',
    },
    {
      name: 'RBAC and PSP defaults',
      logoUrl: '/images/app_icons/rbac_and_psp_defaults@2x.png',
      category: 'essentials',
    },
  ]);

  // This makes a list of apps that are installed as part of the cluster creation.
  // It combines information from the release endpoint with the latest info
  // coming from App CRs.
  const getPreInstalledApps = (): Record<string, IAppMetaApp[]> => {
    const displayApps: Record<string, IAppMetaApp[]> = {
      essentials: [],
      management: [],
      ingress: [],
    };

    if (release?.components) {
      for (const { name, version } of release?.components) {
        // Remove component that is now present in the release response
        // from the manuallyAddAppMetas list to avoid showing them twice.
        manuallyAddAppMetas.current = manuallyAddAppMetas.current.filter(
          (app) => {
            return app.name !== name;
          }
        );

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
    }

    for (const appMeta of manuallyAddAppMetas.current) {
      displayApps[appMeta.category].push(appMeta);
    }

    return displayApps;
  };

  const dispatch = useDispatch();

  const openAppCatalog = () => {
    dispatch(selectCluster(clusterId));
    dispatch(push(AppsRoutes.Home));
  };

  const showAppDetail = (appName: string) => {
    setDetailsModalAppName(appName);
    setDetailsModalIsVisible(true);
  };

  const hideAppModal = () => {
    setDetailsModalIsVisible(false);
    setDetailsModalAppName('');
  };

  /**
   * Returns a list of just the apps that the user installed
   * since the list of apps in a cluster also includes apps that were installed
   * automatically.
   */
  const getUserInstalledApps = (apps?: IInstalledApp[]) => {
    if (!apps) {
      return [];
    }

    const filteredApps = apps.filter((app) => {
      let isManagedByClusterOperator = false;
      if (app.metadata.labels) {
        isManagedByClusterOperator =
          app.metadata.labels['giantswarm.io/managed-by'] ===
          'cluster-operator';
      }

      switch (true) {
        case hasOptionalIngress &&
          app.spec.name === Constants.INSTALL_INGRESS_TAB_APP_NAME:
          return true;
        case isManagedByClusterOperator:
          return false;
        default:
          return true;
      }
    });

    return filteredApps;
  };

  const cluster = useSelector((state: IState) =>
    selectClusterById(state, clusterId)
  );
  const appsLoadError = useSelector((state: IState) =>
    selectErrorByIdAndAction(state, clusterId, loadClusterApps().types.request)
  );
  const clusterIsAwaitingUpgrade = useSelector((state: IState) =>
    selectIsClusterAwaitingUpgrade(clusterId)(state)
  );
  const clusterIsUpdating = cluster ? isClusterUpdating(cluster) : false;
  const clusterIsCreating = cluster ? isClusterCreating(cluster) : false;

  const userInstalledApps = getUserInstalledApps(installedApps);
  const preInstalledApps = getPreInstalledApps();

  const isUpdating = clusterIsUpdating || clusterIsAwaitingUpgrade;
  const isUpdatingOrCreating = clusterIsCreating || isUpdating;

  const selectedApp = installedApps?.find(
    (x) => x.metadata.name === detailsModalAppName
  );

  return (
    <>
      {showInstalledAppsBlock && (
        <UserInstalledApps
          apps={userInstalledApps}
          error={appsLoadError}
          onShowDetail={showAppDetail}
        >
          <BrowseButtonContainer>
            <BrowseButton
              onClick={openAppCatalog}
              disabled={isUpdatingOrCreating}
            >
              <i className='fa fa-add-circle' />
              Install App
            </BrowseButton>
            {isUpdatingOrCreating && (
              <span>
                Please wait for cluster{' '}
                {clusterIsCreating ? 'creation' : 'upgrade'} to be completed
                before installing any app.
              </span>
            )}
          </BrowseButtonContainer>
        </UserInstalledApps>
      )}

      <div className='row cluster-apps'>
        <h3 className='table-label'>Preinstalled Apps</h3>
        <Disclaimer>
          These apps and services are preinstalled on your cluster and managed
          by Giant Swarm.
        </Disclaimer>

        {release ? (
          <PreinstalledApps>
            <div key='essentials'>
              <SmallHeading>essentials</SmallHeading>
              {preInstalledApps.essentials.map((app) => (
                <ClusterDetailPreinstalledApp
                  logoUrl={app.logoUrl}
                  name={app.name}
                  version={formatAppVersion(release, app)}
                  key={app.name}
                />
              ))}
            </div>

            <div key='management'>
              <SmallHeading>management</SmallHeading>
              {preInstalledApps.management.map((app) => (
                <ClusterDetailPreinstalledApp
                  logoUrl={app.logoUrl}
                  name={app.name}
                  version={formatAppVersion(release, app)}
                  key={app.name}
                />
              ))}
            </div>

            <div key='ingress'>
              <SmallHeading>ingress</SmallHeading>
              {hasOptionalIngress && (
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
                      href={ingressControllerInstallationURL}
                    >
                      installing an ingress controller guide.
                    </a>
                  </Disclaimer>
                </OptionalIngressNotice>
              )}
              {preInstalledApps.ingress.map((app) => (
                <ClusterDetailPreinstalledApp
                  logoUrl={app.logoUrl}
                  name={app.name}
                  version={formatAppVersion(release, app)}
                  key={app.name}
                />
              ))}
            </div>
          </PreinstalledApps>
        ) : (
          <FlashMessageComponent type={FlashMessageType.Danger}>
            Unable to load the list of preinstalled apps. Please try again later
            or contact support: support@giantswarm.io
          </FlashMessageComponent>
        )}
      </div>

      {selectedApp && (
        <AppDetailsModal
          // Instead of just assigning the selected app to the state of this component,
          // this ensures any updates to the apps continue to flow down into the modal.
          app={selectedApp}
          clusterId={clusterId}
          onClose={hideAppModal}
          visible={detailsModalIsVisible}
        />
      )}
    </>
  );
};

ClusterApps.propTypes = {
  clusterId: PropTypes.string.isRequired,
  release: PropTypes.object as PropTypes.Validator<IRelease>,
  installedApps: PropTypes.array,
  showInstalledAppsBlock: PropTypes.bool,
  hasOptionalIngress: PropTypes.bool,
};

export default ClusterApps;
