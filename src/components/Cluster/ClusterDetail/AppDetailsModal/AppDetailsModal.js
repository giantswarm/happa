import { deleteApp, loadApps } from 'actions/appActions';
import {
  createAppConfig,
  deleteAppConfig,
  updateAppConfig,
} from 'actions/appConfigActions';
import {
  createAppSecret,
  deleteAppSecret,
  updateAppSecret,
} from 'actions/appSecretActions';
import GenericModal from 'components/Modals/GenericModal';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';

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

  function showDeleteAppConfigPane() {
    setPane(modalPanes.deleteAppConfig);
  }

  function showDeleteAppSecretPane() {
    setPane(modalPanes.deleteAppSecret);
  }

  function showDeleteAppPane() {
    setPane(modalPanes.deleteApp);
  }

  function showInitialPane() {
    setPane(modalPanes.initial);
  }

  function showEditChartVersionPane() {
    setPane(modalPanes.editChartVersion);
  }

  function onClose() {
    showInitialPane();
    props.onClose();
  }

  async function loadAppsAndClose() {
    await props.dispatch(loadApps(props.clusterId));
    onClose();
  }

  async function dispatchDeleteAppConfig() {
    await props.dispatch(
      deleteAppConfig(props.app.metadata.name, props.clusterId)
    );
    await loadAppsAndClose();
  }

  async function dispatchDeleteAppSecret() {
    await props.dispatch(
      deleteAppSecret(props.app.metadata.name, props.clusterId)
    );
    await loadAppsAndClose();
  }

  async function dispatchDeleteApp() {
    await props.dispatch(deleteApp(props.app.metadata.name, props.clusterId));
    await loadAppsAndClose();
  }

  async function dispatchCreateAppConfig(values, done) {
    await props.dispatch(
      createAppConfig(props.app.metadata.name, props.clusterId, values)
    );
    await loadAppsAndClose();
    done();
  }

  async function dispatchUpdateAppConfig(values, done) {
    await props.dispatch(
      updateAppConfig(props.app.metadata.name, props.clusterId, values)
    );
    await loadAppsAndClose();
    done();
  }

  async function dispatchCreateAppSecret(values, done) {
    await props.dispatch(
      createAppSecret(props.app.metadata.name, props.clusterId, values)
    );
    await loadAppsAndClose();
    done();
  }

  async function dispatchUpdateAppSecret(values, done) {
    await props.dispatch(
      updateAppSecret(props.app.metadata.name, props.clusterId, values)
    );
    await loadAppsAndClose();
    done();
  }

  if (props.app === null || typeof props.app === 'undefined') {
    return <span />;
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
          dispatchCreateAppConfig={dispatchCreateAppConfig}
          dispatchCreateAppSecret={dispatchCreateAppSecret}
          dispatchUpdateAppConfig={dispatchUpdateAppConfig}
          dispatchUpdateAppSecret={dispatchUpdateAppSecret}
          showDeleteAppConfigPane={showDeleteAppConfigPane}
          showDeleteAppPane={showDeleteAppPane}
          showDeleteAppSecretPane={showDeleteAppSecretPane}
          showEditChartVersionPane={showEditChartVersionPane}
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
          <Button bsStyle='link' onClick={showInitialPane}>
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

      modalFooter = (
        <>
          <Button bsStyle='danger' onClick={dispatchDeleteAppConfig}>
            <i className='fa fa-delete' />
            Delete ConfigMap
          </Button>
          <Button bsStyle='link' onClick={showInitialPane}>
            Cancel
          </Button>
        </>
      );

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

      modalFooter = (
        <>
          <Button bsStyle='danger' onClick={dispatchDeleteAppSecret}>
            <i className='fa fa-delete' />
            Delete Secret
          </Button>
          <Button bsStyle='link' onClick={showInitialPane}>
            Cancel
          </Button>
        </>
      );

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

      modalFooter = (
        <>
          <Button bsStyle='danger' onClick={dispatchDeleteApp}>
            <i className='fa fa-delete' />
            Delete App
          </Button>
          <Button bsStyle='link' onClick={showInitialPane}>
            Cancel
          </Button>
        </>
      );

      break;
  }

  return (
    <GenericModal
      footer={modalFooter}
      onClose={props.onClose}
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
