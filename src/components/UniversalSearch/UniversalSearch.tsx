import styled from '@emotion/styled';
import useDebounce from 'lib/effects/useDebounce';
import * as React from 'react';
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
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
  position: relative;
`;

const StyledInput = styled(Input)`
  width: 100%;
  max-width: 800px;
  margin-bottom: 0;
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

    return (
      <SearchWrapper {...rest}>
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
          aria-haspopup='true'
          aria-autocomplete='list'
        />
        <UniversalSearchSuggestionList
          searchResults={debouncedResults}
          searchTerm={debouncedSearchTerm}
          filters={filters}
        />
      </SearchWrapper>
    );
  }
);

UniversalSearch.propTypes = {};

export default UniversalSearch;
