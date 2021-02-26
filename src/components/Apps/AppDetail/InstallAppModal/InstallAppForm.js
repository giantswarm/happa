import { Box, FormField } from 'grommet';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import FileInput from 'UI/Inputs/FileInput';
import TextInput from 'UI/Inputs/TextInput';

const InstallAppForm = ({
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
  const updateName = (newName) => {
    if (onChangeName) {
      onChangeName(newName);
    }
  };

  const updateValuesYAML = (e) => {
    if (onChangeValuesYAML) {
      onChangeValuesYAML(e.target.files);
    }
  };

  const updateSecretsYAML = (e) => {
    if (onChangeSecretsYAML) {
      onChangeSecretsYAML(e.target.files);
    }
  };

  const updateVersion = (newVersion) => {
    if (onChangeVersion) {
      onChangeVersion(newVersion);
    }
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
    const hasFixedNamespace = false;
    let appNamespace = '';

    // Some apps have special rules about what namespace they are allowed to be in.
    if (appName === 'nginx-ingress-controller-app') {
      appNamespace = 'kube-system';
      updateNamespace(appNamespace);
    }

    setFormAbilities({
      hasFixedNamespace,
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
          id='chart-version'
          onChange={updateVersion}
          selectedVersion={version}
          versions={availableVersions}
        />
      </FormField>

      {formAbilities.hasFixedNamespace ? (
        <TextInput
          help={`This app must be installed in the ${formAbilities.fixedNamespace} namespace`}
          key='fixed-namespace'
          label='Namespace'
          id='fixed-namespace'
          readOnly={true}
          value={formAbilities.fixedNamespace}
          margin={{ bottom: 'large' }}
        />
      ) : (
        <TextInput
          help='We recommend that you create a dedicated namespace. The namespace will be created if it doesn’t exist yet.'
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
  appName: PropTypes.string,
  name: PropTypes.string,
  nameError: PropTypes.string,
  namespace: PropTypes.string,
  namespaceError: PropTypes.string,
  valuesYAMLError: PropTypes.string,
  version: PropTypes.string,
  availableVersions: PropTypes.array,
  secretsYAMLError: PropTypes.string,
  onChangeName: PropTypes.func,
  onChangeNamespace: PropTypes.func,
  onChangeValuesYAML: PropTypes.func,
  onChangeVersion: PropTypes.func,
  onChangeSecretsYAML: PropTypes.func,
};

export default InstallAppForm;
