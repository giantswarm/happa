import { clusterDeleteApp, clusterLoadApps } from 'actions/clusterActions';
import {
  createAppConfig,
  deleteAppConfig,
  updateAppConfig,
} from 'actions/appConfigActions';
import Button from 'UI/button';
import ClusterIDLabel from 'UI/cluster_id_label';
import GenericModal from '../../modals/generic_modal';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import YAMLFileUpload from './yaml_file_upload';

const AppDetailsModal = props => {
  const [pane, setPane] = useState('initial');

  function showDeleteAppConfigPane() {
    setPane('deleteAppConfig');
  }

  function showDeleteAppPane() {
    setPane('deleteApp');
  }

  function showInitialPane() {
    setPane('initial');
  }

  function onClose() {
    showInitialPane();
    props.onClose();
  }

  function _deleteAppConfig(app, clusterId, dispatch) {
    dispatch(deleteAppConfig(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(clusterLoadApps(clusterId));
      })
      .then(() => {
        onClose();
      })
      .catch(e => {
        console.error(e);
      });
  }

  function _deleteApp(app, clusterId, dispatch) {
    dispatch(clusterDeleteApp(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(clusterLoadApps(clusterId));
      })
      .then(() => {
        onClose();
      })
      .catch(e => {
        console.error(e);
      });
  }

  //  _createAppConfig creates an app configmap.
  // YAMLFileUpload takes a curried version of this function
  // since it wants a callback with one argument for the parsed YAML result.
  function _createAppConfig(appName, clusterId, dispatch, closeModal, values) {
    return dispatch(createAppConfig(appName, clusterId, values))
      .then(() => {
        closeModal();
        return dispatch(clusterLoadApps(clusterId));
      })
      .catch(e => {
        console.error(e);
      });
  }

  //  _updateAppConfig updates an app configmap.
  // YAMLFileUpload takes a curried version of this function
  // since it wants a callback with one argument for the parsed YAML result.
  function _updateAppConfig(appName, clusterId, dispatch, closeModal, values) {
    return dispatch(updateAppConfig(appName, clusterId, values))
      .then(() => {
        closeModal();
        return dispatch(clusterLoadApps(clusterId));
      })
      .catch(e => {
        console.error(e);
      });
  }

  if (props.app === null || typeof props.app === 'undefined') {
    return <span />;
  }

  if (pane === 'initial') {
    return (
      <GenericModal
        className='appdetails'
        onClose={onClose}
        title={props.app.metadata.name}
        visible={props.visible}
      >
        <div>
          <div className='appdetails--upperlabels'>
            <div className='labelvaluepair'>
              <div className='labelvaluepair--label'>CATALOG</div>
              <div className='labelvaluepair--value code'>
                <span>{props.app.spec.catalog}</span>
              </div>
            </div>

            <div className='labelvaluepair'>
              <div className='labelvaluepair--label'>NAMESPACE</div>
              <div className='labelvaluepair--value code'>
                <span>{props.app.spec.namespace}</span>
              </div>
            </div>

            <div className='labelvaluepair'>
              <div className='labelvaluepair--label'>CHART VERSION</div>
              <div className='labelvaluepair--value code'>
                <span>{props.app.spec.version}</span>
              </div>
            </div>

            <div className='labelvaluepair'>
              <div className='labelvaluepair--label'>APP VERSION</div>
              <div className='labelvaluepair--value code'>
                {props.app.status.app_version === '' ? (
                  <span>Information pending...</span>
                ) : (
                  <span>{props.app.status.app_version}</span>
                )}
              </div>
            </div>
          </div>

          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>USER CONFIGURATION</div>

            <div className='appdetails--userconfiguration'>
              {props.app.spec.user_config.configmap.name !== '' ? (
                <>
                  <span>User configuration has been set.</span>

                  <div className='actions'>
                    <YAMLFileUpload
                      buttonText='Overwrite Configuration'
                      onInputChange={_updateAppConfig.bind(
                        undefined,
                        props.app.metadata.name,
                        props.clusterId,
                        props.dispatch,
                        onClose
                      )}
                    />

                    <Button bsStyle='danger' onClick={showDeleteAppConfigPane}>
                      <i className='fa fa-delete'></i> Delete
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span>No user configuration.</span>

                  <div className='actions'>
                    <YAMLFileUpload
                      buttonText='Upload Configuration'
                      onInputChange={_createAppConfig.bind(
                        undefined,
                        props.app.metadata.name,
                        props.clusterId,
                        props.dispatch,
                        onClose
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='labelvaluepair'>
            <div className='labelvaluepair--label delete-app'>
              Delete This App
            </div>
            <Button bsStyle='danger' onClick={showDeleteAppPane}>
              <i className='fa fa-delete'></i>Delete App
            </Button>
          </div>
        </div>
      </GenericModal>
    );
  }

  if (pane === 'deleteAppConfig') {
    return (
      <GenericModal
        footer={
          <div>
            <Button
              bsStyle='danger'
              onClick={_deleteAppConfig.bind(
                this,
                props.app,
                props.clusterId,
                props.dispatch
              )}
            >
              <i className='fa fa-delete'></i>Delete User Configuration
            </Button>
            <Button bsStyle='link' onClick={showInitialPane}>
              Cancel
            </Button>
          </div>
        }
        onClose={onClose}
        title={
          <>
            Delete User Configuration for {props.app.metadata.name} on
            {` `}
            <ClusterIDLabel clusterID={props.clusterId} />
          </>
        }
        visible={props.visible}
      >
        Are you sure you want to delete the user configuration for {props.app.metadata.name} on
        {` `}
        <ClusterIDLabel clusterID={props.clusterId} />?
        <br/><br/>
        There is no undo.
      </GenericModal>
    );
  }

  if (pane === 'deleteApp') {
    return (
      <GenericModal
        footer={
          <div>
            <Button
              bsStyle='danger'
              onClick={_deleteApp.bind(
                this,
                props.app,
                props.clusterId,
                props.dispatch
              )}
            >
              <i className='fa fa-delete'></i>Delete App
            </Button>
            <Button bsStyle='link' onClick={showInitialPane}>
              Cancel
            </Button>
          </div>
        }
        onClose={onClose}
        title={
          <>
            Delete {props.app.metadata.name} on
            {` `}
            <ClusterIDLabel clusterID={props.clusterId} />
          </>
        }
        visible={props.visible}
      >
        Are you sure you want to delete {props.app.metadata.name} on
        {` `}
        <ClusterIDLabel clusterID={props.clusterId} />?
        <br/><br/>
        There is no undo.
      </GenericModal>
    );
  }
};

AppDetailsModal.propTypes = {
  app: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

export default AppDetailsModal;
