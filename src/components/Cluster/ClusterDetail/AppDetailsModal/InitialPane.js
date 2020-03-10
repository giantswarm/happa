import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';
import VersionPicker from 'UI/VersionPicker/VersionPicker';

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
          {props.appVersions && (
            <VersionPicker
              selectedVersion={props.app.spec.version}
              versions={props.appVersions.map(v => ({ version: v.version }))}
              onChange={props.showEditChartVersionPane}
            />
          )}
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
                  onInputChange={props.dispatchUpdateAppConfig}
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
                  onInputChange={props.dispatchCreateAppConfig}
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
                  onInputChange={props.dispatchUpdateAppSecret}
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
                  onInputChange={props.dispatchCreateAppSecret}
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
  app: PropTypes.object,
  appVersions: PropTypes.array,
  dispatchCreateAppConfig: PropTypes.func,
  dispatchCreateAppSecret: PropTypes.func,
  dispatchUpdateAppConfig: PropTypes.func,
  dispatchUpdateAppSecret: PropTypes.func,
  showDeleteAppConfigPane: PropTypes.func,
  showDeleteAppPane: PropTypes.func,
  showDeleteAppSecretPane: PropTypes.func,
  showEditChartVersionPane: PropTypes.func,
};

export default InitialPane;
