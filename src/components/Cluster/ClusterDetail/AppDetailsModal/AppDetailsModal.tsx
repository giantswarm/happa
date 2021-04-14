import GenericModal from 'components/Modals/GenericModal';
import useError from 'lib/hooks/useError';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
} from 'stores/appcatalog/actions';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import { IState } from 'stores/state';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';

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

const AppDetailsModal: React.FC<IAppDetailsModalProps> = ({
  app,
  clusterId,
  onClose,
  visible,
}) => {
  const dispatch = useDispatch<IAsynchronousDispatch<IState>>();

  const catalog = useSelector<IState, IAppCatalog | undefined>(
    (state) => state.entities.catalogs.items[app.spec.catalog]
  );
  const isLoading = useSelector((state: IState) =>
    selectLoadingFlagByAction(state, updateAppAction().types.request)
  );
  const { errorMessage } = useError(updateClusterApp().types.error);

  const appName = app.metadata.name;
  const appVersions = catalog?.apps?.[app.spec.name];

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

  function showEditChartVersionPane(version: string) {
    setDesiredVersion(version);
    setPane(ModalPanes.EditChartVersion);
  }

  function handleClose() {
    showPane(ModalPanes.Initial)();
    onClose();
  }

  async function loadAppsAndClose() {
    handleClose();
    await dispatch(loadClusterApps({ clusterId: clusterId }));
  }

  async function editChartVersion() {
    const { error } = await dispatch(
      updateAppAction({ appName, clusterId, version: desiredVersion })
    );

    if (error) {
      return;
    }

    await loadAppsAndClose();
  }

  async function deleteAppConfig() {
    await dispatch(deleteAppConfigAction(appName, clusterId));
    await loadAppsAndClose();
  }

  async function deleteAppSecret() {
    await dispatch(deleteAppSecretAction(appName, clusterId));
    await loadAppsAndClose();
  }

  async function deleteApp() {
    await dispatch(deleteAppAction({ appName, clusterId }));
    await loadAppsAndClose();
  }

  async function createAppConfig(values: string, done: () => void) {
    try {
      await dispatch(createAppConfigAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
  }

  async function updateAppConfig(values: string, done: () => void) {
    try {
      await dispatch(updateAppConfigAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
  }

  async function createAppSecret(values: string, done: () => void) {
    try {
      await dispatch(createAppSecretAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
  }

  async function updateAppSecret(values: string, done: () => void) {
    try {
      await dispatch(updateAppSecretAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
  }

  switch (pane) {
    case ModalPanes.Initial:
      return (
        <GenericModal title={appName} onClose={handleClose} visible={visible}>
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
        </GenericModal>
      );

    case ModalPanes.EditChartVersion:
      return (
        <GenericModal
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
                loading={isLoading}
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
            errorMessage={errorMessage}
          />
        </GenericModal>
      );

    case ModalPanes.DeleteAppConfig:
      return (
        <GenericModal
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
  app: (PropTypes.object as PropTypes.Requireable<IInstalledApp>).isRequired,
  clusterId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

AppDetailsModal.defaultProps = {
  visible: false,
};

export default AppDetailsModal;
