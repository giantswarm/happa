import styled from '@emotion/styled';
import * as React from 'react';
import Input from 'UI/Inputs/Input';
import { useUniversalSearch } from 'UniversalSearch/UniversalSearchProvider';
import UniversalSeachSuggestionList from 'UniversalSearch/UniversalSearchSuggestionList';

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
    const { searchTerm, search, searchResults } = useUniversalSearch();

    console.log(searchResults);

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
          aria-activedescendant='opt1'
        />
        <UniversalSeachSuggestionList />
      </SearchWrapper>
    );
  }
);

UniversalSearch.propTypes = {};

export default UniversalSearch;
