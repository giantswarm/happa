import { Box, Form, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { CSSBreakpoints } from 'model/constants';
import { Constants } from 'model/constants';
import React, { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { mq } from 'styles';
import Button from 'UI/Controls/Button';
import RadioInput from 'UI/Inputs/RadioInput';
import TextInput from 'UI/Inputs/TextInput';

import { SubjectTypes } from '../types';

const RadioGroup = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${mq(CSSBreakpoints.Small)} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const RadioGroupLabel = styled(Text)`
  margin-right: 40px;

  ${mq(CSSBreakpoints.Small)} {
    margin-bottom: 10px;
  }
`;

const FormWrapper = styled(Box).attrs({
  width: { max: '880px' },
  pad: { top: 'large', bottom: 'xsmall' },
})``;

const FormGroup = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${mq(CSSBreakpoints.Small)} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Label = styled.label`
  white-space: nowrap;
  font-weight: normal;
  margin: 0;
`;

const InputWrapper = styled(Box)`
  flex: 1;
  margin-left: 20px;
  margin-right: 10px;

  ${mq(CSSBreakpoints.Small)} {
    margin-left: 0;
    margin-right: 0;
    margin-top: 10px;
    margin-bottom: 20px;
  }
`;

interface StyledTextInputProps {
  dark?: boolean;
}

const StyledTextInput = styled(TextInput)<StyledTextInputProps>`
  padding: 7px 9px;
  color: ${({ dark, theme }) =>
    dark ? normalizeColor('text-dim', theme) : 'inherit'};

  &:focus {
    color: inherit;
  }
`;

const GROUP_NAME_PREFIX = 'customer:';
function formatSubjectName(value: string, prefix: string) {
  if (value.startsWith(prefix)) {
    return value;
  }

  return prefix;
}

interface ISubjectFormProps {
  subjectType: SubjectTypes;
  groupName: string;
  userName: string;
  serviceAccountName: string;
  onSubjectTypeChange: (value: SubjectTypes) => void;
  onSubmit: (value: string) => void;
}

const SubjectForm: React.FC<ISubjectFormProps> = ({
  subjectType,
  groupName,
  userName,
  serviceAccountName,
  onSubjectTypeChange,
  onSubmit,
}) => {
  const [userNameValue, setUserNameValue] = useState(userName);
  const [groupNameValue, setGroupNameValue] = useState(
    formatSubjectName(groupName, GROUP_NAME_PREFIX)
  );
  const [serviceAccountNameValue, setServiceAccountNameValue] = useState(
    formatSubjectName(serviceAccountName, Constants.SERVICE_ACCOUNT_PREFIX)
  );

  const groupNameInputRef = useRef<HTMLInputElement>(null);
  const userNameInputRef = useRef<HTMLInputElement>(null);
  const serviceAccountNameInputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (subjectType === SubjectTypes.Group) {
      setTimeout(() => {
        groupNameInputRef.current?.focus();
      });
    } else if (subjectType === SubjectTypes.User) {
      userNameInputRef.current?.focus();
    } else if (subjectType === SubjectTypes.ServiceAccount) {
      serviceAccountNameInputRef.current?.focus();
    }
  }, [subjectType]);

  const handleSubjectTypeChange = (type: SubjectTypes) => () => {
    setGroupNameValue(formatSubjectName(groupName, GROUP_NAME_PREFIX));
    setUserNameValue(userName);
    setServiceAccountNameValue(
      formatSubjectName(serviceAccountName, Constants.SERVICE_ACCOUNT_PREFIX)
    );
    onSubjectTypeChange(type);
  };

  const handleGroupFormSubmit = () => {
    onSubmit(groupNameValue);
  };

  const handleUserFormSubmit = () => {
    onSubmit(userNameValue);
  };

  const handleServiceAccountFormSubmit = () => {
    onSubmit(serviceAccountNameValue);
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupNameValue(formatSubjectName(e.target.value, GROUP_NAME_PREFIX));
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserNameValue(e.target.value);
  };

  const handleServiceAccountNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setServiceAccountNameValue(
      formatSubjectName(e.target.value, Constants.SERVICE_ACCOUNT_PREFIX)
    );
  };

  return (
    <Box
      pad='medium'
      background='background-back'
      round='xsmall'
      margin={{ bottom: 'large' }}
    >
      <RadioGroup>
        <RadioGroupLabel>Show permissions for:</RadioGroupLabel>
        <Box direction='row' gap='large' align='center'>
          <RadioInput
            id='permissions-type-myself'
            label='Myself'
            checked={subjectType === SubjectTypes.Myself}
            name='permissions-type-myself'
            onChange={handleSubjectTypeChange(SubjectTypes.Myself)}
            formFieldProps={{ margin: { bottom: 'none' } }}
          />
          <RadioInput
            id='permissions-type-group'
            label='Group'
            checked={subjectType === SubjectTypes.Group}
            name='permissions-type-group'
            onChange={handleSubjectTypeChange(SubjectTypes.Group)}
            formFieldProps={{ margin: { bottom: 'none' } }}
          />
          <RadioInput
            id='permissions-type-user'
            label='User'
            checked={subjectType === SubjectTypes.User}
            name='permissions-type-user'
            onChange={handleSubjectTypeChange(SubjectTypes.User)}
            formFieldProps={{ margin: { bottom: 'none' } }}
          />
          <RadioInput
            id='permissions-type-service-account'
            label='Service account'
            checked={subjectType === SubjectTypes.ServiceAccount}
            name='permissions-type-service-account'
            onChange={handleSubjectTypeChange(SubjectTypes.ServiceAccount)}
            formFieldProps={{ margin: { bottom: 'none' } }}
          />
        </Box>
      </RadioGroup>

      {subjectType === SubjectTypes.Group && (
        <FormWrapper>
          <Form onSubmit={handleGroupFormSubmit}>
            <FormGroup margin={{ bottom: 'medium' }}>
              <Label htmlFor='groupName'>Group name</Label>
              <InputWrapper>
                <StyledTextInput
                  ref={groupNameInputRef}
                  id='groupName'
                  margin='none'
                  dark={groupNameValue === GROUP_NAME_PREFIX}
                  value={groupNameValue}
                  onChange={handleGroupNameChange}
                  spellCheck={false}
                />
              </InputWrapper>
              <Button
                type='submit'
                disabled={groupNameValue === GROUP_NAME_PREFIX}
              >
                Show permissions
              </Button>
            </FormGroup>
            <Text size='small'>
              The group name refers to a group in your identity provider. Here
              it must be entered exactly as it is used in RoleBinding and
              ClusterRoleBinding resources, so it must be prefixed with{' '}
              <code>customer:</code>
            </Text>
          </Form>
        </FormWrapper>
      )}

      {subjectType === SubjectTypes.User && (
        <FormWrapper>
          <Form onSubmit={handleUserFormSubmit}>
            <FormGroup margin={{ bottom: 'medium' }}>
              <Label htmlFor='userName'>User name</Label>
              <InputWrapper>
                <StyledTextInput
                  ref={userNameInputRef}
                  id='userName'
                  margin='none'
                  value={userNameValue}
                  onChange={handleUserNameChange}
                  spellCheck={false}
                />
              </InputWrapper>
              <Button type='submit' disabled={userNameValue === ''}>
                Show permissions
              </Button>
            </FormGroup>
            <Text size='small'>
              The user name refers to a user as defined in your identity
              provider. It usually takes the form of an email address. Here it
              must match the exact spelling used in RoleBinding and
              ClusterRoleBinding resources, including upper/lower case.
            </Text>
          </Form>
        </FormWrapper>
      )}

      {subjectType === SubjectTypes.ServiceAccount && (
        <FormWrapper>
          <Form onSubmit={handleServiceAccountFormSubmit}>
            <FormGroup margin={{ bottom: 'medium' }}>
              <Label htmlFor='serviceAccountName'>Service account name</Label>
              <InputWrapper>
                <StyledTextInput
                  ref={serviceAccountNameInputRef}
                  id='serviceAccountName'
                  margin='none'
                  dark={
                    serviceAccountNameValue === Constants.SERVICE_ACCOUNT_PREFIX
                  }
                  value={serviceAccountNameValue}
                  onChange={handleServiceAccountNameChange}
                  spellCheck={false}
                />
              </InputWrapper>
              <Button
                type='submit'
                disabled={
                  serviceAccountNameValue === Constants.SERVICE_ACCOUNT_PREFIX
                }
              >
                Show permissions
              </Button>
            </FormGroup>
            <Text size='small'>
              Please enter the service account name including the namespace,
              using a colon as a separator, in the form of{' '}
              <code>system:serviceaccount:NAMESPACE:NAME</code>
            </Text>
          </Form>
        </FormWrapper>
      )}
    </Box>
  );
};

SubjectForm.defaultProps = {
  subjectType: SubjectTypes.Myself,
  groupName: '',
  userName: '',
};

export default SubjectForm;
