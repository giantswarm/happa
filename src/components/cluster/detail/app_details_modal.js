import { clusterLoadApps } from '../../../actions/clusterActions';
import { createAppConfig, deleteAppConfig, updateAppConfig } from '../../../actions/appConfigActions';
import { FlashMessage, messageTTL, messageType } from '../../../lib/flash_message';
import Button from '../../UI/button';
import GenericModal from '../../modals/generic_modal';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import yaml from 'js-yaml';

function _confirmDeleteAppConfig(app, clusterId, dispatch) {
  dispatch(deleteAppConfig(app.metadata.name, clusterId))
  .then(() => {
    return dispatch(clusterLoadApps(clusterId));
  })
  .catch((e) => {
    console.error(e);
  });
}

function _createAppConfig(appName, clusterId, values, dispatch) {
  return dispatch(createAppConfig(appName, clusterId, values))
  .then(() => {
    return dispatch(clusterLoadApps(clusterId));
  })
  .catch((e) => {
    console.error(e);
  });
}

function _updateAppConfig(appName, clusterId, values, dispatch) {
  return dispatch(updateAppConfig(appName, clusterId, values))
  .then(() => {
    return dispatch(clusterLoadApps(clusterId));
  })
  .catch((e) => {
    console.error(e);
  });
}

const AppDetailsModal = props => {
  const [fileUploading, setFileUploading] = useState(false);
  const [renderFileInputs, setRenderFileInputs] = useState(true);

  let fileInput = null;

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

        _createAppConfig(props.app.metadata.name, props.clusterId, parsedYAML, props.dispatch)
        .then(() => {
          setFileUploading(false);
          refreshFileInputs();
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
            messageTTL.MEDIUM
          );
          setFileUploading(false);
          refreshFileInputs();
          return;
        }

        _updateAppConfig(props.app.metadata.name, props.clusterId, parsedYAML, props.dispatch)
        .then(() => {
          setFileUploading(false);
          refreshFileInputs();
        });
      };
    })(e.target.files[0]);

    reader.readAsText(e.target.files[0]);
  }

  if (props.app === null || typeof props.app === 'undefined') {
    return <span />;
  }

  return (
    <GenericModal
      className='appdetails'
      onClose={props.onClose}
      title={props.app.metadata.name}
      visible={props.visible}
    >
      <div>
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
            {
              props.app.status.app_version === '' ?
              <span>Information pending...</span>
              :
              <span>{props.app.status.app_version}</span>
            }
          </div>
        </div>

        <div className='labelvaluepair'>
          <div className='labelvaluepair--label'>
            USER CONFIGURATION

            {
            props.app.spec.user_config.configmap.name !== '' ?
            <div className='labelvaluepair--labelactions'>
              <a onClick={_confirmDeleteAppConfig.bind(this, props.app, props.clusterId, props.dispatch)}>Delete Configuration</a>
            </div>
            :
            undefined
            }
          </div>

          <div className='appdetails--userconfiguration'>
          {
            props.app.spec.user_config.configmap.name !== '' ?
            <React.Fragment>
              <span>Configuration has been set.</span>
              <Button loading={fileUploading} loadingPosition='left' onClick={handleUploadClick}>Upload New Configuration</Button>
              {
                renderFileInputs ?
                <input accept=".yaml" onChange={updateConfigInputOnChange} ref={i => fileInput = i} style={{display: 'none'}} type='file'  />
                :
                undefined
              }
            </React.Fragment>
            :
            <React.Fragment>
              <span>No configuration set yet</span>
              <Button loading={fileUploading} loadingPosition='left' onClick={handleUploadClick}> Upload Configuration</Button>
              {
                renderFileInputs ?
                <input accept=".yaml" onChange={newConfigInputOnChange} ref={i => fileInput = i} style={{display: 'none'}} type='file'  />
                :
                undefined
              }
            </React.Fragment>
          }
          </div>
        </div>
      </div>
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
