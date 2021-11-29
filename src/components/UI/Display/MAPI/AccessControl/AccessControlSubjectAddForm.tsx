import { Box, Keyboard } from 'grommet';
import {
  appendSubjectSuggestionToValue,
  filterSubjectSuggestions,
  parseSubjects,
} from 'MAPI/organizations/AccessControl/utils';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import TextInput from 'UI/Inputs/TextInput';
import useDebounce from 'utils/hooks/useDebounce';

const VISIBLE_SUGGESTION_COUNT = 10;
const FILTER_DEBOUNCE_RATE = 250;

const SaveButton = styled(Button)`
  border-start-start-radius: 0;
  border-start-end-radius: 2px;
  border-end-start-radius: 0;
  border-end-end-radius: 2px;
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
  onAdd: (newValue: string[]) => void;
  onToggleAdding: () => void;
  onClearError: () => void;
  suggestions?: string[];
  errorMessage?: string;
  isAdding?: boolean;
  isLoading?: boolean;
}

const AccessControlSubjectAddForm: React.FC<
  IAccessControlSubjectAddFormProps
> = ({
  onAdd,
  onToggleAdding,
  isAdding,
  isLoading,
  errorMessage,
  onClearError,
  suggestions,
  ...props
}) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, FILTER_DEBOUNCE_RATE);
  const [visibleSuggestions, setVisibleSuggestions] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newValue = parseSubjects(value);
    onAdd(newValue);
  };

  const handleOnEsc = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    onToggleAdding();
  };

  const handleChangeSuggestions = (
    currentValue: string,
    suggestionCollection: string[]
  ) => {
    const newSuggestions = filterSubjectSuggestions(
      currentValue,
      suggestionCollection,
      VISIBLE_SUGGESTION_COUNT
    );
    setVisibleSuggestions(newSuggestions);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);

    if (errorMessage) {
      onClearError();
    }
  };

  const handleSuggestionSelect: React.ComponentPropsWithoutRef<
    typeof TextInput
  >['onSuggestionSelect'] = (e) => {
    const newValue = appendSubjectSuggestionToValue(value, e.suggestion);
    setValue(newValue);
  };

  useEffect(() => {
    if (suggestions) {
      handleChangeSuggestions(debouncedValue, suggestions);
    }
  }, [debouncedValue, suggestions]);

  useLayoutEffect(() => {
    if (!isAdding) {
      setValue('');

      if (errorMessage) {
        onClearError();
      }
    }
  }, [errorMessage, isAdding, onClearError]);

  return (
    <Box {...props}>
      {isAdding ? (
        <Box
          direction='row'
          gap='small'
          align='center'
          width={{ max: 'medium' }}
        >
          <Keyboard onEsc={handleOnEsc}>
            <form onSubmit={handleSubmit} aria-label='Subjects to add'>
              <TextInput
                name='values'
                id='values'
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
                value={value}
                error={errorMessage}
                placeholder='e.g. subject1, subject2, subject3'
                onSuggestionSelect={handleSuggestionSelect}
                suggestions={visibleSuggestions}
                spellCheck={false}
              >
                <SaveButton type='submit' primary={true} disabled={isLoading}>
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
        </Box>
      ) : (
        <Button
          onClick={onToggleAdding}
          icon={<i className='fa fa-add-circle' />}
        >
          Add
        </Button>
      )}
    </Box>
  );
};

AccessControlSubjectAddForm.defaultProps = {
  errorMessage: '',
  isAdding: false,
  isLoading: false,
};

export default AccessControlSubjectAddForm;
