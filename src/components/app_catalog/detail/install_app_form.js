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
        description='What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        hint={<React.Fragment>&nbsp;</React.Fragment>}
        label='Application Name:'
        onChange={updateName}
        validationError={props.nameError}
        value={props.name}
      />

      <Input
        description='We recommend that you create a dedicated namespace. The namespace will be created if it doesn’t exist yet.'
        hint={<React.Fragment>&nbsp;</React.Fragment>}
        label='Namespace:'
        onChange={updateNamespace}
        validationError={props.namespaceError}
        value={props.namespace}
      />

      <FileInput
        description='Apps can be configured using a values.yaml file. If you have one, you can upload it here already.'
        hint={<React.Fragment>&nbsp;</React.Fragment>}
        label='User Configuration ConfigMap:'
        onChange={updateValuesYAML}
        validationError={props.valuesYAMLError}
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
