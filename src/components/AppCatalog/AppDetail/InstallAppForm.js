import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

import FileInput from './FileInput';
import Input from './Input';

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

// AppFormAbilities is an object that helps us with the form.
// Some apps have special rules about what namespace they are allowed to be in.
// In the future there might be other rules.
// This object is a place to keep this logic.
const AppFormAbilities = appName => {
  let hasFixedNamespace = false;
  let fixedNamespace = '';

  if (appName === 'nginx-ingress-controller-app') {
    hasFixedNamespace = true;
    fixedNamespace = 'kube-system';
  }

  return {
    hasFixedNamespace,
    fixedNamespace,
  };
};

const InstallAppForm = props => {
  const updateName = name => {
    props.onChangeName(name);
  };

  const updateNamespace = namespace => {
    props.onChangeNamespace(namespace);
  };

  const updateValuesYAML = files => {
    props.onChangeValuesYAML(files);
  };

  const updateSecretsYAML = files => {
    props.onChangeSecretsYAML(files);
  };

  return (
    <FormWrapper>
      <Input
        description='What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        hint={<>&nbsp;</>}
        label='Application Name:'
        onChange={updateName}
        validationError={props.nameError}
        value={props.name}
      />

      {formAbilities.hasFixedNamespace ? (
        <Input
          description={
            'This app must be installed in the ' +
            formAbilities.fixedNamespace +
            'namespace'
          }
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
          validationError={props.namespaceError}
          value={props.namespace}
        />
      )}

      <FileInput
        description='Apps can be configured using a values.yaml file. If you have one, you can upload it here already.'
        hint={<>&nbsp;</>}
        label='ConfigMap:'
        onChange={updateValuesYAML}
        validationError={props.valuesYAMLError}
        value={props.valuesYAML}
      />

      <FileInput
        description='Sensitive configuration can be uploaded separately as a secret.'
        hint={<>&nbsp;</>}
        label='Secret:'
        onChange={updateSecretsYAML}
        validationError={props.secretsYAMLError}
        value={props.secretsYAML}
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
  secretsYAMLError: PropTypes.string,
  secretsYAML: PropTypes.object,
  onChangeName: PropTypes.func,
  onChangeNamespace: PropTypes.func,
  onChangeValuesYAML: PropTypes.func,
  onChangeSecretsYAML: PropTypes.func,
};

export default InstallAppForm;
