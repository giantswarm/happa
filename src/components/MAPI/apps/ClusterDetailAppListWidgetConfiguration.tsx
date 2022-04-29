import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import yaml from 'js-yaml';
import { extractErrorMessage } from 'MAPI/utils';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import React from 'react';
import ClusterDetailAppListWidget from 'UI/Display/MAPI/apps/ClusterDetailAppListWidget';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import AppValueConfigurator, {
  AppValueConfiguratorVariant,
} from './AppValueConfigurator';
import { IAppsPermissions } from './permissions/types';
import { ensureConfigMapForApp, ensureSecretForApp } from './utils';

interface IClusterDetailAppListWidgetConfigurationProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailAppListWidget>,
    'title'
  > {
  app?: applicationv1alpha1.IApp;
  appsPermissions?: IAppsPermissions;
}

const ClusterDetailAppListWidgetConfiguration: React.FC<
  IClusterDetailAppListWidgetConfigurationProps
> = ({ app, appsPermissions, ...props }) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  async function ensureAppConfig(values: string) {
    if (!app || !appsPermissions?.canConfigure) return;

    try {
      const contents = yaml.dump(values);
      await ensureConfigMapForApp(
        clientFactory(),
        auth,
        app.metadata.namespace!,
        app.metadata.name,
        contents
      );

      if (typeof app.spec.userConfig?.configMap === 'undefined') {
        new FlashMessage(
          (
            <>
              A ConfigMap containing user level config values for{' '}
              <code>{app.metadata.name}</code> on{' '}
              <code>{app.metadata.namespace}</code> has successfully been
              created.
            </>
          ),
          messageType.SUCCESS,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          (
            <>
              The ConfigMap containing user level config values for{' '}
              <code>{app.metadata.name}</code> on{' '}
              <code>{app.metadata.namespace}</code> has successfully been
              updated.
            </>
          ),
          messageType.SUCCESS,
          messageTTL.LONG
        );
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      if (typeof app.spec.userConfig?.configMap === 'undefined') {
        new FlashMessage(
          'Something went wrong while trying to create a ConfigMap to store your values.',
          messageType.ERROR,
          messageTTL.LONG,
          errorMessage
        );
      } else {
        new FlashMessage(
          'Something went wrong while trying to update the ConfigMap that stores your values.',
          messageType.ERROR,
          messageTTL.LONG,
          errorMessage
        );
      }

      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  async function ensureAppSecret(values: string) {
    if (!app || !appsPermissions?.canConfigure) return;

    try {
      const contents = yaml.dump(values);
      await ensureSecretForApp(
        clientFactory(),
        auth,
        app.metadata.namespace!,
        app.metadata.name,
        contents
      );

      if (typeof app.spec.userConfig?.secret === 'undefined') {
        new FlashMessage(
          (
            <>
              A Secret containing user level secret values for{' '}
              <code>{app.metadata.name}</code> on{' '}
              <code>{app.metadata.namespace!}</code> has successfully been
              created.
            </>
          ),
          messageType.SUCCESS,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          (
            <>
              The Secret containing user level secret values for{' '}
              <code>{app.metadata.name}</code> on{' '}
              <code>{app.metadata.namespace!}</code> has successfully been
              updated.
            </>
          ),
          messageType.SUCCESS,
          messageTTL.LONG
        );
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);

      if (typeof app.spec.userConfig?.secret === 'undefined') {
        new FlashMessage(
          'Something went wrong while trying to create a Secret to store your values.',
          messageType.ERROR,
          messageTTL.LONG,
          errorMessage
        );
      } else {
        new FlashMessage(
          'Something went wrong while trying to update the Secret that stores your values.',
          messageType.ERROR,
          messageTTL.LONG,
          errorMessage
        );
      }

      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  const isLoading =
    typeof app === 'undefined' ||
    typeof appsPermissions?.canConfigure === 'undefined';

  return (
    <ClusterDetailAppListWidget
      title='Configuration'
      contentProps={{ pad: { top: 'small' }, gap: 'xsmall' }}
      {...props}
    >
      <AppValueConfigurator
        configName={app?.spec.userConfig?.configMap?.name ?? ''}
        configNamespace={app?.spec.userConfig?.configMap?.namespace ?? ''}
        isLoading={isLoading}
        variant={AppValueConfiguratorVariant.ConfigMap}
        onUploadConfig={ensureAppConfig}
        onReplaceConfig={ensureAppConfig}
        canConfigureApps={appsPermissions?.canConfigure}
      />
      <AppValueConfigurator
        configName={app?.spec.userConfig?.secret?.name ?? ''}
        configNamespace={app?.spec.userConfig?.secret?.namespace ?? ''}
        isLoading={isLoading}
        variant={AppValueConfiguratorVariant.Secret}
        onUploadConfig={ensureAppSecret}
        onReplaceConfig={ensureAppSecret}
        canConfigureApps={appsPermissions?.canConfigure}
      />
    </ClusterDetailAppListWidget>
  );
};

export default ClusterDetailAppListWidgetConfiguration;
