import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { compare } from 'lib/semver';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppsRoutes } from 'shared/constants/routes';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import AppVersionInspectorOption from 'UI/Display/MAPI/apps/AppVersionInspectorOption';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import Select from 'UI/Inputs/Select';
import Truncated from 'UI/Util/Truncated';

import { updateAppVersion } from './utils';

interface IClusterDetailAppListWidgetVersionInspectorProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
}

const ClusterDetailAppListWidgetVersionInspector: React.FC<IClusterDetailAppListWidgetVersionInspectorProps> = ({
  app,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appCatalogEntryListClient = useRef(clientFactory());

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = useMemo(() => {
    if (!app) return {};

    return {
      labelSelector: {
        matchingLabels: {
          [applicationv1alpha1.labelAppName]: app.spec.name,
          [applicationv1alpha1.labelAppCatalog]: app.spec.catalog,
        },
      },
    };
  }, [app]);
  const appCatalogEntryListKey = useMemo(() => {
    if (!app) return null;

    return applicationv1alpha1.getAppCatalogEntryListKey(
      appCatalogEntryListGetOptions
    );
  }, [app, appCatalogEntryListGetOptions]);

  const { data: appCatalogEntryList, error: appCatalogEntryListError } = useSWR<
    applicationv1alpha1.IAppCatalogEntryList,
    GenericResponseError
  >(appCatalogEntryListKey, () =>
    applicationv1alpha1.getAppCatalogEntryList(
      appCatalogEntryListClient.current,
      auth,
      appCatalogEntryListGetOptions
    )
  );

  useEffect(() => {
    if (appCatalogEntryListError) {
      const errorMessage = extractErrorMessage(appCatalogEntryListError);

      new FlashMessage(
        'There was a problem loading app versions.',
        messageType.ERROR,
        messageTTL.FOREVER,
        errorMessage
      );

      ErrorReporter.getInstance().notify(appCatalogEntryListError);
    }
  }, [appCatalogEntryListError]);

  const isLoading =
    typeof app === 'undefined' || typeof appCatalogEntryList === 'undefined';

  const [selectedEntry, setSelectedEntry] = useState<
    applicationv1alpha1.IAppCatalogEntry | undefined
  >(undefined);

  useEffect(() => {
    // Select the current app version when all the catalog entries are loaded.
    if (
      typeof app !== 'undefined' &&
      typeof appCatalogEntryList !== 'undefined' &&
      typeof selectedEntry === 'undefined'
    ) {
      const entry = appCatalogEntryList.items.find(
        (e) => e.spec.version === app.spec.version
      );
      if (!entry) return;

      setSelectedEntry(entry);
    }
  }, [app, appCatalogEntryList, selectedEntry]);

  const options = useMemo(() => {
    if (!appCatalogEntryList) return [];

    // Sort in a descending order, showing newest versions first.
    return appCatalogEntryList.items
      .slice()
      .sort((a, b) => compare(b.spec.version, a.spec.version));
  }, [appCatalogEntryList]);

  let currentSelectedVersion: string | undefined = app?.spec.version;
  let currentCreationDate: string | undefined = '';
  let currentUpstreamVersion: string | undefined = '';

  if (isLoading) {
    currentSelectedVersion = undefined;
    currentCreationDate = undefined;
    currentUpstreamVersion = undefined;
  } else if (selectedEntry) {
    currentSelectedVersion = selectedEntry.spec.version;
    currentCreationDate = selectedEntry.spec.dateCreated!;
    currentUpstreamVersion = selectedEntry.spec.appVersion;
  }

  const isCurrentVersionSelected = currentSelectedVersion === app?.spec.version;

  const appPath = useMemo(() => {
    if (!app) return '';

    return RoutePath.createUsablePath(AppsRoutes.AppDetail, {
      catalogName: app.spec.catalog,
      app: app.spec.name,
      version: app.spec.version,
    });
  }, [app]);

  const [isSwitchingVersion, setIsSwitchingVersion] = useState(false);

  const handleCancelSwitchingVersion = () => {
    setIsSwitchingVersion(false);
  };

  const versionSwitchComparison = useMemo(() => {
    if (!currentSelectedVersion || !app) return 0;

    return compare(app.spec.version, currentSelectedVersion);
  }, [app, currentSelectedVersion]);

  const isUpgrading = versionSwitchComparison < 0;
  const isDowngrading = versionSwitchComparison > 0;

  const [appUpdateIsLoading, setAppUpdateIsLoading] = useState(false);

  const handleSwitchVersions = async () => {
    if (!app || !currentSelectedVersion) return;

    try {
      setAppUpdateIsLoading(true);

      await updateAppVersion(
        clientFactory(),
        auth,
        app.metadata.namespace!,
        app.metadata.name,
        currentSelectedVersion
      );

      setAppUpdateIsLoading(false);
      handleCancelSwitchingVersion();

      new FlashMessage(
        `App <code>${app.metadata.name}</code> on <code>${app.metadata.namespace}</code> has been updated. Changes might take some time to take effect.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      setAppUpdateIsLoading(false);

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `Something went wrong while trying to update <code>${app.metadata.name}</code> on <code>${app.metadata.namespace}</code>.`,
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err as Error);
    }
  };

  return (
    <ClusterDetailAppListWidget title='Inspect versions' {...props}>
      <Box
        pad={{ top: 'small' }}
        direction='row'
        gap='small'
        wrap={true}
        align='center'
      >
        <Box flex={{ grow: 1, shrink: 0 }}>
          <Select
            value={
              <AppVersionInspectorOption
                version={currentSelectedVersion}
                creationDate={currentCreationDate}
                upstreamVersion={currentUpstreamVersion}
                isCurrent={isCurrentVersionSelected}
              />
            }
            onChange={(e) => setSelectedEntry(e.option)}
            options={options}
            disabled={isLoading || isSwitchingVersion}
            margin='none'
            aria-label='Select app version'
            contentProps={{
              border: { color: 'input-background' },
            }}
          >
            {(option: applicationv1alpha1.IAppCatalogEntry) => {
              return (
                <AppVersionInspectorOption
                  version={option.spec.version}
                  creationDate={option.spec.dateCreated!}
                  upstreamVersion={option.spec.appVersion}
                  isSelected={option === selectedEntry}
                  isCurrent={option.spec.version === app?.spec.version}
                  aria-label={option.spec.version}
                />
              );
            }}
          </Select>
        </Box>
        <Link to={appPath}>
          <Button tabIndex={-1} disabled={isLoading}>
            Details
          </Button>
        </Link>
        <Button
          disabled={isLoading || isCurrentVersionSelected || isSwitchingVersion}
          onClick={() => setIsSwitchingVersion(true)}
        >
          Update…
        </Button>
      </Box>

      <Box margin={{ top: isSwitchingVersion ? 'small' : undefined }}>
        <ConfirmationPrompt
          title={
            <Text weight='bold' margin={{ bottom: 'small' }}>
              Are you sure that you want to switch the{' '}
              <code>{app?.metadata.name}</code> version in cluster{' '}
              <ClusterIDLabel
                clusterID={app?.metadata.namespace ?? ''}
                variant={ClusterIDLabelType.Name}
              />{' '}
              from version{' '}
              <Truncated as='code' numStart={10}>
                {app?.spec.version ?? ''}
              </Truncated>{' '}
              to{' '}
              <Truncated as='code' numStart={10}>
                {currentSelectedVersion ?? ''}
              </Truncated>
              ?
            </Text>
          }
          confirmButton={
            <Button
              primary={isUpgrading}
              danger={isDowngrading}
              onClick={handleSwitchVersions}
              disabled={!isUpgrading && !isDowngrading}
              loading={appUpdateIsLoading}
            >
              {isUpgrading && 'Upgrade'}
              {isDowngrading && 'Downgrade'}
              {!isUpgrading && !isDowngrading && 'Switch'}
            </Button>
          }
          onConfirm={handleSwitchVersions}
          onCancel={handleCancelSwitchingVersion}
          open={isSwitchingVersion}
          contentProps={{
            background: 'background-contrast',
          }}
        >
          <Text>
            Please make sure to verify if there are any breaking changes between
            these versions.
          </Text>
        </ConfirmationPrompt>
      </Box>
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetVersionInspector;
