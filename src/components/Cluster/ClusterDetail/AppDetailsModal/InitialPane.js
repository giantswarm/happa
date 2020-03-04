import { truncate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';

import YAMLFileUpload from './YamlFileUpload';

const InitialPane = props => {
  return (
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
          <br />
          <Button onClick={props.showEditChartVersionPane}>
            Edit Chart Version
          </Button>
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
                  onInputChange={props.dispatchUpdateAppConfig.bind(
                    undefined,
                    props.app.metadata.name,
                    props.clusterId,
                    props.dispatch,
                    props.onClose
                  )}
                />

                <Button
                  bsStyle='danger'
                  onClick={props.showDeleteAppConfigPane}
                >
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
                  onInputChange={props.dispatchCreateAppConfig.bind(
                    undefined,
                    props.app.metadata.name,
                    props.clusterId,
                    props.dispatch,
                    props.onClose
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
                  onInputChange={props.dispatchUpdateAppSecret.bind(
                    undefined,
                    props.app.metadata.name,
                    props.clusterId,
                    props.dispatch,
                    props.onClose
                  )}
                />

                <Button
                  bsStyle='danger'
                  onClick={props.showDeleteAppSecretPane}
                >
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
                  onInputChange={props.dispatchCreateAppSecret.bind(
                    undefined,
                    props.app.metadata.name,
                    props.clusterId,
                    props.dispatch,
                    props.onClose
                  )}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className='labelvaluepair'>
        <div className='labelvaluepair--label delete-app'>Delete This App</div>
        <Button bsStyle='danger' onClick={props.showDeleteAppPane}>
          <i className='fa fa-delete' />
          Delete App
        </Button>
      </div>
    </div>
  );
};

InitialPane.propTypes = {
  onClose: PropTypes.func,
  app: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  showDeleteAppSecretPane: PropTypes.func,
  showDeleteAppConfigPane: PropTypes.func,
  showDeleteAppPane: PropTypes.func,
  showEditChartVersionPane: PropTypes.func,

  dispatchCreateAppConfig: PropTypes.func,
  dispatchUpdateAppConfig: PropTypes.func,

  dispatchCreateAppSecret: PropTypes.func,
  dispatchUpdateAppSecret: PropTypes.func,

  visible: PropTypes.bool,
};

export default InitialPane;
