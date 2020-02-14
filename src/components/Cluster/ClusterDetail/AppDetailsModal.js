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
import { truncate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';

import GenericModal from '../../Modals/GenericModal';
import YAMLFileUpload from './YamlFileUpload';

const AppDetailsModal = props => {
  const [pane, setPane] = useState('initial');

  function showDeleteAppConfigPane() {
    setPane('deleteAppConfig');
  }

  function showDeleteAppSecretPane() {
    setPane('deleteAppSecret');
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

  function dispatchDeleteAppConfig(app, clusterId, dispatch) {
    dispatch(deleteAppConfig(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        onClose();
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  function dispatchDeleteAppSecret(app, clusterId, dispatch) {
    dispatch(deleteAppSecret(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        onClose();
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  function dispatchDeleteApp(app, clusterId, dispatch) {
    dispatch(deleteApp(app.metadata.name, clusterId))
      .then(() => {
        return dispatch(loadApps(clusterId));
      })
      .then(() => {
        onClose();
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
                {/* eslint-disable-next-line no-magic-numbers */}
                <span>{truncate(props.app.spec.version, 20)}</span>
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
            <div className='labelvaluepair--label'>CONFIGMAP</div>

            <div className='appdetails--userconfiguration'>
              {props.app.spec.user_config.configmap.name !== '' ? (
                <>
                  <span>ConfigMap has been set</span>

                  <div className='actions'>
                    <YAMLFileUpload
                      buttonText='Replace ConfigMap'
                      onInputChange={dispatchUpdateAppConfig.bind(
                        undefined,
                        props.app.metadata.name,
                        props.clusterId,
                        props.dispatch,
                        onClose
                      )}
                    />

                    <Button bsStyle='danger' onClick={showDeleteAppConfigPane}>
                      <i className='fa fa-delete' /> Delete
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span>No ConfigMap</span>

                  <div className='actions'>
                    <YAMLFileUpload
                      buttonText='Upload ConfigMap'
                      onInputChange={dispatchCreateAppConfig.bind(
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
            <div className='labelvaluepair--label'>SECRET</div>

            <div className='appdetails--userconfiguration'>
              {props.app.spec.user_config.secret.name !== '' ? (
                <>
                  <span>Secret has been set</span>

                  <div className='actions'>
                    <YAMLFileUpload
                      buttonText='Replace Secret'
                      onInputChange={dispatchUpdateAppSecret.bind(
                        undefined,
                        props.app.metadata.name,
                        props.clusterId,
                        props.dispatch,
                        onClose
                      )}
                    />

                    <Button bsStyle='danger' onClick={showDeleteAppSecretPane}>
                      <i className='fa fa-delete' /> Delete
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span>No Secret.</span>

                  <div className='actions'>
                    <YAMLFileUpload
                      buttonText='Upload Secret'
                      onInputChange={dispatchCreateAppSecret.bind(
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
              <i className='fa fa-delete' />
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
              onClick={dispatchDeleteAppConfig.bind(
                this,
                props.app,
                props.clusterId,
                props.dispatch
              )}
            >
              <i className='fa fa-delete' />
              Delete ConfigMap
            </Button>
            <Button bsStyle='link' onClick={showInitialPane}>
              Cancel
            </Button>
          </div>
        }
        onClose={onClose}
        title={
          <>
            Delete ConfigMap for {props.app.metadata.name} on{' '}
            <ClusterIDLabel clusterID={props.clusterId} />
          </>
        }
        visible={props.visible}
      >
        Are you sure you want to delete the ConfigMap for{' '}
        {props.app.metadata.name} on{' '}
        <ClusterIDLabel clusterID={props.clusterId} />?
        <br />
        <br />
        There is no undo.
      </GenericModal>
    );
  }

  if (pane === 'deleteAppSecret') {
    return (
      <GenericModal
        footer={
          <div>
            <Button
              bsStyle='danger'
              onClick={dispatchDeleteAppSecret.bind(
                this,
                props.app,
                props.clusterId,
                props.dispatch
              )}
            >
              <i className='fa fa-delete' />
              Delete Secret
            </Button>
            <Button bsStyle='link' onClick={showInitialPane}>
              Cancel
            </Button>
          </div>
        }
        onClose={onClose}
        title={
          <>
            Delete Secret for {props.app.metadata.name} on{' '}
            <ClusterIDLabel clusterID={props.clusterId} />
          </>
        }
        visible={props.visible}
      >
        Are you sure you want to delete the Secret for {props.app.metadata.name}{' '}
        on <ClusterIDLabel clusterID={props.clusterId} />?
        <br />
        <br />
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
              onClick={dispatchDeleteApp.bind(
                this,
                props.app,
                props.clusterId,
                props.dispatch
              )}
            >
              <i className='fa fa-delete' />
              Delete App
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
            <ClusterIDLabel clusterID={props.clusterId} />
          </>
        }
        visible={props.visible}
      >
        Are you sure you want to delete {props.app.metadata.name} on
        <ClusterIDLabel clusterID={props.clusterId} />?
        <br />
        <br />
        There is no undo.
      </GenericModal>
    );
  }

  return null;
};

AppDetailsModal.propTypes = {
  app: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

export default AppDetailsModal;
