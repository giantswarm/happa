import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Button from 'UI/Button';
import Truncated from 'UI/Truncated';
import VersionPicker from 'UI/VersionPicker/VersionPicker';

import YAMLFileUpload from './YamlFileUpload';

const InitialPane = (props) => {
  return (
    <div data-testid='app-details-modal'>
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
          {/* If we have a catalog, but we're still loading the appVersions
              then show a loading spinner.
           */}
          {!props.catalogNotFound && !props.appVersions && (
            <img className='loader' width='25px' src={spinner} />
          )}

          {/* If we don't have a catalog, don't show a version picker because
              we wil never know what versions are available.
           */}
          {props.catalogNotFound && (
            <OverlayTrigger
              overlay={
                <Tooltip id='tooltip'>
                  Unable to fetch versions for this app. Could not find the
                  corresponding catalog. Changing versions is disabled.
                </Tooltip>
              }
              placement='top'
            >
              <span>
                {props.app.spec.version} <i className='fa fa-warning' />
              </span>
            </OverlayTrigger>
          )}

          {/* If we have app versions loaded, show the VersionPicker */}
          {props.appVersions && (
            <VersionPicker
              selectedVersion={props.app.spec.version}
              versions={props.appVersions.map((v) => ({ version: v.version }))}
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
              <Truncated as='span'>{props.app.status.app_version}</Truncated>
            )}
          </div>
        </div>
      </div>

      <div className='labelvaluepair'>
        <div className='labelvaluepair--label'>user level config values</div>

        <div className='appdetails--userconfiguration'>
          {props.app.spec.user_config.configmap.name !== '' ? (
            <>
              <span>User level config values have been set</span>

              <div className='actions'>
                <YAMLFileUpload
                  buttonText='Replace values'
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
              <span>No user level config values</span>

              <div className='actions'>
                <YAMLFileUpload
                  buttonText='Upload user level config values'
                  onInputChange={props.dispatchCreateAppConfig}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className='labelvaluepair'>
        <div className='labelvaluepair--label'>user level secret values</div>

        <div className='appdetails--userconfiguration'>
          {props.app.spec.user_config.secret.name !== '' ? (
            <>
              <span>User level secret values have been set</span>

              <div className='actions'>
                <YAMLFileUpload
                  buttonText='Replace user level secret values'
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
              <span>No user level secret values</span>

              <div className='actions'>
                <YAMLFileUpload
                  buttonText='Upload user level secret values'
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
  catalogNotFound: PropTypes.bool,
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
