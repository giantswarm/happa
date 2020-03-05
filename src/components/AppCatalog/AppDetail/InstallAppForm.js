import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import VersionPicker from 'UI/VersionPicker/VersionPicker';

import FileInput from './FileInput';
import Input from './Input';

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
  const updateName = newName => {
    if (onChangeName) {
      onChangeName(newName);
    }
  };

  const updateValuesYAML = files => {
    if (onChangeValuesYAML) {
      onChangeValuesYAML(files);
    }
  };

  const updateSecretsYAML = files => {
    if (onChangeSecretsYAML) {
      onChangeSecretsYAML(files);
    }
  };

  const updateVersion = newVersion => {
    if (onChangeVersion) {
      onChangeVersion(newVersion);
    }
  };

  const updateNamespace = useCallback(
    newNS => {
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
      updateNamespace('kube-system');
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
          description={`This app must be installed in the ${formAbilities.fixedNamespace} namespace`}
          hint={<>&nbsp;</>}
          label='Namespace:'
          value={formAbilities.fixedNamespace}
          readOnly={true}
        />
      ) : (
        <Input
          description='We recommend that you create a dedicated namespace. The namespace will be created if it doesn’t exist yet.'
          hint={<>&nbsp;</>}
          label='Namespace:'
          onChange={updateNamespace}
          validationError={namespaceError}
          value={namespace}
        />
      )}

      <FileInput
        description='Apps can be configured using a values.yaml file. If you have one, you can upload it here already.'
        hint={<>&nbsp;</>}
        label='ConfigMap:'
        onChange={updateValuesYAML}
        validationError={valuesYAMLError}
        value={valuesYAML}
      />

      <FileInput
        description='Sensitive configuration can be uploaded separately as a secret.'
        hint={<>&nbsp;</>}
        label='Secret:'
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
