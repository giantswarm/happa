import {
  deleteApp as deleteAppAction,
  loadApps as loadAppsAction,
  updateApp as updateAppAction,
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
import { catalogLoadIndex } from 'actions/catalogActions';
import GenericModal from 'components/Modals/GenericModal';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
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
  const [desiredVersion, setDesiredVersion] = useState(props.app.spec.version);

  const { app, catalog, dispatch } = props;

  useEffect(() => {
    if (!catalog.apps) {
      dispatch(catalogLoadIndex(catalog));
    }
  }, [catalog, app, dispatch]);

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

  function showEditChartVersionPane(version) {
    setDesiredVersion(version);
    setPane(modalPanes.editChartVersion);
  }

  function onClose() {
    showPane(modalPanes.initial)();
    props.onClose();
  }

  async function loadAppsAndClose() {
    onClose();
    await props.dispatch(loadAppsAction(clusterId));
  }

  async function editChartVersion() {
    await props.dispatch(
      updateAppAction(appName, clusterId, { spec: { version: desiredVersion } })
    );
    await loadAppsAndClose();
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

  // eslint-disable-next-line react/no-multi-comp
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
          appVersions={props.appVersions}
          dispatchCreateAppConfig={createAppConfig}
          dispatchCreateAppSecret={createAppSecret}
          dispatchUpdateAppConfig={updateAppConfig}
          dispatchUpdateAppSecret={updateAppSecret}
          showDeleteAppConfigPane={showPane(modalPanes.deleteAppConfig)}
          showDeleteAppPane={showPane(modalPanes.deleteApp)}
          showDeleteAppSecretPane={showPane(modalPanes.deleteAppSecret)}
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
          currentVersion={props.app.spec.version}
          desiredVersion={desiredVersion}
        />
      );

      modalFooter = (
        <>
          <Button bsStyle='success' onClick={editChartVersion}>
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
  appVersions: PropTypes.array,
  catalog: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

function mapStateToProps(state, ownProps) {
  return {
    catalog: state.entities.catalogs?.items[ownProps.app.spec.catalog],
    appVersions:
      state.entities.catalogs?.items[ownProps.app.spec.catalog].apps?.[
        ownProps.app.spec.name
      ],
  };
}

export default connect(mapStateToProps)(AppDetailsModal);
