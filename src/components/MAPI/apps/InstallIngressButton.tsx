import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { extractErrorMessage } from 'MAPI/organizations/AccessControl/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Constants } from 'shared/constants';
import { AppsRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

import {
  createIngressApp,
  findIngressApp,
  getIngressAppCatalogEntry,
  getIngressAppCatalogEntryKey,
} from './utils';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.darkBlueLighter1};
  border-radius: ${({ theme }) => theme.border_radius};
  padding: ${({ theme }) => theme.spacingPx * 5}px;
  height: 90px;
`;

const Text = styled.span`
  margin-left: ${({ theme }) => theme.spacingPx * 2}px;
`;

const StyledLink = styled(Link)`
  text-decoration: underline;
`;

interface IInstallIngressButtonProps
  extends React.ComponentPropsWithoutRef<'div'> {
  clusterID: string;
}

const InstallIngressButton: React.FC<IInstallIngressButtonProps> = ({
  clusterID,
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appListClient = useRef(clientFactory());
  const appListGetOptions = { namespace: clusterID };
  const {
    data: appList,
    isValidating: appListIsValidating,
    mutate: mutateAppList,
  } = useSWR<applicationv1alpha1.IAppList, GenericResponse>(
    applicationv1alpha1.getAppListKey(appListGetOptions),
    () =>
      applicationv1alpha1.getAppList(
        appListClient.current,
        auth,
        appListGetOptions
      )
  );

  // TODO(axbarsan): Handle app list error.

  const installedIngressApp = useMemo(() => findIngressApp(appList?.items), [
    appList?.items,
  ]);

  const appCatalogEntryClient = useRef(clientFactory());
  const {
    data: ingressAppToInstall,
    isValidating: ingressAppToInstallIsValidating,
  } = useSWR<applicationv1alpha1.IAppCatalogEntry | null, GenericResponse>(
    getIngressAppCatalogEntryKey(appList?.items),
    () => getIngressAppCatalogEntry(appCatalogEntryClient.current, auth)
  );

  // TODO(axbarsan): Handle app entry error.

  const [isInstalling, setIsInstalling] = useState(false);

  const isLoading =
    isInstalling ||
    (typeof appList === 'undefined' && appListIsValidating) ||
    (typeof ingressAppToInstall === 'undefined' &&
      ingressAppToInstallIsValidating);

  const handleClick = async () => {
    if (!ingressAppToInstall) return Promise.resolve();

    try {
      setIsInstalling(true);

      await createIngressApp(
        clientFactory,
        auth,
        clusterID,
        ingressAppToInstall
      );

      mutateAppList();

      setIsInstalling(false);
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'Something went wrong while trying to install the ingress controller app.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      setIsInstalling(false);
    }

    return Promise.resolve();
  };

  const appDetailPath = useMemo(() => {
    if (installedIngressApp) {
      return RoutePath.createUsablePath(AppsRoutes.AppDetail, {
        catalogName: Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME,
        app: installedIngressApp.spec.name,
        version: installedIngressApp.spec.version,
      });
    } else if (ingressAppToInstall) {
      return RoutePath.createUsablePath(AppsRoutes.AppDetail, {
        catalogName: Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME,
        app: ingressAppToInstall.spec.appName,
        version: ingressAppToInstall.spec.version,
      });
    }

    return '';
  }, [installedIngressApp, ingressAppToInstall]);

  return (
    <Wrapper>
      {!installedIngressApp && (
        <Button
          loading={isLoading}
          bsStyle='primary'
          loadingTimeout={0}
          onClick={handleClick}
        >
          Install Ingress Controller
        </Button>
      )}

      {installedIngressApp && (
        <Text>
          🎉 Ingress controller installed. Please continue to the next step.
        </Text>
      )}

      {ingressAppToInstall && (
        <Text>
          This will install the{' '}
          <StyledLink to={appDetailPath} href={appDetailPath}>
            NGINX Ingress Controller app {ingressAppToInstall.spec.version}
          </StyledLink>{' '}
          on cluster <ClusterIDLabel clusterID={clusterID} />
        </Text>
      )}
    </Wrapper>
  );
};

InstallIngressButton.propTypes = {
  clusterID: PropTypes.string.isRequired,
};

export default InstallIngressButton;
