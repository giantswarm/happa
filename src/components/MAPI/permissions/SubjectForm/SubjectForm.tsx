import { Box, Form, Text } from 'grommet';
import { CSSBreakpoints } from 'model/constants';
import React, { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { mq } from 'styles';
import Button from 'UI/Controls/Button';
import RadioInput from 'UI/Inputs/RadioInput';
import TextInput from 'UI/Inputs/TextInput';

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
  color: ${({ dark, theme }) => (dark ? theme.colors.darkGray : 'inherit')};

  &:focus {
    color: inherit;
  }
`;

export enum SubjectType {
  Myself = 'MYSELF',
  Group = 'GROUP',
  User = 'USER',
}

const GROUP_NAME_PREFIX = 'customer:';
function formatGroupName(value: string) {
  if (value.startsWith(GROUP_NAME_PREFIX)) {
    return value;
  }

  return GROUP_NAME_PREFIX;
}

interface ISubjectFormProps {
  subjectType: SubjectType;
  groupName: string;
  userName: string;
  onSubjectTypeChange: (value: SubjectType) => void;
  onSubmit: (value: string) => void;
}

const SubjectForm: React.FC<ISubjectFormProps> = ({
  subjectType,
  groupName,
  userName,
  onSubjectTypeChange,
  onSubmit,
}) => {
  const [userNameValue, setUserNameValue] = useState(userName);
  const [groupNameValue, setGroupNameValue] = useState(
    formatGroupName(groupName)
  );

  const groupNameInputRef = useRef<HTMLInputElement>(null);
  const userNameInputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (subjectType === SubjectType.Group) {
      setTimeout(() => {
        groupNameInputRef.current?.focus();
      });
    } else if (subjectType === SubjectType.User) {
      userNameInputRef.current?.focus();
    }
  }, [subjectType]);

  const handleSubjectTypeChange = (type: SubjectType) => () => {
    setGroupNameValue(formatGroupName(groupName));
    setUserNameValue(userName);
    onSubjectTypeChange(type);
  };

  const handleGroupFormSubmit = () => {
    onSubmit(groupNameValue);
  };

  const handleUserFormSubmit = () => {
    onSubmit(userNameValue);
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupNameValue(formatGroupName(e.target.value));
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserNameValue(e.target.value);
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
            checked={subjectType === SubjectType.Myself}
            name='permissions-type-myself'
            onChange={handleSubjectTypeChange(SubjectType.Myself)}
            formFieldProps={{ margin: { bottom: 'none' } }}
          />
          <RadioInput
            id='permissions-type-group'
            label='Group'
            checked={subjectType === SubjectType.Group}
            name='permissions-type-group'
            onChange={handleSubjectTypeChange(SubjectType.Group)}
            formFieldProps={{ margin: { bottom: 'none' } }}
          />
          <RadioInput
            id='permissions-type-user'
            label='User'
            checked={subjectType === SubjectType.User}
            name='permissions-type-user'
            onChange={handleSubjectTypeChange(SubjectType.User)}
            formFieldProps={{ margin: { bottom: 'none' } }}
          />
        </Box>
      </RadioGroup>

      <Box width={{ max: '880px' }}>
        {subjectType === SubjectType.Group && (
          <Form onSubmit={handleGroupFormSubmit}>
            <FormGroup pad={{ top: 'large' }} margin={{ bottom: 'medium' }}>
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
              <Button type='submit'>Show permissions</Button>
            </FormGroup>
            <Text size='small'>
              The group name refers to a group in your identity provider. Here
              it must be entered exactly as it is used in RoleBinding and
              ClusterRoleBinding resources, so it must be prefixed with{' '}
              <code>customer:</code>
            </Text>
          </Form>
        )}

        {subjectType === SubjectType.User && (
          <Form onSubmit={handleUserFormSubmit}>
            <FormGroup pad={{ top: 'large' }} margin={{ bottom: 'medium' }}>
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
              <Button type='submit'>Show permissions</Button>
            </FormGroup>
            <Text size='small'>
              The user name refers to a user as defined in your identity
              provider. It usually takes the form of an email address. Here it
              must match the exact spelling used in RoleBinding and
              ClusterRoleBinding resources, including upper/lower case.
            </Text>
          </Form>
        )}
      </Box>
    </Box>
  );
};

SubjectForm.defaultProps = {
  subjectType: SubjectType.Myself,
  groupName: '',
  userName: '',
};

export default SubjectForm;
