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

  function dispatchDeleteAppConfig(app, clusterId, dispatch, closeModal) {
    return dispatch(deleteAppConfig(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        closeModal();
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  function dispatchDeleteAppSecret(app, clusterId, dispatch, closeModal) {
    return dispatch(deleteAppSecret(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        closeModal();
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  function dispatchDeleteApp(app, clusterId, dispatch, closeModal) {
    return dispatch(deleteApp(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        closeModal();
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  // dispatchCreateAppConfig creates an app configmap.
  // YAMLFileUpload takes a curried version of this function
  // since it wants a callback with one argument for the parsed YAML result.
  function dispatchCreateAppConfig(
    appName,
    clusterId,
    dispatch,
    closeModal,
    values,
    done
  ) {
    return dispatch(createAppConfig(appName, clusterId, values))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        done();
        closeModal();
      })
      .catch(e => {
        done();

        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  // dispatchUpdateAppConfig updates an app configmap.
  // YAMLFileUpload takes a curried version of this function
  // since it wants a callback with one argument for the parsed YAML result.
  function dispatchUpdateAppConfig(
    appName,
    clusterId,
    dispatch,
    closeModal,
    values,
    done
  ) {
    return dispatch(updateAppConfig(appName, clusterId, values))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        done();
        closeModal();
      })
      .catch(e => {
        done();

        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  // dispatchCreateAppSecret creates an app secret.
  // YAMLFileUpload takes a curried version of this function
  // since it wants a callback with one argument for the parsed YAML result.
  function dispatchCreateAppSecret(
    appName,
    clusterId,
    dispatch,
    closeModal,
    values,
    done
  ) {
    return dispatch(createAppSecret(appName, clusterId, values))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        done();
        closeModal();
      })
      .catch(e => {
        done();

        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  // dispatchUpdateAppSecret updates an app secret.
  // YAMLFileUpload takes a curried version of this function
  // since it wants a callback with one argument for the parsed YAML result.
  function dispatchUpdateAppSecret(
    appName,
    clusterId,
    dispatch,
    closeModal,
    values,
    done
  ) {
    return dispatch(updateAppSecret(appName, clusterId, values))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        done();
        closeModal();
      })
      .catch(e => {
        done();

        // eslint-disable-next-line no-console
        console.error(e);
      });
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
          clusterId={props.clusterId}
          dispatch={props.dispatch}
          showDeleteAppSecretPane={showDeleteAppSecretPane}
          showDeleteAppConfigPane={showDeleteAppConfigPane}
          showDeleteAppPane={showDeleteAppPane}
          showEditChartVersionPane={showEditChartVersionPane}
          dispatchCreateAppConfig={dispatchCreateAppConfig}
          dispatchUpdateAppConfig={dispatchUpdateAppConfig}
          dispatchCreateAppSecret={dispatchCreateAppSecret}
          dispatchUpdateAppSecret={dispatchUpdateAppSecret}
          visible={props.visible}
          onClose={onClose}
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
          key='pane'
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
          <Button
            bsStyle='danger'
            onClick={dispatchDeleteAppConfig.bind(
              undefined,
              props.app,
              props.clusterId,
              props.dispatch,
              onClose
            )}
          >
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
          <Button
            bsStyle='danger'
            onClick={dispatchDeleteAppSecret.bind(
              undefined,
              props.app,
              props.clusterId,
              props.dispatch,
              onClose
            )}
          >
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
          <Button
            bsStyle='danger'
            onClick={dispatchDeleteApp.bind(
              undefined,
              props.app,
              props.clusterId,
              props.dispatch,
              onClose
            )}
          >
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
