import {
  clusterDeleteApp,
  clusterLoadApps,
} from '../../../actions/clusterActions';
import {
  createAppConfig,
  deleteAppConfig,
  updateAppConfig,
} from '../../../actions/appConfigActions';
import {
  FlashMessage,
  messageTTL,
  messageType,
} from '../../../lib/flash_message';
import Button from '../../UI/button';
import ClusterIDLabel from '../../UI/cluster_id_label';
import GenericModal from '../../modals/generic_modal';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import yaml from 'js-yaml';

const AppDetailsModal = props => {
  const [fileUploading, setFileUploading] = useState(false);
  const [renderFileInputs, setRenderFileInputs] = useState(true);
  const [pane, setPane] = useState('initial');

  let fileInput = null;

  function showDeleteAppConfigPane() {
    setPane('deleteAppConfig');
  }

  function showDeleteAppPane() {
    setPane('deleteApp');
  }

  function showInitialPane() {
    setPane('initial');
  }

  function handleUploadClick() {
    fileInput.click();
  }

  // resetFileInput is a hack to clear the file input. Since the only event
  // we really get from file inputs is when something has changed, there is a
  // state we can be in where the user tries to upload the same file twice,
  // but gets no more feedback. In order to fix this I have to unload the file
  // inputs in some cases.
  function refreshFileInputs() {
    setRenderFileInputs(false);
    setRenderFileInputs(true);
  }

  function newConfigInputOnChange(e) {
    setFileUploading(true);

    var reader = new FileReader();

    reader.onload = (function() {
      let parsedYAML;
      return function(e) {
        try {
          parsedYAML = yaml.safeLoad(e.target.result);
        } catch (err) {
          new FlashMessage(
            'Unable to parse valid YAML from this file. Please validate that it is a valid YAML file and try again.',
            messageType.ERROR,
            messageTTL.MEDIUM
          );
          setFileUploading(false);
          refreshFileInputs();
          return;
        }

        _createAppConfig(
          props.app.metadata.name,
          props.clusterId,
          parsedYAML,
          props.dispatch
        ).then(() => {
          setFileUploading(false);
          refreshFileInputs();
          props.onClose();
        });
      };
    })(e.target.files[0]);

    reader.readAsText(e.target.files[0]);
  }

  function updateConfigInputOnChange(e) {
    setFileUploading(true);

    var reader = new FileReader();

    reader.onload = (function() {
      let parsedYAML;
      return function(e) {
        try {
          parsedYAML = yaml.safeLoad(e.target.result);
        } catch (err) {
          new FlashMessage(
            'Unable to parse valid YAML from this file. Please validate that it is a valid YAML file and try again.',
            messageType.ERROR,
            messageTTL.LONG
          );
          setFileUploading(false);
          refreshFileInputs();
          return;
        }

        _updateAppConfig(
          props.app.metadata.name,
          props.clusterId,
          parsedYAML,
          props.dispatch
        ).then(() => {
          setFileUploading(false);
          refreshFileInputs();
          props.onClose();
        });
      };
    })(e.target.files[0]);

    reader.readAsText(e.target.files[0]);
  }

  function _deleteAppConfig(app, clusterId, dispatch) {
    dispatch(deleteAppConfig(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(clusterLoadApps(clusterId));
      })
      .then(() => {
        showInitialPane();
        props.onClose();
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
        showInitialPane();
        props.onClose();
      })
      .catch(e => {
        console.error(e);
      });
  }

  function _createAppConfig(appName, clusterId, values, dispatch) {
    return dispatch(createAppConfig(appName, clusterId, values))
      .then(() => {
        return dispatch(clusterLoadApps(clusterId));
      })
      .catch(e => {
        console.error(e);
      });
  }

  function _updateAppConfig(appName, clusterId, values, dispatch) {
    return dispatch(updateAppConfig(appName, clusterId, values))
      .then(() => {
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
        onClose={props.onClose}
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
                <React.Fragment>
                  <span>User configuration has been set.</span>

                  <div className='actions'>
                    <Button loading={fileUploading} onClick={handleUploadClick}>
                      Overwrite Configuration
                    </Button>

                    <Button bsStyle='danger' onClick={showDeleteAppConfigPane}>
                      Delete
                    </Button>

                    {renderFileInputs ? (
                      <input
                        accept='.yaml'
                        onChange={updateConfigInputOnChange}
                        ref={i => (fileInput = i)}
                        style={{ display: 'none' }}
                        type='file'
                      />
                    ) : (
                      undefined
                    )}
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span>No user configuration yet.</span>

                  <div className='actions'>
                    <Button loading={fileUploading} onClick={handleUploadClick}>
                      {' '}
                      Upload Configuration
                    </Button>
                    {renderFileInputs ? (
                      <input
                        accept='.yaml'
                        onChange={newConfigInputOnChange}
                        ref={i => (fileInput = i)}
                        style={{ display: 'none' }}
                        type='file'
                      />
                    ) : (
                      undefined
                    )}
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>DANGER ZONE</div>
            <Button bsStyle='danger' onClick={showDeleteAppPane}>
              Delete App
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
              Delete App Config
            </Button>
            <Button bsStyle='link' onClick={showInitialPane}>
              Cancel
            </Button>
          </div>
        }
        onClose={props.onClose}
        title={
          <React.Fragment>
            {`Delete User Configuration for ${props.app.metadata.name} on`}
            {` `}
            <ClusterIDLabel clusterID={props.clusterId} />
          </React.Fragment>
        }
        visible={props.visible}
      >
        <p>
          {`Are you sure you want to delete the user configuration for ${props.app.metadata.name} on`}
          {` `}
          <ClusterIDLabel clusterID={props.clusterId} />? <br />
          <br />
          There is no undo.
        </p>
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
              Delete App
            </Button>
            <Button bsStyle='link' onClick={showInitialPane}>
              Cancel
            </Button>
          </div>
        }
        onClose={props.onClose}
        title={
          <React.Fragment>
          {`Delete ${props.app.metadata.name} on`}
          {` `}
          <ClusterIDLabel clusterID={props.clusterId} />
        </React.Fragment>
        }
        visible={props.visible}
      >
        <p>
          {`Are you sure you want to delete ${props.app.metadata.name} on`}
          {` `}
          <ClusterIDLabel clusterID={props.clusterId} />? <br />
          <br />
          There is no undo.
        </p>
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
