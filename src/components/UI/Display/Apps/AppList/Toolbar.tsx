import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import TextInput from 'UI/Inputs/TextInput';

import SortingDropdown from './SortingDropdown';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;
const Search = styled.div`
  display: flex;
  align-items: center;
`;

const SearchInput = styled(TextInput)`
  width: 280px;
`;

const StyledSortingDropdown = styled(SortingDropdown)`
  margin-left: 8px;
`;

const Sort = styled.div`
  display: flex;
  align-items: center;
`;

function matchCountMessage(count: number) {
  if (count === 1) {
    return `Showing 1 app matching your query`;
  }

  if (count > 1) {
    return `Showing ${count} apps matching your query`;
  }

  // Anything less than 1, or non numbers
  return 'No apps match your query';
}

interface IToolbarProps {
  matchCount: number;
  onChangeSearchQuery: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchQuery: string;
  onChangeSortOrder: (value: string) => void;
  sortOrder: string;
}

const Toolbar: React.FC<IToolbarProps> = (props) => {
  return (
    <Wrapper>
      <Search>
        <SearchInput
          value={props.searchQuery}
          onChange={props.onChangeSearchQuery}
          data-testid='app-search-input'
          margin={{ bottom: 'none', right: 'small' }}
        />
        {matchCountMessage(props.matchCount)}
      </Search>

      <Sort>
        Sort by{' '}
        <StyledSortingDropdown
          value={props.sortOrder}
          setSortingOrder={props.onChangeSortOrder}
        />
      </Sort>
    </Wrapper>
  );
};

Toolbar.propTypes = {
  matchCount: PropTypes.number.isRequired,
  onChangeSearchQuery: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onChangeSortOrder: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
};

export default Toolbar;
