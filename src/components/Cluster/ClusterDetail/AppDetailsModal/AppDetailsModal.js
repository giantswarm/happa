import {
  deleteApp as deleteAppAction,
  loadApps as loadAppsAction,
} from 'actions/appActions';
import {
  createAppConfig as createAppConfigAction,
  deleteAppConfig as deleteAppConfigAction,
  updateAppConfig as updateAppConfigAction,
} from 'actions/appConfigActions';
import {
  createAppSecret as createAppSecretAction,
  deleteAppSecret as deleteAppSecretAction,
  updateAppSecret as updateAppSecretAction,
} from 'actions/appSecretActions';
import GenericModal from 'components/Modals/GenericModal';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';

import DeleteConfirmFooter from './DeleteConfirmFooter';
import EditChartVersionPane from './EditChartVersionPane';
import InitialPane from './InitialPane';

const modalPanes = {
  deleteAppConfig: 'deleteAppConfig',
  deleteAppSecret: 'deleteAppSecret',
  deleteApp: 'deleteApp',
  editChartVersion: 'editChartVersion',
  initial: 'initial',
};

const AppDetailsModal = props => {
  const [pane, setPane] = useState(modalPanes.initial);

  if (!props.app) {
    return <span />;
  }

  const appName = props.app.metadata.name;
  const clusterId = props.clusterId;

  function showPane(paneToShow) {
    return function() {
      setPane(paneToShow);
    };
  }

  function onClose() {
    showPane(modalPanes.initial)();
    props.onClose();
  }

  async function loadAppsAndClose() {
    await props.dispatch(loadAppsAction(clusterId));
    onClose();
  }

  async function deleteAppConfig() {
    await props.dispatch(deleteAppConfigAction(appName, clusterId));
    await loadAppsAndClose();
  }

  async function deleteAppSecret() {
    await props.dispatch(deleteAppSecretAction(appName, clusterId));
    await loadAppsAndClose();
  }

  async function deleteApp() {
    await props.dispatch(deleteAppAction(appName, clusterId));
    await loadAppsAndClose();
  }

  async function createAppConfig(values, done) {
    await props.dispatch(createAppConfigAction(appName, clusterId, values));
    await loadAppsAndClose();
    done();
  }

  async function updateAppConfig(values, done) {
    await props.dispatch(updateAppConfigAction(appName, clusterId, values));
    await loadAppsAndClose();
    done();
  }

  async function createAppSecret(values, done) {
    await props.dispatch(createAppSecretAction(appName, clusterId, values));
    await loadAppsAndClose();
    done();
  }

  async function updateAppSecret(values, done) {
    await props.dispatch(updateAppSecretAction(appName, clusterId, values));
    await loadAppsAndClose();
    done();
  }

  function deleteConfirmFooter(cta, onConfirm) {
    return (
      <DeleteConfirmFooter
        cta={cta}
        onConfirm={onConfirm}
        onCancel={showPane(modalPanes.initial)}
      />
    );
  }

  let modalBody = '';
  let modalFooter = '';
  let modalTitle = '';

  switch (pane) {
    case modalPanes.initial:
      modalTitle = props.app.metadata.name;

      modalBody = (
        <InitialPane
          app={props.app}
          dispatchCreateAppConfig={createAppConfig}
          dispatchCreateAppSecret={createAppSecret}
          dispatchUpdateAppConfig={updateAppConfig}
          dispatchUpdateAppSecret={updateAppSecret}
          showDeleteAppConfigPane={showPane(modalPanes.deleteAppConfig)}
          showDeleteAppPane={showPane(modalPanes.deleteApp)}
          showDeleteAppSecretPane={showPane(modalPanes.deleteAppSecret)}
          showEditChartVersionPane={showPane(modalPanes.editChartVersion)}
        />
      );
      break;

    case modalPanes.editChartVersion:
      modalTitle = (
        <>
          Change Chart Version for {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />
        </>
      );

      modalBody = (
        <EditChartVersionPane
          onConfirm={() => {
            return 'todo';
          }}
        />
      );

      modalFooter = (
        <>
          <Button
            bsStyle='success'
            onClick={() => {
              return 'todo';
            }}
          >
            Update Chart Version
          </Button>
          <Button bsStyle='link' onClick={showPane(modalPanes.initial)}>
            Cancel
          </Button>
        </>
      );
      break;

    case modalPanes.deleteAppConfig:
      modalTitle = (
        <>
          Delete ConfigMap for {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />
        </>
      );

      modalBody = (
        <>
          Are you sure you want to delete the ConfigMap for{' '}
          {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />?
          <br />
          <br />
          There is no undo.
        </>
      );

      modalFooter = deleteConfirmFooter('Delete ConfigMap', deleteAppConfig);

      break;

    case modalPanes.deleteAppSecret:
      modalTitle = (
        <>
          Delete Secret for {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />
        </>
      );

      modalBody = (
        <>
          Are you sure you want to delete the Secret for{' '}
          {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />?
          <br />
          <br />
          There is no undo.
        </>
      );

      modalFooter = deleteConfirmFooter('Delete Secret', deleteAppSecret);

      break;

    case modalPanes.deleteApp:
      modalTitle = (
        <>
          Delete {props.app.metadata.name} on
          <ClusterIDLabel clusterID={props.clusterId} />
        </>
      );

      modalBody = (
        <>
          Are you sure you want to delete {props.app.metadata.name}&nbsp; on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />?
          <br />
          <br />
          There is no undo.
        </>
      );

      modalFooter = deleteConfirmFooter('Delete App', deleteApp);

      break;
  }

  return (
    <GenericModal
      footer={modalFooter}
      onClose={onClose}
      title={modalTitle}
      visible={props.visible}
      className='appdetails'
    >
      {modalBody}
    </GenericModal>
  );
};

AppDetailsModal.propTypes = {
  app: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

export default AppDetailsModal;
