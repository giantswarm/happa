import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import DeleteConfirmFooter from 'Cluster/ClusterDetail/AppDetailsModal/DeleteConfirmFooter';
import EditChartVersionPane from 'Cluster/ClusterDetail/AppDetailsModal/EditChartVersionPane';
import GenericModal from 'components/Modals/GenericModal';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as metav1 from 'model/services/mapi/metav1';
import PropTypes from 'prop-types';
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

import AppDetailsModalInitialPane from './AppDetailsModalInitialPane';

enum ModalPanes {
  Initial,
  DeleteAppConfig,
  DeleteAppSecret,
  DeleteApp,
  EditChartVersion,
}

interface IAppDetailsModalProps {
  appName: string;
  catalog: string;
  clusterId: string;
  onClose: () => void;
  visible?: boolean;
}

const AppDetailsModal: React.FC<IAppDetailsModalProps> = ({
  appName,
  catalog,
  clusterId,
  onClose,
  visible,
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appClient = useRef(clientFactory());
  const { data: app, error: appError } = useSWR<
    applicationv1alpha1.IApp,
    GenericResponse
  >(applicationv1alpha1.getAppKey(clusterId, appName), () =>
    applicationv1alpha1.getApp(appClient.current, auth, clusterId, appName)
  );

  useEffect(() => {
    if (
      metav1.isStatusError(
        appError?.data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      new FlashMessage(
        `App <code>${appName}</code> not found`,
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the app exists and that you have access to it.'
      );

      onClose();
    } else if (appError) {
      const message = extractErrorMessage(appError);

      new FlashMessage(
        `There was a problem loading app <code>${appName}</code>`,
        messageType.ERROR,
        messageTTL.FOREVER,
        message
      );

      if (!app) {
        onClose();
      }
    }
  }, [app, appError, appName, onClose]);

  const appCatalogEntryListClient = useRef(clientFactory());
  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = useMemo(() => {
    return {
      labelSelector: {
        matchingLabels: {
          [applicationv1alpha1.labelAppName]: appName,
          [applicationv1alpha1.labelAppCatalog]: catalog,
        },
      },
    };
  }, [appName, catalog]);
  const {
    data: appCatalogEntryList,
    isValidating: appCatalogEntryListIsValidating,
  } = useSWR<applicationv1alpha1.IAppCatalogEntryList, GenericResponse>(
    applicationv1alpha1.getAppCatalogEntryListKey(
      appCatalogEntryListGetOptions
    ),
    () =>
      applicationv1alpha1.getAppCatalogEntryList(
        appCatalogEntryListClient.current,
        auth,
        appCatalogEntryListGetOptions
      )
  );

  const [pane, setPane] = useState(ModalPanes.Initial);

  const [desiredVersion, setDesiredVersion] = useState('');
  useLayoutEffect(() => {
    // Set desired version once app is loaded.
    if (desiredVersion.length < 1 && app) {
      setDesiredVersion(app.spec.version);
    }
  }, [app, desiredVersion]);

  const [appUpdateIsLoading, setAppUpdateIsLoading] = useState(false);
  const [appUpdateError, setAppUpdateError] = useState('');

  function showPane(paneToShow: ModalPanes) {
    return () => {
      setAppUpdateError('');
      setPane(paneToShow);
    };
  }

  function showEditChartVersionPane(version?: string) {
    if (typeof version === 'undefined') return;

    setDesiredVersion(version);
    setPane(ModalPanes.EditChartVersion);
  }

  function handleClose() {
    showPane(ModalPanes.Initial)();
    onClose();
  }

  function editChartVersion() {
    // const { error } = await dispatch(
    //   updateAppAction({ appName, clusterId, version: desiredVersion })
    // );

    // if (error) {
    //   return;
    // }

    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    handleClose();
  }

  function deleteAppConfig() {
    // await dispatch(deleteAppConfigAction(appName, clusterId));
    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    handleClose();
  }

  function deleteAppSecret() {
    // await dispatch(deleteAppSecretAction(appName, clusterId));
    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    handleClose();
  }

  function deleteApp() {
    // await dispatch(deleteAppAction({ appName, clusterId }));
    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    handleClose();
  }

  function createAppConfig(_values: string, done: () => void) {
    // await dispatch(createAppConfigAction(appName, clusterId, values));
    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    done();
    handleClose();
  }

  function updateAppConfig(_values: string, done: () => void) {
    // await dispatch(updateAppConfigAction(appName, clusterId, values));
    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    done();
    handleClose();
  }

  function createAppSecret(_values: string, done: () => void) {
    // await dispatch(createAppSecretAction(appName, clusterId, values));
    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    done();
    handleClose();
  }

  function updateAppSecret(_values: string, done: () => void) {
    // await dispatch(updateAppSecretAction(appName, clusterId, values));
    // await dispatch(loadClusterApps({ clusterId: clusterId }));
    setAppUpdateIsLoading(true);
    setAppUpdateIsLoading(false);
    done();
    handleClose();
  }

  if (!app) {
    return null;
  }

  switch (pane) {
    case ModalPanes.Initial:
      return (
        <GenericModal
          aria-label='App details'
          title={appName}
          onClose={handleClose}
          visible={visible}
        >
          <AppDetailsModalInitialPane
            app={app}
            appCatalogEntries={appCatalogEntryList?.items}
            appCatalogEntriesIsLoading={
              typeof appCatalogEntryList === 'undefined' &&
              appCatalogEntryListIsValidating
            }
            dispatchCreateAppConfig={createAppConfig}
            dispatchCreateAppSecret={createAppSecret}
            dispatchUpdateAppConfig={updateAppConfig}
            dispatchUpdateAppSecret={updateAppSecret}
            showDeleteAppConfigPane={showPane(ModalPanes.DeleteAppConfig)}
            showDeleteAppPane={showPane(ModalPanes.DeleteApp)}
            showDeleteAppSecretPane={showPane(ModalPanes.DeleteAppSecret)}
            showEditChartVersionPane={showEditChartVersionPane}
          />
        </GenericModal>
      );

    case ModalPanes.EditChartVersion:
      return (
        <GenericModal
          aria-label='App details - Edit chart version'
          title={
            <>
              Change Chart Version for {appName} on{' '}
              <ClusterIDLabel clusterID={clusterId} />
            </>
          }
          footer={
            <>
              <Button
                bsStyle='primary'
                onClick={editChartVersion}
                loading={appUpdateIsLoading}
              >
                Update Chart Version
              </Button>
              <Button bsStyle='link' onClick={showPane(ModalPanes.Initial)}>
                Cancel
              </Button>
            </>
          }
          onClose={handleClose}
          visible={visible}
        >
          <EditChartVersionPane
            currentVersion={app.spec.version}
            desiredVersion={desiredVersion}
            errorMessage={appUpdateError}
          />
        </GenericModal>
      );

    case ModalPanes.DeleteAppConfig:
      return (
        <GenericModal
          aria-label='App details - Delete app config'
          title={
            <>
              Delete user level config values for {appName} on{' '}
              <ClusterIDLabel clusterID={clusterId} />
            </>
          }
          footer={
            <DeleteConfirmFooter
              cta='Delete user level config values'
              onConfirm={deleteAppConfig}
              onCancel={showPane(ModalPanes.Initial)}
            />
          }
          onClose={handleClose}
          visible={visible}
        >
          <>
            Are you sure you want to delete user level config values for{' '}
            {appName} on <ClusterIDLabel clusterID={clusterId} />?
            <br />
            <br />
            There is no undo.
          </>
        </GenericModal>
      );

    case ModalPanes.DeleteAppSecret:
      return (
        <GenericModal
          aria-label='App details - Delete app secret'
          title={
            <>
              Delete user level secret values for {appName} on{' '}
              <ClusterIDLabel clusterID={clusterId} />
            </>
          }
          footer={
            <DeleteConfirmFooter
              cta='Delete user level secret values'
              onConfirm={deleteAppSecret}
              onCancel={showPane(ModalPanes.Initial)}
            />
          }
          onClose={handleClose}
          visible={visible}
        >
          <>
            Are you sure you want to delete user level secret values for{' '}
            {appName} on <ClusterIDLabel clusterID={clusterId} />?
            <br />
            <br />
            There is no undo.
          </>
        </GenericModal>
      );

    case ModalPanes.DeleteApp:
      return (
        <GenericModal
          aria-label='App details - Delete app'
          title={
            <>
              Delete {appName} on
              <ClusterIDLabel clusterID={clusterId} />
            </>
          }
          footer={
            <DeleteConfirmFooter
              cta='Delete App'
              onConfirm={deleteApp}
              onCancel={showPane(ModalPanes.Initial)}
            />
          }
          onClose={handleClose}
          visible={visible}
        >
          <>
            Are you sure you want to delete {appName}&nbsp; on{' '}
            <ClusterIDLabel clusterID={clusterId} />?
            <br />
            <br />
            There is no undo.
          </>
        </GenericModal>
      );

    default:
      return null;
  }
};

AppDetailsModal.propTypes = {
  appName: PropTypes.string.isRequired,
  catalog: PropTypes.string.isRequired,
  clusterId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

AppDetailsModal.defaultProps = {
  visible: false,
};

export default AppDetailsModal;
