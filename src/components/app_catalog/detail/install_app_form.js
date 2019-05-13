import Input from './input';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const FormWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const InstallAppForm = (props) => {
  const updateName = (name) => {
    props.onChangeName(name);
  };

  const updateNamespace = (namespace) => {
    props.onChangeNamespace(namespace);
  };

  return (
    <FormWrapper>
      <Input
        label='Application Name:'
        description='What do you want to call this app? If you want to run multiple apps then this is how you will be able to tell them apart.'
        onChange={updateName}
        value={props.name}
      />

      <Input
        label='Namespace:'
        description='We recommend that you create a dedicated namespace. The namespace will be created if it doesn’t exist yet.'
        onChange={updateNamespace}
        value={props.namespace}
      />
    </FormWrapper>
  );
};

InstallAppForm.propTypes = {
  name: PropTypes.string,
  namespace: PropTypes.string,
  onChangeName: PropTypes.func,
  onChangeNamespace: PropTypes.func
};

export default InstallAppForm;
