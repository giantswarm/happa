import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import UserInstalledApps from 'Cluster/ClusterDetail/UserInstalledApps/UserInstalledApps';
import { push } from 'connected-react-router';
import { Box } from 'grommet';
import { ingressControllerInstallationURL } from 'lib/docs';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import AppDetailsModalMAPI from 'MAPI/apps/AppDetailsModal';
import ListAppsGuide from 'MAPI/clusters/guides/ListAppsGuide';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import PropTypes from 'prop-types';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import { AppConstants } from 'shared/constants';
import { AppsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { supportsOptionalIngress } from 'stores/cluster/utils';
import { selectCluster } from 'stores/main/actions';
import { getProvider } from 'stores/main/selectors';
import styled from 'styled-components';
import { FlashMessageType } from 'styles';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterDetailPreinstalledApp from 'UI/Display/Cluster/ClusterDetailPreinstalledApp';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import NotAvailable from 'UI/Display/NotAvailable';

import ClusterDetailAppLoadingPlaceholder from './ClusterDetailAppLoadingPlaceholder';
import { filterUserInstalledApps, mapDefaultApps } from './utils';

const LOADING_COMPONENTS = new Array(6).fill(0);

function formatAppVersion(appMeta: AppConstants.IAppMetaApp) {
  const { version } = appMeta;

  // TODO(axbarsan): Handle K8s version EOL dates once available.

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
  flex-wrap: wrap;

  & > div {
    flex: 1 0 300px;
    margin-right: 15px;

    &:last-child {
      margin-right: 0px;
    }
  }
`;

// FIXME(axbarsan): Fetch cluster by ID in URL params once AWS has namespaced clusters.
interface IClusterDetailApps {
  releaseVersion: string;
}

const ClusterDetailApps: React.FC<IClusterDetailApps> = ({
  releaseVersion,
}) => {
  const { pathname } = useLocation();
  const { clusterId } = useParams<{ clusterId: string; orgId: string }>();

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appListClient = useRef(clientFactory());
  const appListGetOptions = { namespace: clusterId };
  const {
    data: appList,
    error: appListError,
    isValidating: appListIsValidating,
  } = useSWR<applicationv1alpha1.IAppList, GenericResponseError>(
    applicationv1alpha1.getAppListKey(appListGetOptions),
    () =>
      applicationv1alpha1.getAppList(
        appListClient.current,
        auth,
        appListGetOptions
      )
  );
  const appListIsLoading =
    typeof appList === 'undefined' && appListIsValidating;

  useEffect(() => {
    if (appListError) {
      ErrorReporter.getInstance().notify(appListError);
    }
  }, [appListError]);

  const [detailsModalIsVisible, setDetailsModalIsVisible] = useState(false);
  const [detailsModalAppName, setDetailsModalAppName] = useState('');

  const appToDisplay = useMemo(() => {
    return appList?.items.find(
      (app) => app.metadata.name === detailsModalAppName
    );
  }, [appList, detailsModalAppName]);

  useLayoutEffect(() => {
    if (!detailsModalIsVisible || appToDisplay) return;

    new FlashMessage(
      'The app you were looking at was deleted from the cluster by someone else.',
      messageType.ERROR,
      messageTTL.LONG
    );

    setDetailsModalIsVisible(false);
    setDetailsModalAppName('');
  }, [detailsModalIsVisible, appToDisplay]);

  const releaseClient = useRef(clientFactory());
  const {
    data: release,
    error: releaseError,
    isValidating: releaseIsValidating,
  } = useSWR<releasev1alpha1.IRelease, GenericResponseError>(
    releasev1alpha1.getReleaseKey(releaseVersion),
    () =>
      releasev1alpha1.getRelease(
        releaseClient.current,
        auth,
        `v${releaseVersion}`
      )
  );
  const releaseIsLoading =
    typeof release === 'undefined' && releaseIsValidating;

  useEffect(() => {
    if (releaseError) {
      ErrorReporter.getInstance().notify(releaseError);
    }
  }, [releaseError]);

  // This makes a list of apps that are installed as part of the cluster creation.
  // It combines information from the release endpoint with the latest info
  // coming from App CRs.
  const preInstalledApps = useMemo(() => mapDefaultApps(release), [release]);

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

  const provider = useSelector(getProvider);
  const hasOptionalIngress = supportsOptionalIngress(provider, releaseVersion);

  const userInstalledApps = useMemo(
    () => filterUserInstalledApps(appList?.items ?? [], hasOptionalIngress),
    [appList, hasOptionalIngress]
  );

  return (
    <DocumentTitle title={`Apps | ${clusterId}`}>
      <Breadcrumb
        data={{
          title: 'APPS',
          pathname,
        }}
      >
        <>
          <UserInstalledApps
            apps={userInstalledApps.map((a) => ({
              name: a.metadata.name,
              version: a.spec.version,
              deletionTimestamp: a.metadata.deletionTimestamp,
            }))}
            error={extractErrorMessage(appListError) ?? null}
            onShowDetail={showAppDetail}
          >
            <BrowseButtonContainer>
              <BrowseButton
                onClick={openAppCatalog}
                disabled={appListIsLoading}
                icon={<i className='fa fa-add-circle' />}
              >
                Install app
              </BrowseButton>
            </BrowseButtonContainer>

            <Box margin={{ top: 'large' }} direction='column' gap='small'>
              <ListAppsGuide namespace={clusterId} />
            </Box>
          </UserInstalledApps>

          <div>
            <h3>Preinstalled Apps</h3>
            <Disclaimer>
              These apps and services are preinstalled on your cluster and
              managed by Giant Swarm.
            </Disclaimer>

            <PreinstalledApps>
              <div key='essentials'>
                <SmallHeading>essentials</SmallHeading>
                {releaseIsLoading &&
                  LOADING_COMPONENTS.map((_, i) => (
                    <ClusterDetailAppLoadingPlaceholder
                      key={i}
                      margin={{ bottom: 'small' }}
                    />
                  ))}
                {!releaseIsLoading &&
                  Object.values(preInstalledApps.essentials).map((app) => (
                    <ClusterDetailPreinstalledApp
                      logoUrl={app.logoUrl}
                      name={app.name}
                      version={formatAppVersion(app)}
                      key={app.name}
                    />
                  ))}
              </div>

              <div key='management'>
                <SmallHeading>management</SmallHeading>
                {releaseIsLoading &&
                  LOADING_COMPONENTS.map((_, i) => (
                    <ClusterDetailAppLoadingPlaceholder
                      key={i}
                      margin={{ bottom: 'small' }}
                    />
                  ))}
                {!releaseIsLoading &&
                  Object.values(preInstalledApps.management).map((app) => (
                    <ClusterDetailPreinstalledApp
                      logoUrl={app.logoUrl}
                      name={app.name}
                      version={formatAppVersion(app)}
                      key={app.name}
                    />
                  ))}
              </div>

              <div key='ingress'>
                <SmallHeading>ingress</SmallHeading>
                {hasOptionalIngress &&
                  !releaseIsLoading &&
                  Object.values(preInstalledApps.ingress).length < 1 && (
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

                {releaseIsLoading &&
                  LOADING_COMPONENTS.map((_, i) => (
                    <ClusterDetailAppLoadingPlaceholder
                      key={i}
                      margin={{ bottom: 'small' }}
                    />
                  ))}

                {!releaseIsLoading &&
                  Object.values(preInstalledApps.ingress).map((app) => (
                    <ClusterDetailPreinstalledApp
                      logoUrl={app.logoUrl}
                      name={app.name}
                      version={formatAppVersion(app)}
                      key={app.name}
                    />
                  ))}
              </div>
            </PreinstalledApps>

            {typeof releaseError !== 'undefined' && !releaseIsLoading && (
              <FlashMessageComponent type={FlashMessageType.Danger}>
                Unable to load the list of preinstalled apps. Please try again
                later or contact support: support@giantswarm.io
              </FlashMessageComponent>
            )}
          </div>

          {appToDisplay && (
            <AppDetailsModalMAPI
              appName={appToDisplay.metadata.name}
              clusterName={clusterId}
              onClose={hideAppModal}
              visible={detailsModalIsVisible}
            />
          )}
        </>
      </Breadcrumb>
    </DocumentTitle>
  );
};

ClusterDetailApps.propTypes = {
  releaseVersion: PropTypes.string.isRequired,
};

export default ClusterDetailApps;
