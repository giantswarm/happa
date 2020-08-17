import styled from '@emotion/styled';
import useDebounce from 'lib/effects/useDebounce';
import * as React from 'react';
import { useState } from 'react';
import Input from 'UI/Inputs/Input';
import { useUniversalSearch } from 'UniversalSearch/UniversalSearchProvider';
import UniversalSearchSuggestionList from 'UniversalSearch/UniversalSearchSuggestionList';

const UPDATE_DEBOUNCE_DELAY_MS = 250;

const SearchWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
  position: relative;
  line-height: initial;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
`;

const StyledInput = styled(Input)`
  width: 100%;
  margin-bottom: 0;
`;

const ClearButton = styled.div<{ isVisible?: boolean }>`
  position: absolute;
  z-index: 9;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto 0;
  padding: ${({ theme }) => theme.spacingPx * 2}px;
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.spacingPx * 5}px;
  user-select: none;
  opacity: ${({ isVisible, theme }) => (isVisible ? theme.disabledOpacity : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'all' : 'none')};
  transition: opacity 0.115s ease-out;
  will-change: opacity;

  &:hover {
    opacity: 1;
  }

  &:active {
    opacity: 0.4;
  }
`;

interface IUniversalSearchProps extends React.ComponentPropsWithoutRef<'div'> {}

const UniversalSearch: React.FC<IUniversalSearchProps> = React.memo(
  ({ ...rest }) => {
    const { searchTerm, search, searchResults, filters } = useUniversalSearch();
    const debouncedSearchTerm = useDebounce(
      searchTerm,
      UPDATE_DEBOUNCE_DELAY_MS
    );
    const debouncedResults = useDebounce(
      searchResults,
      UPDATE_DEBOUNCE_DELAY_MS
    );

    const [isFocused, setIsFocused] = useState(false);

    const getIsOpened = () => {
      if (debouncedSearchTerm.length > 0 && isFocused) {
        return true;
      }

      if (debouncedSearchTerm.length < 1 || !isFocused) {
        return false;
      }

      return false;
    };

    const handleBlur = () => {
      setTimeout(() => {
        setIsFocused(false);
      }, UPDATE_DEBOUNCE_DELAY_MS);
    };

    const handleClear = () => {
      search('');
    };

    const isOpened = getIsOpened();

    return (
      <SearchWrapper {...rest}>
        <InputWrapper>
          <StyledInput
            icon='search'
            hint={<>&#32;</>}
            onChange={search}
            value={searchTerm}
            placeholder={`I'm looking for...`}
            autoComplete='off'
            autoCapitalize='off'
            spellCheck='false'
            role='combobox'
            aria-haspopup={isOpened ? 'true' : 'false'}
            aria-autocomplete='list'
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
          />
          <ClearButton
            role='button'
            onClick={handleClear}
            isVisible={searchTerm.length > 0}
          >
            <i className='fa fa-close' />
          </ClearButton>
        </InputWrapper>
        <UniversalSearchSuggestionList
          searchResults={debouncedResults}
          searchTerm={debouncedSearchTerm}
          filters={filters}
          isOpened={isOpened}
          onResultClick={handleClear}
        />
      </SearchWrapper>
    );
  }
);

UniversalSearch.propTypes = {};

export default UniversalSearch;
