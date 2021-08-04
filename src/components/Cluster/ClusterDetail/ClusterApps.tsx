import { push } from 'connected-react-router';
import { ingressControllerInstallationURL } from 'lib/docs';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppConstants, Constants } from 'shared/constants';
import { AppsRoutes } from 'shared/constants/routes';
import { loadClusterApps } from 'stores/appcatalog/actions';
import {
  selectClusterById,
  selectIsClusterAwaitingUpgrade,
} from 'stores/cluster/selectors';
import {
  filterUserInstalledApps,
  isClusterCreating,
  isClusterUpdating,
} from 'stores/cluster/utils';
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

function formatAppVersion(
  release: IRelease,
  appMeta: AppConstants.IAppMetaApp
) {
  const { name, version } = appMeta;

  if (name === 'kubernetes' && release.k8sVersionEOLDate) {
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

  const appToDisplay = useMemo(() => {
    return installedApps?.find(
      (app) => app.metadata.name === detailsModalAppName
    );
  }, [installedApps, detailsModalAppName]);

  useLayoutEffect(() => {
    if (!detailsModalIsVisible || appToDisplay) return;

    new FlashMessage(
      'The app you were looking at was deleted from the cluster by someone else.',
      messageType.ERROR,
      messageTTL.LONG
    );

    setDetailsModalIsVisible(false);
    setDetailsModalAppName('');
  }, [detailsModalIsVisible, appToDisplay, installedApps]);

  // This makes a list of apps that are installed as part of the cluster creation.
  // It combines information from the release endpoint with the latest info
  // coming from App CRs.
  const preInstalledApps = useMemo(() => {
    const displayApps: Record<
      string,
      Record<string, AppConstants.IAppMetaApp>
    > = {
      essentials: {},
      management: {},
      ingress: {},
    };

    if (release?.components) {
      for (const { name, version } of release.components) {
        if (!AppConstants.appMetas.hasOwnProperty(name)) continue;

        let appMeta = AppConstants.appMetas[name];
        if (typeof appMeta === 'function') {
          appMeta = appMeta(version);
        }

        // Add the app to the list of apps we'll show in the interface, in the
        // correct category.
        displayApps[appMeta.category][appMeta.name] = {
          ...appMeta,
          version,
        };
      }
    }

    for (const appMeta of Object.values(AppConstants.defaultAppMetas)) {
      // Make sure that the app is not already in the list
      if (displayApps[appMeta.category].hasOwnProperty(appMeta.name)) continue;

      displayApps[appMeta.category][appMeta.name] = appMeta;
    }

    return displayApps;
  }, [release?.components]);

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

  const userInstalledApps = useMemo(() => {
    if (!installedApps) {
      return [];
    }

    return filterUserInstalledApps(installedApps, hasOptionalIngress ?? false);
  }, [installedApps, hasOptionalIngress]);

  const cluster = useSelector((state: IState) =>
    selectClusterById(state, clusterId)
  );

  const clusterIsUpdating = cluster && isClusterUpdating(cluster);
  const clusterIsCreating = cluster && isClusterCreating(cluster);
  const clusterIsAwaitingUpgrade = useSelector((state: IState) =>
    selectIsClusterAwaitingUpgrade(clusterId)(state)
  );

  const isUpdating = clusterIsUpdating || clusterIsAwaitingUpgrade;
  const isUpdatingOrCreating = clusterIsCreating || isUpdating;

  const appsLoadError = useSelector((state: IState) =>
    selectErrorByIdAndAction(state, clusterId, loadClusterApps().types.request)
  );

  return (
    <>
      {showInstalledAppsBlock && (
        <UserInstalledApps
          apps={userInstalledApps.map((a) => ({
            name: a.metadata.name,
            version: a.spec.version,
          }))}
          error={appsLoadError}
          onShowDetail={showAppDetail}
        >
          <BrowseButtonContainer>
            <BrowseButton
              onClick={openAppCatalog}
              disabled={isUpdatingOrCreating}
            >
              <i className='fa fa-add-circle' /> Install app
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
              {Object.values(preInstalledApps.essentials).map((app) => (
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
              {Object.values(preInstalledApps.management).map((app) => (
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
                <div>
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
                </div>
              )}
              {Object.values(preInstalledApps.ingress).map((app) => (
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

      {appToDisplay && (
        <AppDetailsModal
          // Instead of just assigning the selected app to the state of this component,
          // this ensures any updates to the apps continue to flow down into the modal.
          app={appToDisplay}
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
