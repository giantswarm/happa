import {
  catalogLoadIndex,
  createAppConfig as createAppConfigAction,
  createAppSecret as createAppSecretAction,
  deleteAppConfig as deleteAppConfigAction,
  deleteAppSecret as deleteAppSecretAction,
  deleteClusterApp as deleteAppAction,
  loadClusterApps,
  updateAppConfig as updateAppConfigAction,
  updateAppSecret as updateAppSecretAction,
  updateClusterApp as updateAppAction,
  updateClusterApp,
} from 'model/stores/appcatalog/actions';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import { selectLoadingFlagByAction } from 'model/stores/loading/selectors';
import { IState } from 'model/stores/state';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import Modal from 'UI/Layout/Modal';
import ErrorReporter from 'utils/errors/ErrorReporter';
import useError from 'utils/hooks/useError';

import DeleteConfirmFooter from './DeleteConfirmFooter';
import EditChartVersionPane from './EditChartVersionPane';
import InitialPane from './InitialPane';

enum ModalPanes {
  Initial,
  DeleteAppConfig,
  DeleteAppSecret,
  DeleteApp,
  EditChartVersion,
}

interface IAppDetailsModalProps {
  app: IInstalledApp;
  clusterId: string;
  onClose: () => void;
  visible?: boolean;
}

const AppDetailsModal: React.FC<
  React.PropsWithChildren<IAppDetailsModalProps>
> = ({ app, clusterId, onClose, visible }) => {
  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  const catalog = useSelector<IState, IAppCatalog | undefined>(
    (state) => state.entities.catalogs.items[app.spec.catalog]
  );
  const isLoading = useSelector((state: IState) =>
    selectLoadingFlagByAction(state, updateAppAction().types.request)
  );
  const { errorMessage } = useError(updateClusterApp().types.error);

  const appName = app.metadata.name;
  const appVersions = catalog?.apps?.[app.spec.name] ?? [];

  const [pane, setPane] = useState(ModalPanes.Initial);
  const [desiredVersion, setDesiredVersion] = useState(app.spec.version);
  const { clear: clearUpdateAppError } = useError(
    updateAppAction().types.error
  );

  useEffect(() => {
    if (catalog && !catalog.apps) {
      dispatch(catalogLoadIndex(catalog.metadata.name));
    }
  }, [catalog, app, dispatch]);

  function showPane(paneToShow: ModalPanes) {
    return () => {
      clearUpdateAppError();
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
      const { error } = await dispatch(
        updateAppAction({ appName, clusterId, version: desiredVersion })
      );

      if (error) {
        ErrorReporter.getInstance().notify(new Error(error));

        return;
      }

      await dispatch(loadClusterApps({ clusterId: clusterId }));
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function deleteAppConfig() {
    try {
      await dispatch(deleteAppConfigAction(appName, clusterId));
      await dispatch(loadClusterApps({ clusterId: clusterId }));
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function deleteAppSecret() {
    try {
      await dispatch(deleteAppSecretAction(appName, clusterId));
      await dispatch(loadClusterApps({ clusterId: clusterId }));
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function deleteApp() {
    try {
      await dispatch(deleteAppAction({ appName, clusterId }));
      await dispatch(loadClusterApps({ clusterId: clusterId }));
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function createAppConfig(values: string, done: () => void) {
    try {
      await dispatch(createAppConfigAction(appName, clusterId, values));
      await dispatch(loadClusterApps({ clusterId: clusterId }));
      done();
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function updateAppConfig(values: string, done: () => void) {
    try {
      await dispatch(updateAppConfigAction(appName, clusterId, values));
      await dispatch(loadClusterApps({ clusterId: clusterId }));
      done();
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function createAppSecret(values: string, done: () => void) {
    try {
      await dispatch(createAppSecretAction(appName, clusterId, values));
      await dispatch(loadClusterApps({ clusterId: clusterId }));
      done();
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function updateAppSecret(values: string, done: () => void) {
    try {
      await dispatch(updateAppSecretAction(appName, clusterId, values));
      await dispatch(loadClusterApps({ clusterId: clusterId }));
      done();
      handleClose();
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  switch (pane) {
    case ModalPanes.Initial:
      return (
        <Modal
          aria-label='App details'
          title={appName}
          onClose={handleClose}
          visible={visible}
        >
          <InitialPane
            app={app}
            catalogNotFound={!catalog}
            appVersions={appVersions}
            dispatchCreateAppConfig={createAppConfig}
            dispatchCreateAppSecret={createAppSecret}
            dispatchUpdateAppConfig={updateAppConfig}
            dispatchUpdateAppSecret={updateAppSecret}
            showDeleteAppConfigPane={showPane(ModalPanes.DeleteAppConfig)}
            showDeleteAppPane={showPane(ModalPanes.DeleteApp)}
            showDeleteAppSecretPane={showPane(ModalPanes.DeleteAppSecret)}
            showEditChartVersionPane={showEditChartVersionPane}
          />
        </Modal>
      );

    case ModalPanes.EditChartVersion:
      return (
        <Modal
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
                primary={true}
                onClick={editChartVersion}
                loading={isLoading}
              >
                Update chart version
              </Button>
              <Button link={true} onClick={showPane(ModalPanes.Initial)}>
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
            errorMessage={errorMessage}
          />
        </Modal>
      );

    case ModalPanes.DeleteAppConfig:
      return (
        <Modal
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
        </Modal>
      );

    case ModalPanes.DeleteAppSecret:
      return (
        <Modal
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
        </Modal>
      );

    case ModalPanes.DeleteApp:
      return (
        <Modal
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
        </Modal>
      );

    default:
      return null;
  }
};

AppDetailsModal.defaultProps = {
  visible: false,
};

export default AppDetailsModal;
