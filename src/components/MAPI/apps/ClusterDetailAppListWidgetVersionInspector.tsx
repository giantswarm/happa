import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { AppsRoutes } from 'model/constants/routes';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { truncate } from 'utils/helpers';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import RoutePath from 'utils/routePath';
import { compare } from 'utils/semver';

import { normalizeAppVersion, updateAppVersion } from './utils';

interface IClusterDetailAppListWidgetVersionInspectorProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  currentSelectedVersion?: string;
  onSelectVersion: (newVersion: string) => void;
}

const TRUNCATE_START_CHARS = 10;
const TRUNCATE_END_CHARS = 5;

const ClusterDetailAppListWidgetVersionInspector: React.FC<
  IClusterDetailAppListWidgetVersionInspectorProps
> = ({ app, currentSelectedVersion, onSelectVersion, ...props }) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const appCatalogEntryListClient = useRef(clientFactory());

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions =
    useMemo(() => {
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
    typeof app === 'undefined' ||
    (typeof appCatalogEntryList === 'undefined' &&
      typeof appCatalogEntryListError === 'undefined');

  const currentEntry = useMemo(() => {
    if (!appCatalogEntryList) return undefined;

    return appCatalogEntryList.items.find(
      (e) => e.spec.version === currentSelectedVersion
    );
  }, [appCatalogEntryList, currentSelectedVersion]);

  const currentCreationDate = isLoading
    ? undefined
    : currentEntry?.spec.dateCreated ?? '';
  const currentUpstreamVersion = isLoading
    ? undefined
    : currentEntry?.spec.appVersion ?? '';

  const options = useMemo(() => {
    if (!appCatalogEntryList) return [];

    // Sort in a descending order, showing newest versions first.
    return appCatalogEntryList.items
      .slice()
      .sort((a, b) =>
        compare(
          normalizeAppVersion(b.spec.version),
          normalizeAppVersion(a.spec.version)
        )
      );
  }, [appCatalogEntryList]);

  const isCurrentVersionSelected =
    app && currentSelectedVersion === normalizeAppVersion(app.spec.version);

  const appPath = useMemo(() => {
    if (!app) return '';

    return RoutePath.createUsablePath(AppsRoutes.AppDetail, {
      catalogName: app.spec.catalog,
      app: app.spec.name,
      version: normalizeAppVersion(app.spec.version),
    });
  }, [app]);

  const [isSwitchingVersion, setIsSwitchingVersion] = useState(false);

  const handleCancelSwitchingVersion = () => {
    setIsSwitchingVersion(false);
  };

  const versionSwitchComparison = useMemo(() => {
    if (!currentSelectedVersion || !app) return 0;

    return compare(
      normalizeAppVersion(app.spec.version),
      currentSelectedVersion
    );
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

      const truncatedVersion = truncate(
        currentSelectedVersion,
        '…',
        TRUNCATE_START_CHARS,
        TRUNCATE_END_CHARS
      );

      const updateAction = isUpgrading ? 'upgraded' : 'downgraded';

      new FlashMessage(
        (
          <>
            <code>{app.metadata.name}</code> on cluster{' '}
            <code>{app.metadata.namespace}</code> will be {updateAction} to
            version <code>{truncatedVersion}</code>.
          </>
        ),
        messageType.SUCCESS,
        messageTTL.LONG
      );
    } catch (err) {
      setAppUpdateIsLoading(false);

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        (
          <>
            Something went wrong while trying to update{' '}
            <code>{app.metadata.name}</code> on{' '}
            <code>{app.metadata.namespace}</code>.
          </>
        ),
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            onChange={(e) => onSelectVersion(e.option.spec.version)}
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
                  isSelected={option.spec.version === currentSelectedVersion}
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
              <Truncated as='code' numStart={TRUNCATE_START_CHARS}>
                {app ? normalizeAppVersion(app.spec.version) : ''}
              </Truncated>{' '}
              to{' '}
              <Truncated as='code' numStart={TRUNCATE_START_CHARS}>
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
