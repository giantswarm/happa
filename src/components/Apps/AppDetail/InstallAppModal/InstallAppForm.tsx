import { Box, FormField } from 'grommet';
import React, { useCallback } from 'react';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import { IVersion } from 'UI/Controls/VersionPicker/VersionPickerUtils';
import FileInput from 'UI/Inputs/FileInput';
import TextInput from 'UI/Inputs/TextInput';

interface IInstallAppFormProps {
  name: string;
  nameError: string;
  namespace: string;
  namespaceError: string;
  valuesYAMLError: string;
  version: string;
  availableVersions: IVersion[];
  secretsYAMLError: string;
  isAppBundle?: boolean;
  onChangeName: (newName: string) => void;
  onChangeNamespace: (newNS: string) => void;
  onChangeVersion: (newVersion: string) => void;
  onChangeValuesYAML: (files: FileList | null) => void;
  onChangeSecretsYAML: (files: FileList | null) => void;
}

const InstallAppForm: React.FC<
  React.PropsWithChildren<IInstallAppFormProps>
> = ({
  onChangeNamespace,
  onChangeName,
  onChangeValuesYAML,
  onChangeSecretsYAML,
  onChangeVersion,
  name,
  nameError,
  version,
  availableVersions,
  namespaceError,
  namespace,
  valuesYAMLError,
  secretsYAMLError,
  isAppBundle,
}) => {
  const updateName = (newName: string) => {
    onChangeName?.(newName);
  };

  const updateValuesYAML = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeValuesYAML?.(e.target.files);
  };

  const updateSecretsYAML = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeSecretsYAML?.(e.target.files);
  };

  const handleValuesYAMLFileInputClicked = () => {
    onChangeValuesYAML?.(null);
  };

  const handleSecretsYAMLFileInputClicked = () => {
    onChangeSecretsYAML?.(null);
  };

  const updateVersion = (newVersion?: string) => {
    if (typeof newVersion === 'undefined') return;

    onChangeVersion?.(newVersion);
  };

  const updateNamespace = useCallback(
    (newNS: string) => {
      if (onChangeNamespace) {
        onChangeNamespace(newNS);
      }
    },
    [onChangeNamespace]
  );

  return (
    <Box direction='column' gap='small' height={{ min: 'fit-content' }}>
      <TextInput
        help={
          isAppBundle
            ? 'Must be unique within the management cluster. We recommend to use the name we provide.'
            : 'What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        }
        label='App resource name'
        id='application-name'
        onChange={(e) => updateName(e.target.value)}
        error={nameError}
        value={name}
      />

      <FormField
        label='Chart Version'
        htmlFor='chart-version'
        help='This will determine what version of the app eventually gets installed.'
        contentProps={{
          border: false,
        }}
      >
        <VersionPicker
          onChange={updateVersion}
          selectedVersion={version}
          versions={availableVersions}
        />
      </FormField>

      {isAppBundle ? null : (
        <TextInput
          help='We recommend that you create a dedicated namespace. The namespace will be created if it does not exist yet.'
          key='dedicated-namespace'
          label='Namespace'
          id='dedicated-namespace'
          onChange={(e) => updateNamespace(e.target.value)}
          error={namespaceError}
          value={namespace}
          margin={{ bottom: 'large' }}
        />
      )}

      <FileInput
        help='Apps can be configured using a YAML file with values. If you have one, you can upload it here already.'
        label='User level config values YAML'
        id='user-level-config'
        onChange={updateValuesYAML}
        onClick={handleValuesYAMLFileInputClicked}
        error={valuesYAMLError}
      />

      <FileInput
        help='Sensitive configuration values can be uploaded separately.'
        label='User level secret values YAML'
        id='user-level-secret'
        onChange={updateSecretsYAML}
        onClick={handleSecretsYAMLFileInputClicked}
        error={secretsYAMLError}
      />
    </Box>
  );
};

export default InstallAppForm;
