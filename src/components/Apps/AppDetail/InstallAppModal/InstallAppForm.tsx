import { Box, FormField } from 'grommet';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import { IVersion } from 'UI/Controls/VersionPicker/VersionPickerUtils';
import FileInput from 'UI/Inputs/FileInput';
import TextInput from 'UI/Inputs/TextInput';

interface IInstallAppFormProps {
  appName: string;
  name: string;
  nameError: string;
  namespace: string;
  namespaceError: string;
  valuesYAMLError: string;
  version: string;
  availableVersions: IVersion[];
  secretsYAMLError: string;
  onChangeName: (newName: string) => void;
  onChangeNamespace: (newNS: string) => void;
  onChangeVersion: (newVersion: string) => void;
  onChangeValuesYAML: (files: FileList | null) => void;
  onChangeSecretsYAML: (files: FileList | null) => void;
}

const InstallAppForm: React.FC<IInstallAppFormProps> = ({
  onChangeNamespace,
  onChangeName,
  onChangeValuesYAML,
  onChangeSecretsYAML,
  onChangeVersion,
  appName,
  name,
  nameError,
  version,
  availableVersions,
  namespaceError,
  namespace,
  valuesYAMLError,
  secretsYAMLError,
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

  const updateVersion = (newVersion?: string) => {
    if (typeof newVersion === 'undefined') return;

    onChangeVersion?.(newVersion);
  };

  const updateNamespace = useCallback(
    (newNS) => {
      if (onChangeNamespace) {
        onChangeNamespace(newNS);
      }
    },
    [onChangeNamespace]
  );

  const [formAbilities, setFormAbilities] = useState({
    hasFixedNamespace: false,
    appNamespace: '',
  });

  useEffect(() => {
    let appNamespace = '';

    // Some apps have special rules about what namespace they are allowed to be in.
    if (appName === 'nginx-ingress-controller-app') {
      appNamespace = 'kube-system';
      updateNamespace(appNamespace);
    }

    setFormAbilities({
      hasFixedNamespace: false,
      appNamespace,
    });
  }, [appName, updateNamespace]);

  return (
    <Box direction='column' gap='small'>
      <TextInput
        help='What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        label='Application Name'
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

      {formAbilities.hasFixedNamespace ? (
        <TextInput
          help={`This app must be installed in the ${formAbilities.appNamespace} namespace`}
          key='fixed-namespace'
          label='Namespace'
          id='fixed-namespace'
          readOnly={true}
          value={formAbilities.appNamespace}
          margin={{ bottom: 'large' }}
        />
      ) : (
        <TextInput
          help={
            <>
              We recommend that you create a dedicated namespace. The namespace
              will be created if it doesn&apos;t exist yet.
            </>
          }
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
        help='Apps can be configured using a yaml file with values. If you have one, you can upload it here already.'
        label='User level config values YAML'
        id='user-level-config'
        onChange={updateValuesYAML}
        error={valuesYAMLError}
      />

      <FileInput
        help='Sensitive configuration values can be uploaded separately.'
        label='User level secret values YAML'
        id='user-level-secret'
        onChange={updateSecretsYAML}
        error={secretsYAMLError}
      />
    </Box>
  );
};

InstallAppForm.propTypes = {
  appName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  nameError: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  namespaceError: PropTypes.string.isRequired,
  valuesYAMLError: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  availableVersions: PropTypes.array.isRequired,
  secretsYAMLError: PropTypes.string.isRequired,
  onChangeName: PropTypes.func.isRequired,
  onChangeNamespace: PropTypes.func.isRequired,
  onChangeValuesYAML: PropTypes.func.isRequired,
  onChangeVersion: PropTypes.func.isRequired,
  onChangeSecretsYAML: PropTypes.func.isRequired,
};

export default InstallAppForm;
