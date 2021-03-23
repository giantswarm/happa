import { Box, Keyboard } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import TextInput from 'UI/Inputs/TextInput';

const StyledButton = styled(Button)`
  &.btn {
    height: 38px;
    margin-left: 0;
  }
`;

const StyledBox = styled(Box)`
  .button-wrapper {
    margin-right: 0;
  }
`;

const SaveButton = styled(Button)`
  &.btn {
    height: 36px;
    border: 0;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    margin-left: 0;
  }
`;

const StyledLoadingIndicator = styled(LoadingIndicator)`
  display: block;

  img {
    display: inline-block;
    vertical-align: middle;
    width: 24px;
  }
`;

interface IAccessControlSubjectAddFormProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  onAdd: (newValue: string) => void;
  onToggleAdding: () => void;
  onClearError: () => void;
  errorMessage?: string;
  isAdding?: boolean;
  isLoading?: boolean;
}

const AccessControlSubjectAddForm: React.FC<IAccessControlSubjectAddFormProps> = ({
  onAdd,
  onToggleAdding,
  isAdding,
  isLoading,
  errorMessage,
  onClearError,
  ...props
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onAdd((e.target as HTMLFormElement).values.value);
  };

  const handleOnEsc = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    onToggleAdding();
  };

  const handleChange = () => {
    if (errorMessage) {
      onClearError();
    }
  };

  return (
    <Box {...props}>
      {isAdding ? (
        <StyledBox direction='row' gap='small' align='center'>
          <Keyboard onEsc={handleOnEsc}>
            <form onSubmit={handleSubmit}>
              <TextInput
                name='values'
                size='small'
                margin='none'
                contentProps={{
                  width: 'medium',
                  direction: 'row',
                  round: 'xxsmall',
                }}
                readOnly={isLoading}
                autoFocus={true}
                onChange={handleChange}
                error={errorMessage}
              >
                <SaveButton
                  type='submit'
                  bsStyle='primary'
                  disabled={isLoading}
                >
                  OK
                </SaveButton>
              </TextInput>
            </form>
          </Keyboard>
          {isLoading && (
            <StyledLoadingIndicator
              loading={true}
              loadingPosition='right'
              timeout={0}
            />
          )}
        </StyledBox>
      ) : (
        <StyledButton onClick={onToggleAdding}>
          <i className='fa fa-add-circle' />
          Add
        </StyledButton>
      )}
    </Box>
  );
};

AccessControlSubjectAddForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onToggleAdding: PropTypes.func.isRequired,
  onClearError: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  isAdding: PropTypes.bool,
  isLoading: PropTypes.bool,
};

AccessControlSubjectAddForm.defaultProps = {
  errorMessage: '',
  isAdding: false,
  isLoading: false,
};

export default AccessControlSubjectAddForm;
