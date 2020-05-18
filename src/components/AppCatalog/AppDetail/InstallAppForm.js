import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import Input from 'UI/Input';
import VersionPicker from 'UI/VersionPicker/VersionPicker';

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
    fixedNamespace: '',
  });

  useEffect(() => {
    let hasFixedNamespace = false;
    let fixedNamespace = '';

    // Some apps have special rules about what namespace they are allowed to be in.
    if (appName === 'nginx-ingress-controller-app') {
      hasFixedNamespace = true;
      fixedNamespace = 'kube-system';
      updateNamespace(fixedNamespace);
    }

    setFormAbilities({
      hasFixedNamespace,
      fixedNamespace,
    });
  }, [appName, updateNamespace]);

  return (
    <FormWrapper>
      <Input
        description='What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        hint={<>&nbsp;</>}
        label='Application Name:'
        onChange={updateName}
        validationError={nameError}
        value={name}
      />

      <Input
        label='Chart Version:'
        description='This will determine what version of the app eventually gets installed.'
        hint={<>&nbsp;</>}
      >
        <VersionPicker
          onChange={updateVersion}
          selectedVersion={version}
          versions={availableVersions}
        />
      </Input>

      {formAbilities.hasFixedNamespace ? (
        <Input
          key='fixed-namespace'
          description={`This app must be installed in the ${formAbilities.fixedNamespace} namespace`}
          hint={<>&nbsp;</>}
          label='Namespace:'
          value={formAbilities.fixedNamespace}
          readOnly={true}
        />
      ) : (
        <Input
          key='dedicated-namespace'
          description='We recommend that you create a dedicated namespace. The namespace will be created if it doesn’t exist yet.'
          hint={<>&nbsp;</>}
          label='Namespace:'
          onChange={updateNamespace}
          validationError={namespaceError}
          value={namespace}
        />
      )}

      <Input
        description='Apps can be configured using a yaml file with values. If you have one, you can upload it here already.'
        hint={<>&nbsp;</>}
        label='User level config values YAML:'
        onChange={updateValuesYAML}
        validationError={valuesYAMLError}
        value={valuesYAML}
        type='file'
      />

      <Input
        description='Sensitive configuration values can be uploaded separately.'
        hint={<>&nbsp;</>}
        label='User level secret values YAML:'
        onChange={updateSecretsYAML}
        validationError={secretsYAMLError}
        value={secretsYAML}
        type='file'
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
