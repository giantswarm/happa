import {
  CLUSTER_UPDATE_APP_ERROR,
  CLUSTER_UPDATE_APP_REQUEST,
} from 'actions/actionTypes.js';
import {
  deleteApp as deleteAppAction,
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
import { useError } from 'hooks/errors';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { selectLoadingFlagByAction } from 'selectors/clusterSelectors';
import { loadClusterApps } from 'stores/clusterapps/actions';
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

const AppDetailsModal = (props) => {
  const [pane, setPane] = useState(modalPanes.initial);
  const [desiredVersion, setDesiredVersion] = useState(props.app.spec.version);
  const { clear: clearUpdateAppError } = useError(CLUSTER_UPDATE_APP_ERROR);

  const { app, catalog, dispatch } = props;

  useEffect(() => {
    if (catalog && !catalog.apps) {
      dispatch(catalogLoadIndex(catalog));
    }
  }, [catalog, app, dispatch]);

  if (!props.app) {
    return <span />;
  }

  const appName = props.app.metadata.name;
  const clusterId = props.clusterId;

  function showPane(paneToShow) {
    return function () {
      clearUpdateAppError();
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
    await props.dispatch(loadClusterApps({ clusterId: clusterId }));
  }

  async function editChartVersion() {
    const changes = { spec: { version: desiredVersion } };
    const { error } = await props.dispatch(
      updateAppAction(appName, clusterId, changes)
    );

    if (error) {
      return;
    }

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
    try {
      await props.dispatch(createAppConfigAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
  }

  async function updateAppConfig(values, done) {
    try {
      await props.dispatch(updateAppConfigAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
  }

  async function createAppSecret(values, done) {
    try {
      await props.dispatch(createAppSecretAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
  }

  async function updateAppSecret(values, done) {
    try {
      await props.dispatch(updateAppSecretAction(appName, clusterId, values));
      await loadAppsAndClose();
    } finally {
      done();
    }
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
          catalogNotFound={!props.catalog}
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
          <Button
            bsStyle='success'
            onClick={editChartVersion}
            loading={props.clusterUpdateRequestPending}
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
          Delete user level config values for {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />
        </>
      );

      modalBody = (
        <>
          Are you sure you want to delete user level config values for{' '}
          {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />?
          <br />
          <br />
          There is no undo.
        </>
      );

      modalFooter = deleteConfirmFooter(
        'Delete user level config values',
        deleteAppConfig
      );

      break;

    case modalPanes.deleteAppSecret:
      modalTitle = (
        <>
          Delete user level secret values for {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />
        </>
      );

      modalBody = (
        <>
          Are you sure you want to delete user level secret values for{' '}
          {props.app.metadata.name} on{' '}
          <ClusterIDLabel clusterID={props.clusterId} />?
          <br />
          <br />
          There is no undo.
        </>
      );

      modalFooter = deleteConfirmFooter(
        'Delete user level secret values',
        deleteAppSecret
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
  clusterUpdateRequestPending: PropTypes.bool,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

function mapStateToProps(state, ownProps) {
  return {
    clusterUpdateRequestPending: selectLoadingFlagByAction(
      state,
      CLUSTER_UPDATE_APP_REQUEST
    ),
    catalog: state.entities.catalogs?.items[ownProps.app.spec.catalog],
    appVersions:
      state.entities.catalogs?.items[ownProps.app.spec.catalog]?.apps?.[
        ownProps.app.spec.name
      ],
  };
}

export default connect(mapStateToProps)(AppDetailsModal);
