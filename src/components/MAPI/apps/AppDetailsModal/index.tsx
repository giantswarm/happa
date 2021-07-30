import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import DeleteConfirmFooter from 'Cluster/ClusterDetail/AppDetailsModal/DeleteConfirmFooter';
import EditChartVersionPane from 'Cluster/ClusterDetail/AppDetailsModal/EditChartVersionPane';
import GenericModal from 'components/Modals/GenericModal';
import yaml from 'js-yaml';
import ErrorReporter from 'lib/errors/ErrorReporter';
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
import useSWR, { mutate } from 'swr';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

import {
  deleteAppWithName,
  deleteConfigMapForApp,
  deleteSecretForApp,
  ensureConfigMapForApp,
  ensureSecretForApp,
  updateAppVersion,
} from '../utils';
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
  clusterName: string;
  onClose: () => void;
  visible?: boolean;
}

const AppDetailsModal: React.FC<IAppDetailsModalProps> = ({
  appName,
  clusterName,
  onClose,
  visible,
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appClient = useRef(clientFactory());
  const { data: app, error: appError, mutate: mutateApp } = useSWR<
    applicationv1alpha1.IApp,
    GenericResponse
  >(applicationv1alpha1.getAppKey(clusterName, appName), () =>
    applicationv1alpha1.getApp(appClient.current, auth, clusterName, appName)
  );

  useEffect(() => {
    if (appError) {
      ErrorReporter.getInstance().notify(appError);
    }

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
    if (!app) return {};

    return {
      labelSelector: {
        matchingLabels: {
          [applicationv1alpha1.labelAppName]: app.spec.name,
          [applicationv1alpha1.labelAppCatalog]: app.spec.catalog,
        },
      },
    };
  }, [app]);
  const appCatalogEntryListKey = useMemo(() => {
    if (!app) return null;

    return applicationv1alpha1.getAppCatalogEntryListKey(
      appCatalogEntryListGetOptions
    );
  }, [app, appCatalogEntryListGetOptions]);

  const {
    data: appCatalogEntryList,
    error: appCatalogEntryListError,
    isValidating: appCatalogEntryListIsValidating,
  } = useSWR<applicationv1alpha1.IAppCatalogEntryList, GenericResponse>(
    appCatalogEntryListKey,
    () =>
      applicationv1alpha1.getAppCatalogEntryList(
        appCatalogEntryListClient.current,
        auth,
        appCatalogEntryListGetOptions
      )
  );

  useEffect(() => {
    if (appCatalogEntryListError) {
      ErrorReporter.getInstance().notify(appCatalogEntryListError);
    }
  }, [appCatalogEntryListError]);

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

  async function editChartVersion() {
    try {
      setAppUpdateIsLoading(true);

      const updatedApp = await updateAppVersion(
        clientFactory(),
        auth,
        clusterName,
        appName,
        desiredVersion
      );

      mutateApp(updatedApp);
      mutate(applicationv1alpha1.getAppListKey({ namespace: clusterName }));

      setAppUpdateIsLoading(false);
      handleClose();

      new FlashMessage(
        `App <code>${appName}</code> on <code>${clusterName}</code> has been updated. Changes might take some time to take effect.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      setAppUpdateIsLoading(false);

      const errorMessage = extractErrorMessage(err);
      setAppUpdateError(errorMessage);

      ErrorReporter.getInstance().notify(err);
    }
  }

  async function deleteAppConfig() {
    try {
      const updatedApp = await deleteConfigMapForApp(
        clientFactory(),
        auth,
        clusterName,
        appName
      );

      mutateApp(updatedApp);

      handleClose();

      new FlashMessage(
        `The ConfigMap containing user level config values for <code>${appName}</code> on <code>${clusterName}</code> has been deleted.`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'Something went wrong while trying to delete the ConfigMap containing your values.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  }

  async function deleteAppSecret() {
    try {
      const updatedApp = await deleteSecretForApp(
        clientFactory(),
        auth,
        clusterName,
        appName
      );

      mutateApp(updatedApp);

      handleClose();

      new FlashMessage(
        `The Secret containing user level secret values for <code>${appName}</code> on <code>${clusterName}</code> has been deleted.`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'Something went wrong while trying to delete the Secret containing your values.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  }

  async function deleteApp() {
    try {
      await deleteAppWithName(clientFactory(), auth, clusterName, appName);

      mutate(applicationv1alpha1.getAppListKey({ namespace: clusterName }));
      handleClose();

      new FlashMessage(
        `App <code>${appName}</code> was scheduled for deletion on <code>${clusterName}</code>. This may take a couple of minutes.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `Something went wrong while trying to delete your app.`,
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  }

  async function createAppConfig(values: string, done: () => void) {
    try {
      const contents = yaml.dump(values);
      const updatedApp = await ensureConfigMapForApp(
        clientFactory(),
        auth,
        clusterName,
        appName,
        contents
      );

      if (updatedApp) {
        mutateApp(updatedApp);
      }

      done();
      handleClose();

      new FlashMessage(
        `A ConfigMap containing user level config values for <code>${appName}</code> on <code>${clusterName}</code> has successfully been created.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      done();

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'Something went wrong while trying to create a ConfigMap to store your values.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  }

  async function updateAppConfig(values: string, done: () => void) {
    try {
      const contents = yaml.dump(values);
      const updatedApp = await ensureConfigMapForApp(
        clientFactory(),
        auth,
        clusterName,
        appName,
        contents
      );

      if (updatedApp) {
        mutateApp(updatedApp);
      }

      done();
      handleClose();

      new FlashMessage(
        `The ConfigMap containing the user level config values of <code>${appName}</code> on <code>${clusterName}</code> has successfully been updated.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      done();

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'Something went wrong while trying to update the ConfigMap containing user level config values.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  }

  async function createAppSecret(values: string, done: () => void) {
    try {
      const contents = yaml.dump(values);
      const updatedApp = await ensureSecretForApp(
        clientFactory(),
        auth,
        clusterName,
        appName,
        contents
      );

      if (updatedApp) {
        mutateApp(updatedApp);
      }

      done();
      handleClose();

      new FlashMessage(
        `The Secret containing the user level secret values of <code>${appName}</code> on <code>${clusterName}</code> has successfully been updated.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      done();

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'Something went wrong while trying to create a Secret to store your values.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  }

  async function updateAppSecret(values: string, done: () => void) {
    try {
      const contents = yaml.dump(values);
      const updatedApp = await ensureSecretForApp(
        clientFactory(),
        auth,
        clusterName,
        appName,
        contents
      );

      if (updatedApp) {
        mutateApp(updatedApp);
      }

      done();
      handleClose();

      new FlashMessage(
        `The Secret containing the user level secret values of <code>${appName}</code> on <code>${clusterName}</code> has successfully been updated.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      done();

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        'Something went wrong while trying to update the Secret containing user level secret values.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
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
              <ClusterIDLabel clusterID={clusterName} />
            </>
          }
          footer={
            <>
              <Button
                bsStyle='primary'
                onClick={editChartVersion}
                loading={appUpdateIsLoading}
              >
                Update chart version
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
              <ClusterIDLabel clusterID={clusterName} />
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
            {appName} on <ClusterIDLabel clusterID={clusterName} />?
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
              <ClusterIDLabel clusterID={clusterName} />
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
            {appName} on <ClusterIDLabel clusterID={clusterName} />?
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
              Delete {appName} on <ClusterIDLabel clusterID={clusterName} />
            </>
          }
          footer={
            <DeleteConfirmFooter
              cta='Delete app'
              onConfirm={deleteApp}
              onCancel={showPane(ModalPanes.Initial)}
            />
          }
          onClose={handleClose}
          visible={visible}
        >
          <>
            Are you sure you want to delete {appName}&nbsp; on{' '}
            <ClusterIDLabel clusterID={clusterName} />?
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
  clusterName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

AppDetailsModal.defaultProps = {
  visible: false,
};

export default AppDetailsModal;
