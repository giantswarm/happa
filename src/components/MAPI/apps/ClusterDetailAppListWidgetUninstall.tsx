import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { extractErrorMessage } from 'MAPI/utils';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React, { useState } from 'react';
import { mutate } from 'swr';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';

import { deleteAppWithName } from './utils';

interface IClusterDetailAppListWidgetUninstallProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  onAppUninstalled?: () => void;
}

const ClusterDetailAppListWidgetUninstall: React.FC<IClusterDetailAppListWidgetUninstallProps> = ({
  app,
  onAppUninstalled,
  ...props
}) => {
  const auth = useAuthProvider();
  const appClient = useHttpClient();

  const uninstallApp = async () => {
    if (!app) return;

    try {
      await deleteAppWithName(
        appClient,
        auth,
        app.metadata.namespace!,
        app.metadata.name
      );

      mutate(
        applicationv1alpha1.getAppListKey({ namespace: app.metadata.namespace })
      );

      if (onAppUninstalled) onAppUninstalled();

      new FlashMessage(
        `App <code>${app.metadata.name}</code> will be uninstalled from cluster <code>${app.metadata.namespace}</code>.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      ErrorReporter.getInstance().notify(err);

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
                Are you sure you want to uninstall {app.metadata.name} from
                cluster{' '}
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
          />

          {!isConfirmationVisible && (
            <Box
              direction='row'
              justify='between'
              align='center'
              animation={{ type: 'fadeIn', duration: 300 }}
            >
              <Text>
                Uninstalling the app from this cluster will not remove the
                configuration resources.
              </Text>
              <Button secondary onClick={handleUninstall}>
                Uninstall...
              </Button>
            </Box>
          )}
        </>
      )}
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetUninstall;
