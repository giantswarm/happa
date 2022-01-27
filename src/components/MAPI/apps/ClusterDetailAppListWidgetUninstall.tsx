import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { extractErrorMessage } from 'MAPI/utils';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useMemo, useState } from 'react';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import { IAppsPermissions } from './permissions/types';
import { deleteAppWithName } from './utils';

interface IClusterDetailAppListWidgetUninstallProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  appsPermissions?: IAppsPermissions;
  onAppUninstalled?: () => void;
}

function getAppUninstallConfirmationInfo(
  app: applicationv1alpha1.IApp
): string {
  const hasConfigMap = Boolean(app.spec.userConfig?.configMap);
  const hasSecrets = Boolean(app.spec.userConfig?.secret);

  let configResourcesMessage = '';

  switch (true) {
    case hasConfigMap && hasSecrets:
      configResourcesMessage += `Uninstalling this app will leave the existing ConfigMap and Secret configuration resources in place. `;
      break;
    case hasConfigMap:
      configResourcesMessage += `Uninstalling this app will leave the existing ConfigMap configuration resource in place. `;
      break;
    case hasSecrets:
      configResourcesMessage += `Uninstalling this app will leave the existing Secret configuration resource in place. `;
      break;
  }

  return `${configResourcesMessage}You can re-install this app at any time.`;
}

const ClusterDetailAppListWidgetUninstall: React.FC<
  IClusterDetailAppListWidgetUninstallProps
> = ({ app, appsPermissions, onAppUninstalled, ...props }) => {
  const auth = useAuthProvider();
  const appClient = useHttpClient();

  const canUninstallApps =
    appsPermissions?.canGet && appsPermissions?.canDelete;

  const uninstallApp = async () => {
    if (!app || !canUninstallApps) return;

    try {
      await deleteAppWithName(
        appClient,
        auth,
        app.metadata.namespace!,
        app.metadata.name
      );

      if (onAppUninstalled) onAppUninstalled();

      new FlashMessage(
        (
          <>
            App <code>{app.metadata.name}</code> will be uninstalled from
            cluster <code>{app.metadata.namespace}</code>.
          </>
        ),
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);

      const errorMessage = extractErrorMessage(err);
      new FlashMessage(
        'Something went wrong while trying to uninstall your app.',
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );
    }
  };

  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const handleCancel = () => setIsConfirmationVisible(false);
  const handleUninstall = () => setIsConfirmationVisible(true);

  const uninstallConfirmationInfo = useMemo(() => {
    if (!app) return '';

    return getAppUninstallConfirmationInfo(app);
  }, [app]);

  return (
    <ClusterDetailAppListWidget
      title='Uninstall'
      contentProps={{
        margin: { top: 'small' },
        pad: 'medium',
        background: 'background-contrast',
        round: { size: 'xsmall' },
      }}
      {...props}
    >
      {!app ? (
        <Box direction='row' justify='between' align='center'>
          <LoadingPlaceholder width={500} height={20} />
          <LoadingPlaceholder width={100} height={36} />
        </Box>
      ) : (
        <>
          <ConfirmationPrompt
            title={
              <Text weight='bold' margin={{ bottom: 'small' }}>
                Are you sure you want to uninstall{' '}
                <code>{app.metadata.name}</code> from cluster{' '}
                <ClusterIDLabel
                  clusterID={app.metadata.namespace!}
                  variant={ClusterIDLabelType.Name}
                />
                ?
              </Text>
            }
            confirmButton={
              <Button danger onClick={uninstallApp}>
                Uninstall
              </Button>
            }
            onConfirm={uninstallApp}
            onCancel={handleCancel}
            open={isConfirmationVisible}
            contentProps={{
              pad: { left: '0', top: 'xsmall' },
              background: 'transparent',
            }}
          >
            <Text>{uninstallConfirmationInfo}</Text>
          </ConfirmationPrompt>

          {!isConfirmationVisible && (
            <Box
              direction='row'
              justify='between'
              align='center'
              animation={{ type: 'fadeIn', duration: 300 }}
            >
              <Text>
                {canUninstallApps
                  ? 'Uninstalling the app from this cluster will not remove the configuration resources.'
                  : 'For uninstalling this app, you need additional permissions. Please talk to your administrator.'}
              </Text>
              <Button
                secondary
                onClick={handleUninstall}
                unauthorized={!canUninstallApps}
              >
                Uninstall…
              </Button>
            </Box>
          )}
        </>
      )}
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetUninstall;
