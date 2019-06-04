import FileInput from './fileinput';
import Input from './input';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const FormWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

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

  return (
    <FormWrapper>
      <Input
        label='Application Name:'
        description='What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        onChange={updateName}
        validationError={props.nameError}
        hint={<React.Fragment>&nbsp;</React.Fragment>}
        value={props.name}
      />

      <Input
        label='Namespace:'
        description='We recommend that you create a dedicated namespace. The namespace will be created if it doesn’t exist yet.'
        onChange={updateNamespace}
        validationError={props.namespaceError}
        hint={<React.Fragment>&nbsp;</React.Fragment>}
        value={props.namespace}
      />

      <FileInput
        label='User Configuration Configmap:'
        description='Apps can be configured using a values.yaml file. If you have one already, you can upload it here already.'
        onChange={updateValuesYAML}
        validationError={props.valuesYAMLError}
        hint={<React.Fragment>&nbsp;</React.Fragment>}
        value={props.valuesYAML}
      />
    </FormWrapper>
  );
};

InstallAppForm.propTypes = {
  name: PropTypes.string,
  nameError: PropTypes.string,
  namespace: PropTypes.string,
  namespaceError: PropTypes.string,
  valuesYAMLError: PropTypes.string,
  valuesYAML: PropTypes.string,
  onChangeName: PropTypes.func,
  onChangeNamespace: PropTypes.func,
  onChangeValuesYAML: PropTypes.func,
};

export default InstallAppForm;
