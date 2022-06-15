import YAMLFileUpload from 'Cluster/ClusterDetail/AppDetailsModal/YAMLFileUpload';
import { Box, Card, CardBody, Text } from 'grommet';
import React from 'react';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';

export enum AppValueConfiguratorVariant {
  ConfigMap,
  Secret,
}

function isConfigValid(configName: string, configNamespace: string) {
  return configName.length > 0 && configNamespace.length > 0;
}

function getTitleLabel(
  variant: AppValueConfiguratorVariant,
  configName: string,
  configNamespace: string
): React.ReactNode {
  const hasConfig = isConfigValid(configName, configNamespace);

  switch (true) {
    case variant === AppValueConfiguratorVariant.ConfigMap && hasConfig:
      return (
        <>
          User-level values are configured via the ConfigMap resource{' '}
          <code>{configName}</code> in namespace <code>{configNamespace}</code>.
        </>
      );

    case variant === AppValueConfiguratorVariant.ConfigMap && !hasConfig:
      return 'No user-level values set';

    case variant === AppValueConfiguratorVariant.Secret && hasConfig:
      return (
        <>
          User-level secret values are configured via the Secret resource{' '}
          <code>{configName}</code> in namespace <code>{configNamespace}</code>.
        </>
      );

    case variant === AppValueConfiguratorVariant.Secret && !hasConfig:
      return 'No user-level secret values set';

    default:
      return '';
  }
}

function getSubtitleLabel(
  variant: AppValueConfiguratorVariant,
  configName: string,
  configNamespace: string,
  canConfigureApps?: boolean
): React.ReactNode {
  const hasConfig = isConfigValid(configName, configNamespace);

  switch (true) {
    case !canConfigureApps:
      return 'For setting those values, you need additional permissions.';

    case variant === AppValueConfiguratorVariant.ConfigMap && hasConfig:
      return 'You can upload a YAML file here to update those values.';

    case variant === AppValueConfiguratorVariant.ConfigMap && !hasConfig:
      return 'You can upload a YAML file here to use as user-level values.';

    case variant === AppValueConfiguratorVariant.Secret && hasConfig:
      return 'You can upload a YAML file here to update those values.';

    case variant === AppValueConfiguratorVariant.Secret && !hasConfig:
      return 'You can upload a YAML file here to use as secret values.';

    default:
      return '';
  }
}

function getButtonLabel(
  variant: AppValueConfiguratorVariant,
  configName: string,
  configNamespace: string
): string {
  const hasConfig = isConfigValid(configName, configNamespace);

  switch (true) {
    case variant === AppValueConfiguratorVariant.ConfigMap && hasConfig:
      return 'Replace values';

    case variant === AppValueConfiguratorVariant.ConfigMap && !hasConfig:
      return 'Upload values';

    case variant === AppValueConfiguratorVariant.Secret && hasConfig:
      return 'Replace secret values';

    case variant === AppValueConfiguratorVariant.Secret && !hasConfig:
      return 'Upload secret values';

    default:
      return '';
  }
}

function getButtonIcon(
  variant: AppValueConfiguratorVariant,
  _configName: string,
  _configNamespace: string
): string {
  if (variant === AppValueConfiguratorVariant.Secret) return 'fa fa-lock';

  return 'fa fa-settings';
}

interface IAppValueConfiguratorProps
  extends React.ComponentPropsWithoutRef<typeof Card> {
  configName: string;
  configNamespace: string;
  variant?: AppValueConfiguratorVariant;
  onUploadConfig?: (values: string) => Promise<void>;
  onReplaceConfig?: (values: string) => Promise<void>;
  isLoading?: boolean;
  canConfigureApps?: boolean;
}

const AppValueConfigurator: React.FC<
  React.PropsWithChildren<IAppValueConfiguratorProps>
> = ({
  configName,
  configNamespace,
  canConfigureApps,
  isLoading,
  onUploadConfig,
  onReplaceConfig,
  variant,
  ...props
}) => {
  const hasConfig = isConfigValid(configName, configNamespace);

  const handleFileUpload = async (values: string, cb: () => void) => {
    if (hasConfig) {
      await onReplaceConfig?.(values);
    } else {
      await onUploadConfig?.(values);
    }

    cb();
  };

  return (
    <Card
      direction='row'
      elevation='none'
      background='background-contrast'
      round='xsmall'
      pad='medium'
      {...props}
    >
      <CardBody direction='row' justify='between' align='center' wrap={true}>
        <Box>
          {isLoading ? (
            <Box gap='small' direction='column'>
              <LoadingPlaceholder width={400} height={15} />
              <LoadingPlaceholder width={300} height={15} />
            </Box>
          ) : (
            <>
              <Text weight='bold'>
                {getTitleLabel(variant!, configName, configNamespace)}
              </Text>
              <Text color='text-weak'>
                {getSubtitleLabel(
                  variant!,
                  configName,
                  configNamespace,
                  canConfigureApps
                )}
              </Text>
            </>
          )}
        </Box>
        <Box>
          {isLoading ? (
            <LoadingPlaceholder width={150} height={36} />
          ) : (
            <YAMLFileUpload
              icon={
                <i
                  className={getButtonIcon(
                    variant!,
                    configName,
                    configNamespace
                  )}
                  role='presentation'
                  aria-hidden='true'
                />
              }
              buttonText={getButtonLabel(variant!, configName, configNamespace)}
              onInputChange={handleFileUpload}
              unauthorized={!canConfigureApps}
            />
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

AppValueConfigurator.defaultProps = {
  isLoading: false,
  variant: AppValueConfiguratorVariant.ConfigMap,
};

export default AppValueConfigurator;
