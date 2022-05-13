import { Box } from 'grommet';
import { spinner } from 'images';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';
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

const InitialPane: React.FC<React.PropsWithChildren<IInitialPaneProps>> = (
  props
) => {
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
            <TooltipContainer
              content={
                <Tooltip>
                  Unable to fetch versions for this app. Could not find the
                  corresponding catalog. Changing versions is disabled.
                </Tooltip>
              }
            >
              <span>
                {props.app.spec.version} <i className='fa fa-warning' />
              </span>
            </TooltipContainer>
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

            <Box direction='row' gap='small'>
              <YAMLFileUpload
                buttonText='Replace values'
                onInputChange={props.dispatchUpdateAppConfig}
              />

              <Button
                danger={true}
                onClick={props.showDeleteAppConfigPane}
                icon={<i className='fa fa-delete' />}
              >
                Delete
              </Button>
            </Box>
          </>
        ) : (
          <>
            <span>No user level config values</span>

            <Box direction='row' gap='small'>
              <YAMLFileUpload
                buttonText='Upload user level config values'
                onInputChange={props.dispatchCreateAppConfig}
              />
            </Box>
          </>
        )}
      </DetailItem>

      <DetailItem title='user level secret values' className='well'>
        {props.app.spec.user_config.secret.name !== '' ? (
          <>
            <span>User level secret values have been set</span>

            <Box direction='row' gap='small'>
              <YAMLFileUpload
                buttonText='Replace user level secret values'
                onInputChange={props.dispatchUpdateAppSecret}
              />

              <Button
                danger={true}
                onClick={props.showDeleteAppSecretPane}
                icon={<i className='fa fa-delete' />}
              >
                Delete
              </Button>
            </Box>
          </>
        ) : (
          <>
            <span>No user level secret values</span>

            <Box direction='row' gap='small'>
              <YAMLFileUpload
                buttonText='Upload user level secret values'
                onInputChange={props.dispatchCreateAppSecret}
              />
            </Box>
          </>
        )}
      </DetailItem>

      <DetailItem title='Delete This App'>
        <Button
          danger={true}
          onClick={props.showDeleteAppPane}
          icon={<i className='fa fa-delete' />}
        >
          Delete app
        </Button>
      </DetailItem>
    </div>
  );
};

export default InitialPane;
