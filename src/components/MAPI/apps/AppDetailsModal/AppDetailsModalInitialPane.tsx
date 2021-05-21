import YAMLFileUpload from 'Cluster/ClusterDetail/AppDetailsModal/YAMLFileUpload';
import { spinner } from 'images';
import { compare } from 'lib/semver';
import { VersionImpl } from 'lib/Version';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import { IVersion } from 'UI/Controls/VersionPicker/VersionPickerUtils';
import DetailItem from 'UI/Layout/DetailList';
import Truncated from 'UI/Util/Truncated';
import { memoize } from 'underscore';

const mapCatalogEntriesToReleasePickerItem = memoize(
  (catalogEntries: applicationv1alpha1.IAppCatalogEntry[]): IVersion[] => {
    return catalogEntries
      .map((e) => ({
        chartVersion: e.spec.version,
        created: e.spec.dateCreated ?? '',
        includesVersion: e.spec.appVersion,
        test: isTestRelease(e.spec.version),
      }))
      .sort((a, b) => compare(b.chartVersion, a.chartVersion));
  }
);

function isTestRelease(releaseVersion: string): boolean {
  const version = new VersionImpl(releaseVersion);

  return version.getPreRelease().length > 0;
}

const Upper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 25px;

  > div {
    width: 50%;
  }
`;

type ConfigChangeHandler = (values: string, done: () => void) => void;

interface IAppDetailsModalInitialPaneProps {
  app: applicationv1alpha1.IApp;
  appCatalogEntriesIsLoading: boolean;
  dispatchCreateAppConfig: ConfigChangeHandler;
  dispatchCreateAppSecret: ConfigChangeHandler;
  dispatchUpdateAppConfig: ConfigChangeHandler;
  dispatchUpdateAppSecret: ConfigChangeHandler;
  showDeleteAppConfigPane: () => void;
  showDeleteAppPane: () => void;
  showDeleteAppSecretPane: () => void;
  showEditChartVersionPane: (version?: string) => void;
  appCatalogEntries?: applicationv1alpha1.IAppCatalogEntry[];
}

const AppDetailsModalInitialPane: React.FC<IAppDetailsModalInitialPaneProps> = (
  props
) => {
  return (
    <div>
      <Upper>
        <DetailItem title='CATALOG' className='code'>
          <span>{props.app.spec.catalog}</span>
        </DetailItem>

        <DetailItem title='CHART VERSION'>
          {props.appCatalogEntriesIsLoading && (
            <img className='loader' width='25px' src={spinner} />
          )}

          {typeof props.appCatalogEntries === 'undefined' &&
            !props.appCatalogEntriesIsLoading && (
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
                  <Truncated as='span'>{props.app.spec.version}</Truncated>{' '}
                  <i className='fa fa-warning' />
                </span>
              </OverlayTrigger>
            )}

          {props.appCatalogEntries && (
            <VersionPicker
              selectedVersion={props.app.spec.version}
              versions={mapCatalogEntriesToReleasePickerItem(
                props.appCatalogEntries
              )}
              onChange={props.showEditChartVersionPane}
            />
          )}
        </DetailItem>

        <DetailItem title='NAMESPACE' className='code'>
          <span>{props.app.spec.namespace}</span>
        </DetailItem>

        <DetailItem title='APP VERSION' className='code'>
          {props.app.status?.appVersion ? (
            <Truncated as='span'>{props.app.status?.appVersion}</Truncated>
          ) : (
            <span>Information pending...</span>
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
        {props.app.spec.userConfig?.configMap?.name ? (
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
        {props.app.spec.userConfig?.secret?.name ? (
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
          Delete App
        </Button>
      </DetailItem>
    </div>
  );
};

AppDetailsModalInitialPane.propTypes = {
  app: (PropTypes.object as PropTypes.Requireable<applicationv1alpha1.IApp>)
    .isRequired,
  appCatalogEntriesIsLoading: PropTypes.bool.isRequired,
  dispatchCreateAppConfig: PropTypes.func.isRequired,
  dispatchCreateAppSecret: PropTypes.func.isRequired,
  dispatchUpdateAppConfig: PropTypes.func.isRequired,
  dispatchUpdateAppSecret: PropTypes.func.isRequired,
  showDeleteAppConfigPane: PropTypes.func.isRequired,
  showDeleteAppPane: PropTypes.func.isRequired,
  showDeleteAppSecretPane: PropTypes.func.isRequired,
  showEditChartVersionPane: PropTypes.func.isRequired,
  appCatalogEntries: PropTypes.array,
};

export default AppDetailsModalInitialPane;
