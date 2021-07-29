import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import DetailItem from 'UI/Layout/DetailList';
import Truncated from 'UI/Util/Truncated';

import YAMLFileUpload from './YAMLFileUpload';

const Upper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 25px;

  > div {
    width: 50%;
  }
`;

type ConfigChangeHandler = (values: string, done: () => void) => void;

interface IInitialPaneProps {
  app: IInstalledApp;
  appVersions: IAppCatalogAppVersion[];
  dispatchCreateAppConfig: ConfigChangeHandler;
  dispatchCreateAppSecret: ConfigChangeHandler;
  dispatchUpdateAppConfig: ConfigChangeHandler;
  dispatchUpdateAppSecret: ConfigChangeHandler;
  showDeleteAppConfigPane: () => void;
  showDeleteAppPane: () => void;
  showDeleteAppSecretPane: () => void;
  showEditChartVersionPane: (version?: string) => void;
  catalogNotFound?: boolean;
}

const InitialPane: React.FC<IInitialPaneProps> = (props) => {
  return (
    <div>
      <Upper>
        <DetailItem title='CATALOG' className='code'>
          <span>{props.app.spec.catalog}</span>
        </DetailItem>

        <DetailItem title='CHART VERSION'>
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
              versions={props.appVersions.map((v) => ({
                chartVersion: v.version,
                created: v.created,
                includesVersion: v.appVersion,
                test: false,
              }))}
              onChange={props.showEditChartVersionPane}
            />
          )}
        </DetailItem>

        <DetailItem title='NAMESPACE' className='code'>
          <span>{props.app.spec.namespace}</span>
        </DetailItem>

        <DetailItem title='APP VERSION' className='code'>
          {props.app.status.app_version === '' ? (
            <span>Information pending...</span>
          ) : (
            <Truncated as='span'>{props.app.status.app_version}</Truncated>
          )}
        </DetailItem>

        <DetailItem title='RELEASE STATUS' className='code'>
          {props.app.status?.release?.status ? (
            <span>{props.app.status.release.status}</span>
          ) : (
            <span>Information pending...</span>
          )}
        </DetailItem>
      </Upper>

      <DetailItem title='user level config values' className='well'>
        {props.app.spec.user_config.configmap.name !== '' ? (
          <>
            <span>User level config values have been set</span>

            <div className='actions'>
              <YAMLFileUpload
                buttonText='Replace values'
                onInputChange={props.dispatchUpdateAppConfig}
              />

              <Button bsStyle='danger' onClick={props.showDeleteAppConfigPane}>
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
      </DetailItem>

      <DetailItem title='user level secret values' className='well'>
        {props.app.spec.user_config.secret.name !== '' ? (
          <>
            <span>User level secret values have been set</span>

            <div className='actions'>
              <YAMLFileUpload
                buttonText='Replace user level secret values'
                onInputChange={props.dispatchUpdateAppSecret}
              />

              <Button bsStyle='danger' onClick={props.showDeleteAppSecretPane}>
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
      </DetailItem>

      <DetailItem title='Delete This App'>
        <Button bsStyle='danger' onClick={props.showDeleteAppPane}>
          <i className='fa fa-delete' />
          Delete app
        </Button>
      </DetailItem>
    </div>
  );
};

InitialPane.propTypes = {
  app: (PropTypes.object as PropTypes.Requireable<IInstalledApp>).isRequired,
  appVersions: PropTypes.array.isRequired,
  dispatchCreateAppConfig: PropTypes.func.isRequired,
  dispatchCreateAppSecret: PropTypes.func.isRequired,
  dispatchUpdateAppConfig: PropTypes.func.isRequired,
  dispatchUpdateAppSecret: PropTypes.func.isRequired,
  showDeleteAppConfigPane: PropTypes.func.isRequired,
  showDeleteAppPane: PropTypes.func.isRequired,
  showDeleteAppSecretPane: PropTypes.func.isRequired,
  showEditChartVersionPane: PropTypes.func.isRequired,
  catalogNotFound: PropTypes.bool,
};

export default InitialPane;
