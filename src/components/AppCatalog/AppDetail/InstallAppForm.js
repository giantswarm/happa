import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import FileInput from 'UI/Inputs/FileInput';
import Input from 'UI/Inputs/Input';
import TextInput from 'UI/Inputs/TextInput';

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

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
  valuesYAML,
  valuesYAMLError,
  secretsYAML,
  secretsYAMLError,
}) => {
  const updateName = (newName) => {
    if (onChangeName) {
      onChangeName(newName);
    }
  };

  const updateValuesYAML = (files) => {
    if (onChangeValuesYAML) {
      onChangeValuesYAML(files);
    }
  };

  const updateSecretsYAML = (files) => {
    if (onChangeSecretsYAML) {
      onChangeSecretsYAML(files);
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
    <FormWrapper>
      <TextInput
        help='What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        label='Application Name:'
        onChange={(e) => updateName(e.target.value)}
        error={nameError}
        value={name}
        margin={{ bottom: 'large' }}
      />

      <Input
        label='Chart Version:'
        description='This will determine what version of the app eventually gets installed.'
      >
        <VersionPicker
          onChange={updateVersion}
          selectedVersion={version}
          versions={availableVersions}
        />
      </Input>

      {formAbilities.hasFixedNamespace ? (
        <TextInput
          help={`This app must be installed in the ${formAbilities.fixedNamespace} namespace`}
          key='fixed-namespace'
          label='Namespace:'
          readOnly={true}
          value={formAbilities.fixedNamespace}
          margin={{ bottom: 'large' }}
        />
      ) : (
        <TextInput
          help='We recommend that you create a dedicated namespace. The namespace will be created if it doesn’t exist yet.'
          key='dedicated-namespace'
          label='Namespace:'
          onChange={(e) => updateNamespace(e.target.value)}
          error={namespaceError}
          value={namespace}
          margin={{ bottom: 'large' }}
        />
      )}

      <FileInput
        description='Apps can be configured using a yaml file with values. If you have one, you can upload it here already.'
        label='User level config values YAML:'
        onChange={updateValuesYAML}
        validationError={valuesYAMLError}
        value={valuesYAML}
      />

      <FileInput
        description='Sensitive configuration values can be uploaded separately.'
        label='User level secret values YAML:'
        onChange={updateSecretsYAML}
        validationError={secretsYAMLError}
        value={secretsYAML}
      />
    </FormWrapper>
  );
};

InstallAppForm.propTypes = {
  appName: PropTypes.string,
  name: PropTypes.string,
  nameError: PropTypes.string,
  namespace: PropTypes.string,
  namespaceError: PropTypes.string,
  valuesYAMLError: PropTypes.string,
  valuesYAML: PropTypes.object,
  version: PropTypes.string,
  availableVersions: PropTypes.array,
  secretsYAMLError: PropTypes.string,
  secretsYAML: PropTypes.object,
  onChangeName: PropTypes.func,
  onChangeNamespace: PropTypes.func,
  onChangeValuesYAML: PropTypes.func,
  onChangeVersion: PropTypes.func,
  onChangeSecretsYAML: PropTypes.func,
};

export default InstallAppForm;
